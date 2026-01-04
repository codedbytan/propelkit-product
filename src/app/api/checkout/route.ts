import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define plan details
const PLANS = {
    starter_lifetime: { amount: 299900, type: 'lifetime' },
    pro_lifetime: { amount: 599900, type: 'lifetime' },
    starter_monthly: {
        amount: 99900,
        type: 'recurring',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY
    },
    pro_yearly: {
        amount: 2999900,
        type: 'recurring',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY
    },
} as const;

export async function POST(req: Request) {
    try {
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            return NextResponse.json(
                { error: "Razorpay not configured" },
                { status: 500 }
            );
        }

        // 1. Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Please log in to purchase." }, { status: 401 });
        }

        const body = await req.json();
        const { planKey } = body;

        // 2. Validate plan
        const plan = PLANS[planKey as keyof typeof PLANS];
        if (!plan) {
            return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
        }

        // 3. Get or create user's default organization
        const { data: membership } = await supabaseAdmin
            .from('organization_members')
            .select('organization_id, organizations(id, name)')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single();

        if (!membership) {
            // This should never happen due to trigger, but handle gracefully
            return NextResponse.json({ error: "Organization not found. Please contact support." }, { status: 500 });
        }

        const organizationId = membership.organization_id;

        // 4. Check if already has active subscription
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status, plan_id')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .maybeSingle();

        if (existingSub) {
            return NextResponse.json({
                error: `You already have an active ${existingSub.plan_id} subscription.`
            }, { status: 400 });
        }

        // 5. Create Razorpay order/subscription
        if (plan.type === 'lifetime') {
            // One-time payment
            const order = await razorpay.orders.create({
                amount: plan.amount,
                currency: "INR",
                receipt: `org_${organizationId}_${Date.now()}`,
                notes: {
                    userId: user.id,
                    organizationId: organizationId,
                    planKey: planKey,
                }
            });

            return NextResponse.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                type: 'order'
            });
        } else {
            // Recurring subscription
            if (!plan.razorpay_plan_id) {
                return NextResponse.json({
                    error: "Recurring plan not configured"
                }, { status: 500 });
            }

            const subscription = await razorpay.subscriptions.create({
                plan_id: plan.razorpay_plan_id,
                customer_notify: 1,
                total_count: 0, // Infinite
                notes: {
                    userId: user.id,
                    organizationId: organizationId,
                    planKey: planKey,
                }
            });

            return NextResponse.json({
                subscriptionId: subscription.id,
                amount: plan.amount,
                currency: 'INR',
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                type: 'subscription'
            });
        }

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}