import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 50;
        const offset = (page - 1) * limit;

        // Get users from auth with pagination
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: limit,
        });

        if (error) throw error;

        // Get profiles for additional data
        const userIds = users.map(u => u.id);
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .in('id', userIds);

        // Get subscription status
        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id, status, plan_id')
            .in('user_id', userIds)
            .eq('status', 'active');

        // Combine data
        const enrichedUsers = users.map(user => {
            const profile = profiles?.find(p => p.id === user.id);
            const subscription = subscriptions?.find(s => s.user_id === user.id);

            return {
                ...user,
                profile,
                subscription,
            };
        });

        // Filter by search
        const filtered = search
            ? enrichedUsers.filter(u =>
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
            )
            : enrichedUsers;

        return NextResponse.json({
            users: filtered,
            total: users.length,
            page,
            hasMore: users.length === limit,
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.message === 'Unauthorized' ? 401 : 403 }
        );
    }
}

// Delete user
export async function DELETE(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Delete user
        await supabaseAdmin.auth.admin.deleteUser(userId);

        // Log action
        await logAdminAction({
            adminId: admin.id,
            action: 'user_deleted',
            targetUserId: userId,
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}