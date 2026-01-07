// src/app/api/admin/impersonate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Verify requester is admin
        const cookieStore = await cookies();
        const authCookie = cookieStore.get("sb-access-token");

        if (!authCookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Verify admin making the request
        const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.getUser(authCookie.value);

        if (adminError || !adminUser) {
            return NextResponse.json(
                { error: "Invalid admin session" },
                { status: 401 }
            );
        }

        // Check if requester is super admin
        const { data: adminProfile } = await supabaseAdmin
            .from("profiles")
            .select("is_super_admin, is_admin")
            .eq("id", adminUser.id)
            .single();

        if (!adminProfile?.is_super_admin && !adminProfile?.is_admin) {
            return NextResponse.json(
                { error: "Admin privileges required" },
                { status: 403 }
            );
        }

        // Log the impersonation attempt
        await supabaseAdmin.from("audit_logs").insert({
            user_id: adminUser.id,
            action: "admin_impersonate_user",
            details: {
                target_user_id: userId,
                admin_email: adminUser.email,
                timestamp: new Date().toISOString(),
            },
        });

        // Generate authentication session for target user
        const { data: sessionData, error: sessionError } =
            await supabaseAdmin.auth.admin.generateLink({
                type: "magiclink",
                email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email!,
            });

        if (sessionError || !sessionData) {
            return NextResponse.json(
                { error: "Failed to generate impersonation session" },
                { status: 500 }
            );
        }

        // Create a session for the target user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email!,
            email_confirm: true,
        });

        return NextResponse.json({
            success: true,
            message: "Impersonation session created",
            redirectUrl: `/dashboard?impersonated=true&originalAdmin=${adminUser.id}`,
        });

    } catch (error: any) {
        console.error("Impersonation error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}