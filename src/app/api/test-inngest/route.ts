// src/app/api/test-inngest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, userId, eventType } = body;

        // Default to onboarding test
        const event = eventType || "user/signed-up";

        // Trigger the event
        await inngest.send({
            name: event,
            data: {
                userId: userId || "test-user-123",
                email: email || "test@example.com",
                name: "Test User",
            },
        });

        return NextResponse.json({
            success: true,
            message: `Triggered ${event} event for ${email}`,
        });
    } catch (error: any) {
        console.error("Test error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}