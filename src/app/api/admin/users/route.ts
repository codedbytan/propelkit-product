import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

// GET: List all users (super admin only)
export async function GET(request: NextRequest) {
    try {
        // Verify user is super admin
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is super admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_super_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get all users
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) throw error;

        return NextResponse.json({ users: users.users });

    } catch (error: any) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}