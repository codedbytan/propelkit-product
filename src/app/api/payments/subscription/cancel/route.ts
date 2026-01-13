// src/app/api/subscription/cancel/route.ts
// ✅ NEW FILE - Add subscription cancellation

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Razorpay from "razorpay";
import { z } from "zod";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const cancelSchema = z.object({
    organizationId: z.string().uuid(),
    cancelAtCycleEnd: z.boolean().optional().default(true), // Default: cancel at end of billing period
});

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate request
        const body = await request.json();
        const validation = cancelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request", details: validation.error },
                { status: 400 }
            );
        }

        const { organizationId, cancelAtCycleEnd } = validation.data;

        // 3. Verify user is owner/admin of organization
        const { data: membership } = await supabaseAdmin
            .from('organization_members')
            .select('role')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single();

        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            return NextResponse.json(
                { error: "You don't have permission to cancel this subscription" },
                { status: 403 }
            );
        }

        // 4. Get active subscription
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .maybeSingle();

        if (subError || !subscription) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 404 }
            );
        }

        if (!subscription.razorpay_subscription_id) {
            return NextResponse.json(
                { error: "Invalid subscription data" },
                { status: 500 }
            );
        }

        // 5. Cancel in Razorpay
        try {
            const razorpaySub = await razorpay.subscriptions.cancel(
                subscription.razorpay_subscription_id,
                cancelAtCycleEnd // true = cancel at period end, false = cancel immediately
            );

            console.log(`✅ Cancelled subscription: ${razorpaySub.id}`);

            // 6. Update database
            const newStatus = cancelAtCycleEnd ? 'active' : 'cancelled'; // If at cycle end, keep active until then
            const cancelledAt = new Date().toISOString();

            await supabaseAdmin
                .from('subscriptions')
                .update({
                    status: newStatus,
                    cancel_at_period_end: cancelAtCycleEnd,
                    cancelled_at: cancelledAt,
                })
                .eq('id', subscription.id);

            // 7. Update organization status (only if immediate cancellation)
            if (!cancelAtCycleEnd) {
                await supabaseAdmin
                    .from('organizations')
                    .update({
                        subscription_status: 'cancelled',
                        subscription_plan: null,
                    })
                    .eq('id', organizationId);
            }

            // 8. Audit log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: user.id,
                action: 'subscription_cancelled',
                details: {
                    organization_id: organizationId,
                    subscription_id: subscription.id,
                    cancel_at_period_end: cancelAtCycleEnd,
                    razorpay_subscription_id: razorpaySub.id,
                }
            });

            const cancellationMessage = cancelAtCycleEnd && subscription.current_period_end
                ? `Subscription will be cancelled on ${new Date(subscription.current_period_end).toLocaleDateString('en-IN')}`
                : 'Subscription cancelled immediately';

            return NextResponse.json({
                success: true,
                message: cancellationMessage,
                subscription: {
                    id: razorpaySub.id,
                    status: razorpaySub.status,
                    end_at: razorpaySub.end_at,
                }
            });

        } catch (razorpayError) {
            console.error('❌ Razorpay cancellation error:', razorpayError);

            const errorMessage = razorpayError instanceof Error
                ? razorpayError.message
                : (razorpayError as { error?: { description?: string } })?.error?.description || "Failed to cancel subscription";

            return NextResponse.json({
                error: "Failed to cancel subscription",
                details: errorMessage
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Subscription cancellation error:', error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}