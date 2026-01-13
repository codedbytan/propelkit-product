import Razorpay from 'razorpay';

// Log warning if keys are missing to help debugging
if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) console.error("❌ MISSING: NEXT_PUBLIC_RAZORPAY_KEY_ID");
if (!process.env.RAZORPAY_KEY_SECRET) console.error("❌ MISSING: RAZORPAY_KEY_SECRET");

export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const CURRENCY = 'INR';

// These IDs must match your Razorpay Dashboard > Subscriptions > Plans
export const SUBSCRIPTION_PLANS: Record<string, string> = {
    'pro_monthly': process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY || '',
    'pro_yearly': process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY || '',
};