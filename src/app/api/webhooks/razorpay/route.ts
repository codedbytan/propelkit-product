// src/app/api/webhooks/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";
import { GSTCalculator, SAC_CODE_SAAS } from "@/lib/gst-engine";
import { brand } from "@/config/brand";
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
                    await handleInvoiceGeneration(
                        entity,
                        userId,
                        planKey || "Lifetime License",
                        entity.amount  // ✅ FIXED: Pass amount
                    );
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

                // 4. Send Invoice Email
                await handleInvoiceGeneration(
                    paymentEntity,
                    userId,
                    `${planKey} Subscription`,
                    paymentEntity.amount  // ✅ FIXED: Pass amount
                );
            }

            // ==========================================
            // CASE C: SUBSCRIPTION STATUS CHANGES
            // ==========================================
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

                // 2. Update Organization Status (Revoke Access if cancelled)
                if (newStatus === 'cancelled' && subEntity.notes.organizationId) {
                    await supabaseAdmin
                        .from('organizations')
                        .update({
                            subscription_status: 'cancelled',
                            subscription_plan: null
                        })
                        .eq('id', subEntity.notes.organizationId);
                }

                // 3. Optional: Send cancellation email
                if (newStatus === 'cancelled') {
                    const { data: user } = await supabaseAdmin
                        .from('profiles')
                        .select('email')
                        .eq('id', subEntity.notes.userId)
                        .single();

                    if (user?.email && process.env.RESEND_API_KEY) {
                        await resend.emails.send({
                            from: brand.email.fromSupport,
                            to: user.email,
                            subject: `Subscription Cancelled - ${brand.name}`,
                            html: `
                                <p>Your subscription has been cancelled.</p>
                                <p>You'll continue to have access until ${new Date(subEntity.current_end * 1000).toLocaleDateString('en-IN')}</p>
                            `
                        });
                    }
                }
            }

            // Mark event as processed
            await markProcessed(eventId);

            return NextResponse.json({ received: true });

        } catch (processingError: any) {
            console.error("Webhook processing error:", processingError);

            // Log failed processing
            await supabaseAdmin.from("webhook_events")
                .update({
                    status: "failed",
                    error_message: processingError.message
                })
                .eq("event_id", eventId);

            // Return 200 to prevent Razorpay from retrying immediately
            // (We've logged the error and can manually retry later)
            return NextResponse.json({ error: processingError.message }, { status: 200 });
        }

    } catch (error: any) {
        console.error("Fatal webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function markProcessed(eventId: string) {
    await supabaseAdmin
        .from("webhook_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("event_id", eventId);
}

// ✅ FIXED: Added amount parameter
async function handleInvoiceGeneration(
    entity: any,
    userId: string,
    description: string,
    amount: number  // ✅ Added this parameter
) {
    // Calculate Tax using brand config
    const totalAmountPaid = amount / 100;  // ✅ Use passed amount instead of entity.amount
    const taxRate = brand.invoice.taxRate;  // ✅ Use brand config
    const taxableAmount = totalAmountPaid / (1 + taxRate);

    const gstCalculator = new GSTCalculator({
        sellerStateCode: brand.company.address.stateCode,  // ✅ Use brand config
        sellerGSTIN: brand.company.gstin,  // ✅ Use brand config
    });

    const taxResult = gstCalculator.calculate(
        { stateCode: brand.company.address.stateCode }, // ✅ Use brand config
        [{
            description: description,
            sacCode: brand.invoice.sacCode,  // ✅ Use brand config
            unitPrice: taxableAmount,
            quantity: 1
        }]
    );

    // Save invoice to DB
    await supabaseAdmin.from("invoices").insert({
        id: entity.id,
        user_id: userId,
        amount: amount,  // ✅ Use passed amount
        status: "paid",
        currency: "INR"
    });

    // Send Email with invoice
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

        // ✅ FIXED: Now passing all 4 required arguments including amount
        await sendInvoiceEmail(
            userEmail,
            pdfBuffer,
            taxResult.invoiceNumberSuggestion,
            amount  // ✅ Added the missing amount parameter
        );
    }
}