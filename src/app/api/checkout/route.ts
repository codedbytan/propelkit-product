import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
    try {
        // 1. Secure the route
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Please log in to purchase." }, { status: 401 });
        }

        const body = await req.json();
        const { planKey } = body;

        // 2. Define Prices (Server-Side Validation)
        const prices: Record<string, number> = {
            "starter_lifetime": 399900, // ₹3,999.00
            "agency_lifetime": 999900,  // ₹9,999.00
        };

        const amount = prices[planKey];
        if (!amount) return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });

        // 3. Initialize Razorpay (LAZY INITIALIZATION to fix Build Error)
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay Error: Missing API Keys in Environment Variables.");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 4. Create Razorpay Order
        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: user.id,
                planKey: planKey,
            }
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Payment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}