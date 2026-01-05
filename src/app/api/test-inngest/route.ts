// src/app/api/test-inngest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
    try {
        // 1. Safely parse body
        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            console.log("⚠️ No JSON body provided, using defaults");
        }

        const { email, userId, eventType } = body as any;

        // 2. Define payload with fallback
        const eventName = eventType || "user/signed-up";
        const eventData = {
            userId: userId || "test-user-123",
            email: email || "test@example.com",
            name: "Test User",
        };

        console.log(`🚀 Triggering Event: ${eventName}`);
        console.log(`📦 Payload:`, eventData);

        // 3. Send to Inngest
        await inngest.send({
            name: eventName,
            data: eventData,
        });

        return NextResponse.json({
            success: true,
            message: `Triggered ${eventName} for ${eventData.email}`,
        });

    } catch (error: any) {
        console.error("🔥 Test Error:", error);
        return NextResponse.json({
            error: error.message,
            detail: "Check server logs for more info"
        }, { status: 500 });
    }
}