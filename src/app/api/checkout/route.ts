import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 🔒 Input validation schema
const checkoutSchema = z.object({
    // ✅ FIX: Use 'message' directly or 'invalid_type_error' depending on your Zod version.
    // Based on your error log, it accepts { message: string }.
    planKey: z.enum(["starter_lifetime", "pro_lifetime"], {
        message: "Invalid plan selected"
    })
});

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Please log in to purchase." }, { status: 401 });
        }

        // 2. Parse and Validate Input
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const validation = checkoutSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.errors[0].message
            }, { status: 400 });
        }

        const { planKey } = validation.data;

        // 3. Server-Side Price Validation (NEVER TRUST CLIENT)
        const prices: Record<string, number> = {
            "starter_lifetime": 299900, // ₹2,999.00 in paise
            "pro_lifetime": 599900,     // ₹5,999.00 in paise
        };

        const amount = prices[planKey];
        if (!amount) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        // 4. Create Razorpay Order
        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: user.id,
                planKey: planKey,
                userEmail: user.email || "",
            }
        });

        // 5. Return Order Details
        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Checkout Error:", error);

        // Don't expose internal error details to client
        return NextResponse.json({
            error: "Unable to process request. Please try again."
        }, { status: 500 });
    }
}