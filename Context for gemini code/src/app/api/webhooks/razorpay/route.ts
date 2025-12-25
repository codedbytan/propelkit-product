import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { Resend } from 'resend'; // 👈 Import Resend

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        // 1. Verify Signature (Security)
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(body);
        const digest = shasum.digest("hex");

        if (digest !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const entity = event.payload.payment.entity;

        // ✅ HANDLE: Payment Captured (Success)
        if (event.event === "payment.captured") {
            const userId = entity.notes?.userId;
            const planKey = entity.notes?.planKey;

            if (!userId) return NextResponse.json({ received: true });

            // Idempotency Check
            const { data: existingInvoice } = await supabaseAdmin
                .from("invoices")
                .select("id")
                .eq("id", entity.id)
                .maybeSingle();

            if (existingInvoice) {
                return NextResponse.json({ received: true });
            }

            // A. Create License
            const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
            const planName = planKey?.includes("agency") ? "AGENCY" : "STARTER";
            const licenseKey = `PK-${planName}-${new Date().getFullYear()}-${shortId}`;

            await supabaseAdmin.from("licenses").insert({
                user_id: userId,
                plan_key: planKey || "starter_lifetime",
                license_key: licenseKey,
                status: "active"
            });

            // B. Calculate Tax & Invoice
            const totalAmountPaid = entity.amount / 100;
            const taxRate = 0.18;
            const taxableAmount = totalAmountPaid / (1 + taxRate);

            const gstCalculator = new GSTCalculator({
                sellerStateCode: "08",
                sellerGSTIN: "08AAAAA0000A1Z5",
            });

            const taxResult = gstCalculator.calculate(
                { stateCode: "08" },
                [{
                    description: `PropelKit ${planName} License`,
                    sacCode: SAC_CODE_SAAS,
                    unitPrice: taxableAmount,
                    quantity: 1
                }]
            );

            // C. Save Invoice
            await supabaseAdmin.from("invoices").insert({
                id: entity.id,
                user_id: userId,
                amount: entity.amount,
                status: "paid",
                currency: "INR"
            });

            // D. Email User
            const userEmail = entity.email;
            if (userEmail && process.env.RESEND_API_KEY) {
                const pdfBuffer = await generateInvoicePDF({
                    invoiceNumber: taxResult.invoiceNumberSuggestion,
                    date: new Date(),
                    customerName: userEmail.split("@")[0],
                    customerAddress: "Not Provided",
                    taxResult: taxResult,
                    description: `PropelKit ${planName} Lifetime License`
                });
                await sendInvoiceEmail(userEmail, pdfBuffer, taxResult.invoiceNumberSuggestion);
            }
        }

        // ❌ HANDLE: Payment Failed (Revenue Recovery)
        if (event.event === "payment.failed") {
            const userEmail = entity.email;
            if (userEmail && process.env.RESEND_API_KEY) {
                console.log(`⚠️ Payment Failed for ${userEmail}. Sending recovery email.`);
                await resend.emails.send({
                    from: 'PropelKit Support <onboarding@resend.dev>', // Update this when you have a domain
                    to: userEmail,
                    subject: 'Payment Failed - PropelKit',
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2>Oops! Your payment couldn't be processed.</h2>
                            <p>We noticed your transaction of <strong>₹${entity.amount / 100}</strong> failed.</p>
                            <p>This usually happens due to bank timeouts or card limits. You can try again using the link below:</p>
                            <br/>
                            <a href="https://propelkit.com/#pricing" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Retry Payment</a>
                            <br/><br/>
                            <p>If the money was deducted, it will be automatically refunded by your bank within 5-7 days.</p>
                        </div>
                    `
                });
            }
        }

        return NextResponse.json({ status: "ok" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}