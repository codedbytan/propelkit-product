import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase-server";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            return NextResponse.json(
                { error: "Razorpay not configured" },
                { status: 500 }
            );
        }

        // 1. Secure the route (Optional: Allow guests to buy, but better if logged in)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Please log in to purchase." }, { status: 401 });
        }

        const body = await req.json();
        const { planKey } = body;

        // 2. Define Prices (Server-Side Validation)
        // NEVER trust the price sent from the frontend.
        const prices: Record<string, number> = {
            "starter_lifetime": 299900, // ₹2,999 in paise
            "pro_lifetime": 599900,     // ₹5,999 in paise
        };

        const amount = prices[planKey];
        if (!amount) return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });

        // 3. Create Razorpay Order
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
        console.error("Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
