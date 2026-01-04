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
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY,
        total_count: 120  // 10 years of monthly billing
    },
    pro_yearly: {
        amount: 2999900,
        type: 'recurring',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY,
        total_count: 10  // 10 years of yearly billing
    },
} as const;

// Helper function to get or create organization
async function getOrCreateOrganization(userId: string, userEmail: string): Promise<string> {
    const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (membership) {
        return membership.organization_id;
    }

    // Create organization if doesn't exist
    console.log(`Creating organization for user ${userId}`);

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

    if (orgError) {
        console.error('Failed to create organization:', orgError);
        throw new Error('Failed to create organization');
    }

    const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
            organization_id: newOrg.id,
            user_id: userId,
            role: 'owner'
        });

    if (memberError) {
        console.error('Failed to add user as member:', memberError);
        await supabaseAdmin.from('organizations').delete().eq('id', newOrg.id);
        throw new Error('Failed to set up organization membership');
    }

    console.log(`✅ Created organization ${newOrg.id} for user ${userId}`);
    return newOrg.id;
}

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

        if (!user.email) {
            return NextResponse.json({ error: "User email not found." }, { status: 400 });
        }

        const body = await req.json();
        const { planKey } = body;

        // 2. Validate plan
        const plan = PLANS[planKey as keyof typeof PLANS];
        if (!plan) {
            return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
        }

        // 3. Get or create user's organization
        let organizationId: string;
        try {
            organizationId = await getOrCreateOrganization(user.id, user.email);
        } catch (error) {
            console.error('Organization error:', error);
            return NextResponse.json(
                { error: "Failed to set up your account. Please contact support." },
                { status: 500 }
            );
        }

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
                    error: "Recurring plan not configured. Please check environment variables."
                }, { status: 500 });
            }

            try {
                const subscription = await razorpay.subscriptions.create({
                    plan_id: plan.razorpay_plan_id,
                    customer_notify: 1,
                    total_count: plan.total_count,  // Use the configured total_count (120 or 10)
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
            } catch (razorpayError: any) {
                console.error('Razorpay Error:', razorpayError);

                // Provide helpful error messages
                if (razorpayError.error?.description?.includes('does not exist') ||
                    razorpayError.error?.description?.includes('not found')) {
                    return NextResponse.json({
                        error: "Subscription plan not found. Please verify the plan exists in your Razorpay dashboard."
                    }, { status: 500 });
                }

                return NextResponse.json({
                    error: `Payment gateway error: ${razorpayError.error?.description || razorpayError.message}`
                }, { status: 500 });
            }
        }

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}