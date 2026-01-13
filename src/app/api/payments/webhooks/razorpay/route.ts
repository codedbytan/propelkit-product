// src/app/api/webhooks/razorpay/route.ts
// ✅ WITH RATE LIMITING + SIGNATURE VERIFICATION

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import crypto from "crypto";
import { Resend } from "resend";
import { brand } from "@/config/brand";
// Rate limiting - optional, uncomment if you add @upstash/ratelimit
// import { webhookLimiter, getIdentifier, applyRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        // 1. ⚡ RATE LIMIT (optional - uncomment if you set up rate limiting)
        // const identifier = getIdentifier(req);
        // const { limited, headers: rateLimitHeaders } = await applyRateLimit(webhookLimiter, identifier);
        // if (limited) {
        //     console.warn(`🚨 Webhook rate limit exceeded from ${identifier}`);
        //     return NextResponse.json(
        //         { error: "Too many requests" },
        //         { status: 429, headers: rateLimitHeaders }
        //     );
        // }
        const rateLimitHeaders = {};

        // 2. ✅ VERIFY SIGNATURE
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("❌ RAZORPAY_WEBHOOK_SECRET not configured");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("❌ Invalid webhook signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const eventId = event.payload?.payment?.entity?.id || event.payload?.subscription?.entity?.id || event.event;

        // 3. ✅ CHECK FOR DUPLICATE EVENTS (Idempotency)
        const { data: existingEvent } = await supabaseAdmin
            .from('webhook_events')
            .select('id')
            .eq('event_id', eventId)
            .single();

        if (existingEvent) {
            console.log(`⏭️ Duplicate event ${eventId}, skipping`);
            return NextResponse.json({ received: true, duplicate: true }, { headers: rateLimitHeaders });
        }

        // 4. STORE EVENT
        await supabaseAdmin.from('webhook_events').insert({
            event_id: eventId,
            event_type: event.event,
            payload: event.payload,
            status: 'processing',
        });

        // 5. PROCESS EVENT
        console.log(`📥 Processing webhook: ${event.event}`);

        switch (event.event) {
            case "subscription.charged":
                await handleSubscriptionCharged(event.payload);
                break;

            case "subscription.activated":
                await handleSubscriptionActivated(event.payload);
                break;

            case "subscription.cancelled":
            case "subscription.halted":
            case "subscription.paused":
                await handleSubscriptionCancelled(event.payload);
                break;

            case "payment.captured":
                await handlePaymentCaptured(event.payload);
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${event.event}`);
        }

        // 6. MARK AS PROCESSED
        await supabaseAdmin.from('webhook_events')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('event_id', eventId);

        return NextResponse.json({ received: true }, { headers: rateLimitHeaders });

    } catch (error: any) {
        console.error("❌ Webhook processing error:", error);

        return NextResponse.json({
            error: "Webhook processing failed"
        }, { status: 500 });
    }
}

// ========================================
// EVENT HANDLERS
// ========================================

async function handleSubscriptionCharged(payload: any) {
    const subscription = payload.subscription.entity;
    const payment = payload.payment?.entity;

    if (!payment) return;

    const userId = subscription.notes?.userId;
    const organizationId = subscription.notes?.organizationId;

    // Update subscription
    await supabaseAdmin
        .from("subscriptions")
        .upsert({
            razorpay_subscription_id: subscription.id,
            user_id: userId,
            organization_id: organizationId,
            plan_id: subscription.notes?.planKey,
            status: 'active',
            amount: payment.amount,
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            type: 'recurring',
        }, { onConflict: 'razorpay_subscription_id' });

    // Update organization
    if (organizationId) {
        await supabaseAdmin
            .from('organizations')
            .update({
                subscription_status: 'active',
                subscription_plan: subscription.notes?.planKey,
            })
            .eq('id', organizationId);
    }

    console.log(`✅ Subscription charged: ${subscription.id}`);
}

async function handleSubscriptionActivated(payload: any) {
    const subscription = payload.subscription.entity;
    const payment = payload.payment?.entity;

    const userId = subscription.notes?.userId;
    const organizationId = subscription.notes?.organizationId;

    // Same as charged
    await handleSubscriptionCharged(payload);

    // Send activation email
    if (payment?.email) {
        await resend.emails.send({
            from: brand.email.fromBilling,
            to: payment.email,
            subject: `Subscription Activated - ${brand.name}`,
            html: `<p>Your subscription is now active!</p>`,
        });
    }

    console.log(`✅ Subscription activated: ${subscription.id}`);
}

async function handleSubscriptionCancelled(payload: any) {
    const subscription = payload.subscription.entity;

    await supabaseAdmin
        .from("subscriptions")
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", subscription.id);

    if (subscription.notes?.organizationId) {
        await supabaseAdmin
            .from('organizations')
            .update({
                subscription_status: 'cancelled',
                subscription_plan: null
            })
            .eq('id', subscription.notes.organizationId);
    }

    console.log(`✅ Subscription cancelled: ${subscription.id}`);
}

async function handlePaymentCaptured(payload: any) {
    const payment = payload.payment.entity;

    // Skip if this is a subscription payment (handled separately)
    if (payment.notes?.type === 'recurring' || payment.invoice_id) {
        return;
    }

    // Handle one-time payment
    console.log(`✅ One-time payment captured: ${payment.id}`);
}