import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Trigger onboarding sequence
        await inngest.send({
            name: "user/signed-up",
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