// src/app/api/checkout/route.ts
// ✅ WITH RATE LIMITING + VALIDATION

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/supabase-server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
// Rate limiting - optional, uncomment if you add @upstash/ratelimit
// import { checkoutLimiter, getIdentifier, applyRateLimit } from "@/lib/rate-limit";
import { checkoutSchema, validateRequest } from "@/lib/validation-schemas";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Available plans - extend this as needed for your boilerplate
const PLANS: Record<string, {
    amount: number;
    interval: 'monthly' | 'yearly';
    razorpay_plan_id: string | undefined;
}> = {
    starter_monthly: {
        amount: 99900,
        interval: 'monthly',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY,
    },
    pro_yearly: {
        amount: 2999900,
        interval: 'yearly',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY,
    },
    // Add more plans as needed (agency, lifetime, etc.)
};

async function getOrCreateOrganization(userId: string, userEmail: string): Promise<string> {
    const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (membership) return membership.organization_id;

    const userSlug = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
        + '-' + Math.random().toString(36).substring(2, 8);

    const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
            name: `${userEmail}'s Organization`,
            slug: userSlug,
            created_by: userId,
            subscription_status: 'trial'
        })
        .select('id')
        .single();

    if (orgError) throw new Error('Failed to create organization');

    await supabaseAdmin.from('organization_members').insert({
        organization_id: newOrg.id,
        user_id: userId,
        role: 'owner'
    });

    return newOrg.id;
}

export async function POST(req: NextRequest) {
    try {
        // 1. AUTHENTICATE
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
        }

        // 2. ⚡ RATE LIMIT (optional - uncomment if you set up rate limiting)
        // const identifier = getIdentifier(req, user.id);
        // const { limited, headers: rateLimitHeaders } = await applyRateLimit(checkoutLimiter, identifier);
        // if (limited) {
        //     return NextResponse.json(
        //         { error: "Too many checkout attempts. Please try again later." },
        //         { status: 429, headers: rateLimitHeaders }
        //     );
        // }
        const rateLimitHeaders = {};

        // 3. ✅ VALIDATE INPUT
        const body = await req.json();
        const validation = validateRequest(checkoutSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid plan selected", details: validation.formattedError },
                { status: 400 }
            );
        }

        const { planKey } = validation.data;
        const plan = PLANS[planKey];

        // 4. Verify plan exists and is configured
        if (!plan) {
            return NextResponse.json({
                error: `Plan "${planKey}" not found. Please select a valid plan.`
            }, { status: 400 });
        }

        if (!plan.razorpay_plan_id) {
            return NextResponse.json({
                error: `${planKey} is not configured. Please contact support.`
            }, { status: 500 });
        }

        // 5. Get/create organization
        const organizationId = await getOrCreateOrganization(user.id, user.email);

        // 6. Check for existing active subscription
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status, plan_id')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .maybeSingle();

        if (existingSub) {
            return NextResponse.json({
                error: `You already have an active ${existingSub.plan_id} subscription.`,
            }, { status: 400 });
        }

        // 7. Create Razorpay subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpay_plan_id,
            customer_notify: 1,
            total_count: 0, // Unlimited until cancelled
            notes: {
                userId: user.id,
                organizationId: organizationId,
                planKey: planKey,
            }
        });

        console.log(`✅ Subscription created: ${subscription.id} for user ${user.id}`);

        return NextResponse.json({
            subscriptionId: subscription.id,
            amount: plan.amount,
            currency: 'INR',
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            type: 'subscription',
            interval: plan.interval,
        }, { headers: rateLimitHeaders });

    } catch (error) {
        console.error('❌ Checkout error:', error);

        const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";

        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}