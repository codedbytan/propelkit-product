import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { z } from "zod";
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// 🔒 Input validation
const verifySchema = z.object({
    orderCreationId: z.string().min(1, "Order ID required"),
    razorpayPaymentId: z.string().min(1, "Payment ID required"),
    razorpaySignature: z.string().min(1, "Signature required"),
    planKey: z.enum(["starter_lifetime", "pro_lifetime"])
});

export async function POST(req: Request) {
    try {
        // 1. Parse and validate input
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const validation = verifySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Invalid payment data"
            }, { status: 400 });
        }

        const { orderCreationId, razorpayPaymentId, razorpaySignature, planKey } = validation.data;

        console.log("Verifying payment:", razorpayPaymentId);

        // 2. Verify Razorpay Signature
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            console.error("Signature mismatch!");
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // 3. Get authenticated user
        const { createClient: createServerClient } = await import("@/lib/supabase-server");
        const supabaseUserClient = await createServerClient();
        const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 4. Check for duplicate processing
        const { data: existingLicense } = await supabaseAdmin
            .from("licenses")
            .select("id")
            .eq("user_id", user.id)
            .eq("plan_key", planKey)
            .maybeSingle();

        if (existingLicense) {
            console.log("License already exists for this user and plan");
            return NextResponse.json({
                success: true,
                message: "License already activated"
            });
        }

        // 5. Validate plan pricing
        const prices: Record<string, number> = {
            "starter_lifetime": 2999,
            "pro_lifetime": 5999,
        };
        const expectedAmount = prices[planKey];

        // 6. Generate License Key
        const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const planName = planKey.includes("pro") ? "PRO" : "STARTER";
        const licenseKey = `ACME-${planName}-${new Date().getFullYear()}-${shortId}`;

        // 7. Calculate GST
        const totalAmountPaid = expectedAmount;
        const taxRate = 0.18;
        const taxableAmount = totalAmountPaid / (1 + taxRate);

        const gstCalculator = new GSTCalculator({
            sellerStateCode: "08", // 💡 CUSTOMIZE: Your state
            sellerGSTIN: "YOUR_GSTIN_HERE", // 💡 CUSTOMIZE: Your GSTIN
        });

        const taxResult = gstCalculator.calculate(
            { stateCode: "08" },
            [{
                description: `Acme SaaS ${planName} Lifetime License`,
                sacCode: SAC_CODE_SAAS,
                unitPrice: taxableAmount,
                quantity: 1
            }]
        );

        // 8. Database Transaction: Insert License + Invoice
        const { error: licenseError } = await supabaseAdmin.from("licenses").insert({
            user_id: user.id,
            plan_key: planKey,
            license_key: licenseKey,
            status: "active"
        });

        if (licenseError) {
            console.error("License Insert Error:", licenseError);
            throw new Error("Failed to create license");
        }

        const { error: invoiceError } = await supabaseAdmin.from("invoices").insert({
            id: razorpayPaymentId,
            user_id: user.id,
            amount: totalAmountPaid * 100, // Store in paise
            status: "paid",
            currency: "INR"
        });

        if (invoiceError) {
            console.error("Invoice Insert Error:", invoiceError);
        }

        // 9. Generate and Send Invoice (non-blocking)
        try {
            if (process.env.RESEND_API_KEY) {
                const pdfBuffer = await generateInvoicePDF({
                    invoiceNumber: taxResult.invoiceNumberSuggestion,
                    date: new Date(),
                    customerName: user.user_metadata?.full_name || "Valued Customer",
                    customerAddress: "Not Provided",
                    taxResult: taxResult,
                    description: `Acme SaaS ${planName} Lifetime License`
                });
                await sendInvoiceEmail(user.email, pdfBuffer, taxResult.invoiceNumberSuggestion);
            }
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            // Don't fail the request if email fails
        }

        // 10. Audit log
        await supabaseAdmin.from("audit_logs").insert({
            user_id: user.id,
            action: "license_activated",
            details: {
                payment_id: razorpayPaymentId,
                plan: planKey,
                license_key: licenseKey
            }
        });

        return NextResponse.json({ success: true, licenseKey });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({
            error: "Payment verification failed. Please contact support."
        }, { status: 500 });
    }
}
