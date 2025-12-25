import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
// 👇 Import your new engines
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";

// ⚠️ IMPORTANT: Ensure SUPABASE_SERVICE_ROLE_KEY is in your .env.local
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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderCreationId, razorpayPaymentId, razorpaySignature, planKey } = body;

        console.log("Verifying payment for:", razorpayPaymentId);

        // 1. Verify Signature (Security Check)
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            console.error("Signature mismatch!");
            return NextResponse.json({ error: "Transaction invalid" }, { status: 400 });
        }

        // 2. Get User Session
        // We use the dynamic import to avoid static generation errors in some Next.js versions
        const { createClient: createServerClient } = await import("@/lib/supabase-server");
        const supabaseUserClient = await createServerClient();
        const { data: { user } } = await supabaseUserClient.auth.getUser();

        if (!user || !user.email) {
            console.error("No user authenticated.");
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // 3. Generate License Key
        const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const planName = planKey.includes("agency") ? "AGENCY" : "STARTER";
        const licenseKey = `PK-${planName}-${new Date().getFullYear()}-${shortId}`;

        // 4. Calculate Taxes (Backwards from Total Paid)
        // We assume the amount paid (e.g. 3999) is INCLUSIVE of tax.
        const totalAmountPaid = planKey.includes("agency") ? 9999 : 3999;
        const taxRate = 0.18;
        const taxableAmount = totalAmountPaid / (1 + taxRate);

        const gstCalculator = new GSTCalculator({
            sellerStateCode: "08", // Rajasthan
            sellerGSTIN: "08AAAAA0000A1Z5",
        });

        // Default to Rajasthan (Intra-state) if we don't know customer state
        const taxResult = gstCalculator.calculate(
            { stateCode: "08" },
            [{
                description: `PropelKit ${planName} License`,
                sacCode: SAC_CODE_SAAS,
                unitPrice: taxableAmount,
                quantity: 1
            }]
        );

        // 5. Insert License (Using Admin Client to bypass RLS)
        const { error: licenseError } = await supabaseAdmin.from("licenses").insert({
            user_id: user.id,
            plan_key: planKey,
            license_key: licenseKey,
            status: "active"
        });

        if (licenseError) {
            console.error("License Insert Error:", licenseError);
            throw new Error("Failed to save license to database.");
        }

        // 6. Generate PDF Invoice
        const pdfBuffer = await generateInvoicePDF({
            invoiceNumber: taxResult.invoiceNumberSuggestion,
            date: new Date(),
            customerName: user.user_metadata?.full_name || "Valued Customer",
            customerAddress: "Not Provided",
            taxResult: taxResult,
            description: `PropelKit ${planName} Lifetime License`
        });

        // 7. Send Email (Fail-safe: don't block response if email fails)
        try {
            if (process.env.RESEND_API_KEY) {
                await sendInvoiceEmail(user.email, pdfBuffer, taxResult.invoiceNumberSuggestion);
            } else {
                console.warn("Skipping email: RESEND_API_KEY missing.");
            }
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            // We continue because the user PAID and got the LICENSE. 
            // We don't want to show an error just because email failed.
        }

        // 8. Insert Invoice Record
        const { error: invoiceError } = await supabaseAdmin.from("invoices").insert({
            id: razorpayPaymentId,
            user_id: user.id,
            amount: totalAmountPaid * 100, // Store in paise
            status: "paid",
            currency: "INR"
        });

        if (invoiceError) console.error("Invoice Insert Error:", invoiceError);

        return NextResponse.json({ success: true, licenseKey });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}