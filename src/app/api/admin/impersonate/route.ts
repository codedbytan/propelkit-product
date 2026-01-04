import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, logAdminAction } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const admin = await requireSuperAdmin();
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Generate impersonation token
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user!.email!,
        });

        if (error) throw error;

        // Log impersonation
        await logAdminAction({
            adminId: admin.id,
            action: 'user_impersonated',
            targetUserId: userId,
        });

        return NextResponse.json({
            impersonationUrl: data.properties.action_link,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}