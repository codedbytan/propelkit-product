import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { licenseId, razorpayPaymentId } = await request.json();

        // Verify admin
        // (add your admin verification here)

        // Get license details
        const { data: license } = await supabaseAdmin
            .from("licenses")
            .select("*")
            .eq("id", licenseId)
            .single();

        if (!license) {
            return NextResponse.json(
                { error: "License not found" },
                { status: 404 }
            );
        }

        // Process refund with Razorpay
        const refund = await razorpay.payments.refund(razorpayPaymentId, {
            amount: license.amount,
            notes: {
                license_id: licenseId,
                reason: "Admin refund"
            }
        });

        // Update license status
        await supabaseAdmin
            .from("licenses")
            .update({ status: "refunded" })
            .eq("id", licenseId);

        // Log refund
        await supabaseAdmin.from("audit_logs").insert({
            user_id: license.user_id,
            action: "payment_refund",
            details: {
                license_id: licenseId,
                refund_id: refund.id,
                amount: license.amount
            }
        });

        return NextResponse.json({
            success: true,
            refund_id: refund.id
        });

    } catch (error: any) {
        console.error("Refund error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}