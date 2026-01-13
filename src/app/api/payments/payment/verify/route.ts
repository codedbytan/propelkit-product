// src/app/api/payment/verify/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import { z } from "zod";
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";
import { brand } from "@/config/brand";

const verifySchema = z.object({
    orderCreationId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    planKey: z.enum(["starter_lifetime", "pro_lifetime", "starter_monthly", "pro_yearly"])
});

export async function POST(req: Request) {
    try {
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

        // 1. Verify Razorpay Signature
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            console.error("Signature mismatch!");
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // 2. Get authenticated user
        const { createClient: createServerClient } = await import("@/lib/supabase-server");
        const supabaseUserClient = await createServerClient();
        const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 3. Get user's organization
        const { data: membership } = await supabaseAdmin
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "Organization not found" }, { status: 500 });
        }

        const organizationId = membership.organization_id;

        // 4. Get plan pricing from brand config
        const isStarter = planKey.includes('starter');
        const planName = isStarter ? brand.pricing.plans.starter.name : brand.pricing.plans.agency.name;
        const amount = isStarter ? brand.pricing.plans.starter.priceInPaise : brand.pricing.plans.agency.priceInPaise;

        // 5. Check if payment already processed (idempotency)
        const { data: existingLicense } = await supabaseAdmin
            .from('licenses')
            .select('id')
            .eq('razorpay_payment_id', razorpayPaymentId)
            .single();

        if (existingLicense) {
            console.log("License already exists for this payment");
            return NextResponse.json({
                success: true,
                licenseKey: existingLicense.id,
                message: "Already processed"
            });
        }

        // 6. Generate License Key
        const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();

        // 7. Create license record
        const { error: licenseError } = await supabaseAdmin
            .from('licenses')
            .insert({
                id: licenseKey,
                user_id: user.id,
                organization_id: organizationId,
                plan: planKey,
                status: 'active',
                razorpay_payment_id: razorpayPaymentId,
                razorpay_order_id: orderCreationId,
                amount: amount,
                activated_at: new Date().toISOString()
            });

        if (licenseError) {
            console.error("License creation error:", licenseError);
            return NextResponse.json({ error: "Failed to create license" }, { status: 500 });
        }

        // 8. Record payment
        await supabaseAdmin.from('payments').insert({
            user_id: user.id,
            organization_id: organizationId,
            amount: amount,
            currency: 'INR',
            status: 'completed',
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: orderCreationId,
            plan_key: planKey
        });

        // 9. Generate invoice and send email
        try {
            // Calculate GST
            const calculator = new GSTCalculator({
                sellerStateCode: brand.company.address.stateCode,
                sellerGSTIN: brand.company.gstin
            });

            const taxResult = calculator.calculate(
                { stateCode: brand.company.address.stateCode },
                [{
                    description: `${brand.product.name} ${planName}`,
                    sacCode: brand.invoice.sacCode,
                    unitPrice: amount / 100,
                    quantity: 1
                }]
            );

            // Generate PDF
            const pdfBuffer = await generateInvoicePDF({
                invoiceNumber: taxResult.invoiceNumberSuggestion,
                date: new Date(),
                customerName: user.email.split('@')[0],
                customerGSTIN: undefined,
                taxResult: taxResult,
                description: `${brand.product.name} ${planName} ${planKey.includes('lifetime') ? 'Lifetime' : planKey.includes('monthly') ? 'Monthly' : 'Yearly'} License`
            });

            // ✅ FIXED: Now passing all 4 required arguments including amount
            await sendInvoiceEmail(
                user.email,
                pdfBuffer,
                taxResult.invoiceNumberSuggestion,
                amount  // ← Added the missing amount parameter
            );
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            // Don't fail the payment if email fails
        }

        // 10. Audit log
        await supabaseAdmin.from("audit_logs").insert({
            user_id: user.id,
            action: "license_activated",
            details: {
                payment_id: razorpayPaymentId,
                plan: planKey,
                license_key: licenseKey,
                organization_id: organizationId
            }
        });

        console.log(`✅ Payment verified and license created: ${licenseKey}`);

        return NextResponse.json({
            success: true,
            licenseKey
        });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({
            error: "Payment verification failed. Please contact support."
        }, { status: 500 });
    }
}