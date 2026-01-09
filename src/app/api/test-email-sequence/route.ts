// src/app/api/test-email-sequence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // ✅ FIXED: Changed from "user/signed-up" to "user.signed-up"
        // Inngest event names use DOTS not slashes!
        await inngest.send({
            name: "user.signed-up",  // ✅ FIXED: DOT instead of SLASH
            data: {
                userId: "test-user-123",
                email: email || "test@example.com",
                name: "Test User",
            },
        });

        return NextResponse.json({
            success: true,
            message: `Onboarding sequence triggered for ${email}`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}