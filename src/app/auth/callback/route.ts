import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server"; // Ensure this matches your existing server client import

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // If there is a 'next' param, redirect there, otherwise go to /dashboard
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();

        // Exchange the "Code" for a "Session" (Login the user)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success! Redirect to dashboard
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error("Auth Callback Error:", error);
        }
    }

    // If something broke, send them back to login
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
