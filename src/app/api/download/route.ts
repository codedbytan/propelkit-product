import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin"; //

export async function POST() {
    try {
        // 1. Verify the User (Standard Security)
        // We MUST await this because your supabase-server.ts is async
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth Error:", authError);
            return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
        }

        console.log("User verified:", user.email);

        // 2. Generate Signed URL (Admin Security)
        // We use supabaseAdmin here because the bucket is PRIVATE.
        // Only the Service Role can generate links for private buckets without RLS policies.
        const { data, error } = await supabaseAdmin.storage
            .from("builds")
            .createSignedUrl("yourzipfile", 60); // Valid for 60 seconds

        if (error) {
            console.error("Supabase Storage Error:", error.message);
            return NextResponse.json({ error: "File not found in storage." }, { status: 404 });
        }

        console.log("Download URL generated successfully.");
        return NextResponse.json({ url: data.signedUrl });

    } catch (err: any) {
        console.error("Unexpected API Error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
