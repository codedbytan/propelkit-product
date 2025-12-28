import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { Resend } from 'resend';

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
        const eventId = event.id; // Razorpay's unique event ID
        const entity = event.payload.payment.entity;

        // 🔒 CRITICAL: Check if we've already processed this event
        const { data: existingEvent } = await supabaseAdmin
            .from("webhook_events")
            .select("id, status")
            .eq("event_id", eventId)
            .maybeSingle();

        if (existingEvent) {
            if (existingEvent.status === "processed") {
                console.log(`✅ Event ${eventId} already processed. Skipping.`);
                return NextResponse.json({ received: true });
            }
            // If status is 'failed', we might want to retry, but for now skip
            console.log(`⚠️ Event ${eventId} exists with status: ${existingEvent.status}`);
            return NextResponse.json({ received: true });
        }

        // 2. Insert webhook event as 'pending'
        const { error: eventInsertError } = await supabaseAdmin
            .from("webhook_events")
            .insert({
                event_id: eventId,
                event_type: event.event,
                payload: event,
                status: "pending"
            });

        if (eventInsertError) {
            console.error("Failed to insert webhook event:", eventInsertError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // 3. Process the event
        try {
            if (event.event === "payment.captured") {
                const userId = entity.notes?.userId;
                const planKey = entity.notes?.planKey;

                if (!userId) {
                    throw new Error("No userId in payment notes");
                }

                // A. Create License
                const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
                const planName = planKey?.includes("agency") ? "AGENCY" : "STARTER";
                const licenseKey = `ACME-${planName}-${new Date().getFullYear()}-${shortId}`;

                await supabaseAdmin.from("licenses").insert({
                    user_id: userId,
                    plan_key: planKey || "starter_lifetime",
                    license_key: licenseKey,
                    status: "active"
                });

                // B. Calculate Tax & Create Invoice
                const totalAmountPaid = entity.amount / 100;
                const taxRate = 0.18;
                const taxableAmount = totalAmountPaid / (1 + taxRate);

                const gstCalculator = new GSTCalculator({
                    sellerStateCode: "08",
                    sellerGSTIN: "YOUR_GSTIN_HERE",
                });

                const taxResult = gstCalculator.calculate(
                    { stateCode: "08" },
                    [{
                        description: `Acme SaaS ${planName} License`,
                        sacCode: SAC_CODE_SAAS,
                        unitPrice: taxableAmount,
                        quantity: 1
                    }]
                );

                await supabaseAdmin.from("invoices").insert({
                    id: entity.id,
                    user_id: userId,
                    amount: entity.amount,
                    status: "paid",
                    currency: "INR"
                });

                // C. Send Email
                const userEmail = entity.email;
                if (userEmail && process.env.RESEND_API_KEY) {
                    const pdfBuffer = await generateInvoicePDF({
                        invoiceNumber: taxResult.invoiceNumberSuggestion,
                        date: new Date(),
                        customerName: userEmail.split("@")[0],
                        customerAddress: "Not Provided",
                        taxResult: taxResult,
                        description: `Acme SaaS ${planName} Lifetime License`
                    });
                    await sendInvoiceEmail(userEmail, pdfBuffer, taxResult.invoiceNumberSuggestion);
                }

                // D. Log to audit
                await supabaseAdmin.from("audit_logs").insert({
                    user_id: userId,
                    action: "payment_captured",
                    details: { payment_id: entity.id, amount: entity.amount, plan: planKey }
                });
            }

            if (event.event === "payment.failed") {
                const userEmail = entity.email;
                if (userEmail && process.env.RESEND_API_KEY) {
                    console.log(`⚠️ Payment Failed for ${userEmail}. Sending recovery email.`);
                    await resend.emails.send({
                        from: 'Acme SaaS <onboarding@resend.dev>',
                        to: userEmail,
                        subject: 'Payment Failed - Acme SaaS',
                        html: `
                            <div style="font-family: sans-serif; color: #333;">
                                <h2>Oops! Your payment couldn't be processed.</h2>
                                <p>We noticed your transaction of <strong>₹${entity.amount / 100}</strong> failed.</p>
                                <p>This usually happens due to bank timeouts or card limits. You can try again below:</p>
                                <br/>
                                <a href="https://yourdomain.com/#pricing" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Retry Payment</a>
                                <br/><br/>
                                <p>If the money was deducted, it will be automatically refunded by your bank within 5-7 days.</p>
                            </div>
                        `
                    });
                }
            }

            // 🔒 Mark event as processed
            await supabaseAdmin
                .from("webhook_events")
                .update({ status: "processed", processed_at: new Date().toISOString() })
                .eq("event_id", eventId);

            return NextResponse.json({ status: "ok" });

        } catch (processingError: any) {
            console.error("Error processing webhook:", processingError);

            // Mark event as failed
            await supabaseAdmin
                .from("webhook_events")
                .update({ status: "failed" })
                .eq("event_id", eventId);

            return NextResponse.json({ error: "Processing failed" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
