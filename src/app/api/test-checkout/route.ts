// src/app/api/test-checkout/route.ts
// Quick diagnostic endpoint to test checkout configuration

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

export async function GET(req: Request) {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        status: 'checking...',
        issues: [],
        warnings: [],
        config: {},
        user: {},
    };

    try {
        // 1. Check Environment Variables
        diagnostics.config.razorpay_key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
            ? `✅ Set (${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 15)}...)`
            : '❌ MISSING';

        diagnostics.config.razorpay_secret = process.env.RAZORPAY_KEY_SECRET
            ? '✅ Set'
            : '❌ MISSING';

        diagnostics.config.monthly_plan_id = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY
            ? `✅ Set (${process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY})`
            : '❌ MISSING';

        diagnostics.config.yearly_plan_id = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY
            ? `✅ Set (${process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY})`
            : '❌ MISSING';

        diagnostics.config.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL
            ? '✅ Set'
            : '❌ MISSING';

        diagnostics.config.supabase_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? '✅ Set'
            : '❌ MISSING';

        diagnostics.config.supabase_service = process.env.SUPABASE_SERVICE_ROLE_KEY
            ? '✅ Set'
            : '❌ MISSING';

        // Check for missing variables
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            diagnostics.issues.push('NEXT_PUBLIC_RAZORPAY_KEY_ID is missing');
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            diagnostics.issues.push('RAZORPAY_KEY_SECRET is missing');
        }
        if (!process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY) {
            diagnostics.issues.push('NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY is missing (required for recurring plans)');
        }
        if (!process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY) {
            diagnostics.issues.push('NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY is missing (required for recurring plans)');
        }

        // 2. Check User Authentication
        try {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                diagnostics.user.authenticated = '❌ Not logged in';
                diagnostics.warnings.push('User not authenticated - login required for checkout');
            } else {
                diagnostics.user.authenticated = '✅ Logged in';
                diagnostics.user.email = user.email;
                diagnostics.user.id = user.id;

                // 3. Check Organization
                const { data: membership } = await supabaseAdmin
                    .from('organization_members')
                    .select('organization_id, organizations(id, name)')
                    .eq('user_id', user.id)
                    .order('joined_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (membership) {
                    diagnostics.user.organization = '✅ Has organization';
                    diagnostics.user.organization_id = membership.organization_id;
                } else {
                    diagnostics.user.organization = '❌ No organization found';
                    diagnostics.issues.push('User has no organization - will cause checkout error');
                }
            }
        } catch (authError: any) {
            diagnostics.user.authenticated = '❌ Auth error: ' + authError.message;
            diagnostics.issues.push('Authentication system error');
        }

        // 4. Validate Plans Configuration
        diagnostics.plans = {};

        for (const [key, plan] of Object.entries(PLANS)) {
            const planCheck: any = {
                amount: plan.amount,
                type: plan.type,
            };

            if (plan.type === 'recurring') {
                const typedPlan = plan as typeof PLANS.starter_monthly | typeof PLANS.pro_yearly;
                planCheck.razorpay_plan_id = typedPlan.razorpay_plan_id || '❌ NOT SET';

                if (!typedPlan.razorpay_plan_id) {
                    diagnostics.issues.push(`Plan "${key}" is missing razorpay_plan_id`);
                }
            } else {
                planCheck.status = '✅ One-time payment (no plan ID needed)';
            }

            diagnostics.plans[key] = planCheck;
        }

        // 5. Determine Overall Status
        if (diagnostics.issues.length === 0) {
            diagnostics.status = '✅ All checks passed - Checkout should work!';
        } else {
            diagnostics.status = `❌ ${diagnostics.issues.length} issue(s) found`;
        }

        return NextResponse.json(diagnostics, {
            status: diagnostics.issues.length > 0 ? 500 : 200
        });

    } catch (error: any) {
        diagnostics.status = '❌ Diagnostic failed';
        diagnostics.error = error.message;
        return NextResponse.json(diagnostics, { status: 500 });
    }
}