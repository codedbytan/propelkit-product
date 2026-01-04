import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail, sendSubscriptionChargedEmail } from "@/lib/email"; // ✅ Fixed import
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

        // 2. Idempotency Check (Prevent duplicate processing)
        const { data: existingEvent } = await supabaseAdmin
            .from("webhook_events")
            .select("id, status")
            .eq("event_id", eventId)
            .maybeSingle();

        if (existingEvent) {
            if (existingEvent.status === "processed") {
                return NextResponse.json({ received: true });
            }
        }

        // 3. Log the event as pending
        await supabaseAdmin.from("webhook_events").insert({
            event_id: eventId,
            event_type: event.event,
            payload: event,
            status: "pending"
        });

        // 4. Process the Event
        try {

            // ==========================================
            // CASE A: LIFETIME PURCHASE (One-Time)
            // ==========================================
            if (event.event === "payment.captured") {
                const entity = event.payload.payment.entity;
                const notes = entity.notes;

                // 🛑 CRITICAL: Ignore Subscription Payments here
                // Razorpay sends 'payment.captured' for subscriptions too.
                // We MUST skip them to avoid creating duplicate licenses/invoices.
                if (notes?.type === 'recurring' || entity.invoice_id) {
                    console.log(`Skipping payment.captured for subscription (ID: ${entity.id})`);
                    await markProcessed(eventId);
                    return NextResponse.json({ status: "skipped_subscription_payment" });
                }

                const userId = notes?.userId;
                const planKey = notes?.planKey;

                if (userId) {
                    // 1. Create Lifetime License
                    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
                    await supabaseAdmin.from("licenses").insert({
                        user_id: userId,
                        plan_key: planKey || "lifetime",
                        license_key: `LIC-${new Date().getFullYear()}-${shortId}`,
                        status: "active"
                    });

                    // 2. Generate GST Invoice & Send Email
                    // (Reusing your existing GST logic)
                    await handleInvoiceGeneration(entity, userId, planKey || "Lifetime License");
                }
            }

            // ==========================================
            // CASE B: RECURRING SUBSCRIPTION (New & Renewals)
            // ==========================================
            if (event.event === "subscription.charged") {
                const subEntity = event.payload.subscription.entity;
                const paymentEntity = event.payload.payment.entity;
                const userId = subEntity.notes.userId;
                const planKey = subEntity.notes.planKey;

                // 1. Upsert Subscription Record
                // This handles both the FIRST payment and every RENEWAL automatically
                const { error: subError } = await supabaseAdmin
                    .from("subscriptions")
                    .upsert({
                        razorpay_subscription_id: subEntity.id,
                        user_id: userId,
                        plan_id: planKey,
                        status: 'active',
                        current_period_start: new Date(subEntity.current_start * 1000).toISOString(),
                        current_period_end: new Date(subEntity.current_end * 1000).toISOString(),
                        type: 'recurring',
                        // Optional: Link to organization if you have the ID in notes
                        organization_id: subEntity.notes.organizationId || null
                    }, { onConflict: 'razorpay_subscription_id' });

                if (subError) throw subError;

                // 2. Create Invoice Record for this renewal
                await supabaseAdmin.from("invoices").insert({
                    id: paymentEntity.id,
                    user_id: userId,
                    amount: paymentEntity.amount,
                    status: "paid",
                    currency: "INR",
                    organization_id: subEntity.notes.organizationId || null
                });

                // 3. Update Organization Status (Grant Access)
                if (subEntity.notes.organizationId) {
                    await supabaseAdmin
                        .from('organizations')
                        .update({
                            subscription_status: 'active',
                            subscription_plan: planKey
                        })
                        .eq('id', subEntity.notes.organizationId);
                }

                // 4. Send Email (Optional: You can reuse handleInvoiceGeneration here too)
            }

            // ==========================================
            // CASE C: SUBSCRIPTION STATUS CHANGES
            // ==========================================
            // Handle Cancelled, Halted (Failed 4x), and Paused
            const statusChangeEvents = [
                "subscription.cancelled",
                "subscription.halted",
                "subscription.paused"
            ];

            if (statusChangeEvents.includes(event.event)) {
                const subEntity = event.payload.subscription.entity;
                const newStatus = event.event.split('.')[1]; // cancelled, halted, or paused

                // 1. Update Subscription Table
                await supabaseAdmin
                    .from("subscriptions")
                    .update({
                        status: newStatus,
                        cancelled_at: newStatus === 'cancelled' ? new Date().toISOString() : null
                    })
                    .eq("razorpay_subscription_id", subEntity.id);

                // 2. Revoke Organization Access
                // We need to find the org linked to this subscription first
                const { data: sub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('organization_id')
                    .eq('razorpay_subscription_id', subEntity.id)
                    .single();

                if (sub?.organization_id) {
                    await supabaseAdmin
                        .from('organizations')
                        .update({ subscription_status: newStatus })
                        .eq('id', sub.organization_id);
                }
            }

            // Handle Resumed (Manually un-paused from Dashboard)
            if (event.event === "subscription.resumed") {
                const subEntity = event.payload.subscription.entity;

                await supabaseAdmin
                    .from("subscriptions")
                    .update({ status: 'active' })
                    .eq("razorpay_subscription_id", subEntity.id);

                // Re-enable Organization Access
                const { data: sub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('organization_id')
                    .eq('razorpay_subscription_id', subEntity.id)
                    .single();

                if (sub?.organization_id) {
                    await supabaseAdmin
                        .from('organizations')
                        .update({ subscription_status: 'active' })
                        .eq('id', sub.organization_id);
                }
            }

            // ==========================================
            // CASE D: PAYMENT FAILED
            // ==========================================
            if (event.event === "payment.failed") {
                const entity = event.payload.payment.entity;
                const userEmail = entity.email;

                if (userEmail && process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'Acme SaaS <onboarding@resend.dev>',
                        to: userEmail,
                        subject: 'Action Required: Payment Failed',
                        html: `
                            <p>We couldn't process your payment of ₹${entity.amount / 100}.</p>
                            <p>Please check your card details or try a different payment method.</p>
                        `
                    });
                }
            }

            // ✅ Mark event as successfully processed
            await markProcessed(eventId);
            return NextResponse.json({ status: "ok" });

        } catch (processingError: any) {
            console.error("Error processing webhook:", processingError);

            // Mark as failed so we can debug later
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

// ==========================================
// HELPERS
// ==========================================

async function markProcessed(eventId: string) {
    await supabaseAdmin
        .from("webhook_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("event_id", eventId);
}

async function handleInvoiceGeneration(entity: any, userId: string, description: string) {
    // Calculate Tax
    const totalAmountPaid = entity.amount / 100;
    const taxRate = 0.18;
    const taxableAmount = totalAmountPaid / (1 + taxRate);

    const gstCalculator = new GSTCalculator({
        sellerStateCode: "08", // Rajasthan (Example)
        sellerGSTIN: process.env.NEXT_PUBLIC_GSTIN || "YOUR_GSTIN",
    });

    const taxResult = gstCalculator.calculate(
        { stateCode: "08" }, // Customer state (defaulting to local for now)
        [{
            description: description,
            sacCode: SAC_CODE_SAAS,
            unitPrice: taxableAmount,
            quantity: 1
        }]
    );

    // Save to DB
    await supabaseAdmin.from("invoices").insert({
        id: entity.id,
        user_id: userId,
        amount: entity.amount,
        status: "paid",
        currency: "INR"
    });

    // Send Email
    const userEmail = entity.email;
    if (userEmail && process.env.RESEND_API_KEY) {
        const pdfBuffer = await generateInvoicePDF({
            invoiceNumber: taxResult.invoiceNumberSuggestion,
            date: new Date(),
            customerName: userEmail.split("@")[0],
            customerAddress: "Not Provided",
            taxResult: taxResult,
            description: description
        });

        await sendInvoiceEmail(userEmail, pdfBuffer, taxResult.invoiceNumberSuggestion);
    }
}