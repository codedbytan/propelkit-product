// src/app/api/invoice/[licenseId]/route.ts
// FIXED for Next.js 15 - params is now a Promise

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ licenseId: string }> } // ✅ Changed to Promise
) {
    try {
        // ✅ Await the params
        const { licenseId } = await params;

        // Get invoice from database or generate new one
        const { data: license } = await supabaseAdmin
            .from("licenses")
            .select("*")
            .eq("id", licenseId) // ✅ Use awaited licenseId
            .single();

        if (!license) {
            return NextResponse.json(
                { error: "License not found" },
                { status: 404 }
            );
        }

        // Generate PDF (use your existing invoice generator)
        // const pdfBuffer = await generateInvoicePDF(...);

        // For now, return a placeholder
        return new NextResponse("PDF generation here", {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${licenseId}.pdf"` // ✅ Use awaited licenseId
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}