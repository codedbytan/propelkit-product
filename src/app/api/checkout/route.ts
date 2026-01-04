import { NextResponse } from "next/server";
import { razorpay, SUBSCRIPTION_PLANS } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
    try {
        console.log("🔹 Checkout API Started");

        // 1. Validate Configuration
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ Server Misconfigured: Missing Razorpay Keys");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // 2. Validate User (Must be logged in)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("⚠️ Unauthorized checkout attempt");
            return NextResponse.json({ error: "Please log in to purchase." }, { status: 401 });
        }

        const body = await req.json();
        const { planKey } = body;
        console.log(`🔹 User: ${user.id} | Plan: ${planKey}`);

        // ==========================================
        // SCENARIO A: RECURRING SUBSCRIPTION
        // ==========================================
        if (planKey in SUBSCRIPTION_PLANS) {
            const planId = SUBSCRIPTION_PLANS[planKey];

            if (!planId) {
                console.error(`❌ Plan ID missing in .env.local for ${planKey}`);
                return NextResponse.json({ error: "Plan not configured on server" }, { status: 500 });
            }

            console.log(`🔹 Creating Subscription with Plan ID: ${planId}`);

            try {
                const subscription = await razorpay.subscriptions.create({
                    plan_id: planId,
                    customer_notify: 1,
                    total_count: 120, // 10 years
                    quantity: 1,
                    notes: {
                        userId: user.id,
                        planKey: planKey,
                        type: 'recurring'
                    }
                });

                return NextResponse.json({
                    subscriptionId: subscription.id, // Frontend needs this
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
                });
            } catch (rzpError: any) {
                console.error("❌ Razorpay Subscription Error:", rzpError);
                return NextResponse.json({ error: rzpError.error?.description || "Payment initialization failed" }, { status: 500 });
            }
        }

        // ==========================================
        // SCENARIO B: LIFETIME (ONE-TIME)
        // ==========================================
        const prices: Record<string, number> = {
            "starter_lifetime": 299900, // ₹2,999
            "pro_lifetime": 599900,     // ₹5,999
        };

        const amount = prices[planKey];
        if (!amount) {
            return NextResponse.json({ error: "Invalid Plan Selected" }, { status: 400 });
        }

        console.log(`🔹 Creating One-Time Order: ₹${amount / 100}`);
        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: user.id,
                planKey: planKey,
                type: 'lifetime'
            }
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("🔥 FATAL CHECKOUT ERROR:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}