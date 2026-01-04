// src/app/api/verify-plans/route.ts
// This endpoint checks if your Razorpay plans actually exist

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET() {
    const results: any = {
        timestamp: new Date().toISOString(),
        razorpay_mode: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'TEST' : 'LIVE',
        plans: {},
        summary: {
            total_checked: 0,
            existing: 0,
            missing: 0,
        }
    };

    const plansToCheck = [
        {
            key: 'starter_monthly',
            plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY,
            expected: 'Monthly plan (₹999/month)'
        },
        {
            key: 'pro_yearly',
            plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY,
            expected: 'Yearly plan (₹29,999/year)'
        }
    ];

    for (const planConfig of plansToCheck) {
        results.summary.total_checked++;

        if (!planConfig.plan_id) {
            results.plans[planConfig.key] = {
                status: '❌ NOT CONFIGURED',
                error: 'Plan ID not set in environment variables',
                expected: planConfig.expected
            };
            results.summary.missing++;
            continue;
        }

        try {
            // Try to fetch the plan from Razorpay
            const plan = await razorpay.plans.fetch(planConfig.plan_id);

            results.plans[planConfig.key] = {
                status: '✅ EXISTS',
                plan_id: plan.id,
                interval: plan.interval,
                period: plan.period,
                amount: `₹${(Number(plan.item.amount) / 100).toLocaleString('en-IN')}`,
                currency: plan.item.currency,
                active: !plan.notes?.status || plan.notes.status === 'active'
            };
            results.summary.existing++;

        } catch (error: any) {
            results.plans[planConfig.key] = {
                status: '❌ NOT FOUND',
                plan_id: planConfig.plan_id,
                error: error.error?.description || error.message,
                statusCode: error.statusCode,
                expected: planConfig.expected,
                fix: 'Create this plan in Razorpay Dashboard → Subscriptions → Plans'
            };
            results.summary.missing++;
        }
    }

    // Overall status
    if (results.summary.existing === results.summary.total_checked) {
        results.overall = '✅ All plans exist and are configured correctly!';
    } else if (results.summary.existing === 0) {
        results.overall = '❌ No plans found - Create them in Razorpay Dashboard';
    } else {
        results.overall = `⚠️ ${results.summary.missing} plan(s) missing`;
    }

    return NextResponse.json(results, {
        status: results.summary.existing === results.summary.total_checked ? 200 : 500
    });
}