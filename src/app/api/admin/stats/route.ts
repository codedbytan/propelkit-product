import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        await requireAdmin();

        const { data: stats } = await supabaseAdmin
            .from('admin_dashboard_stats')
            .select('*')
            .single();

        // Get growth charts data
        const { data: revenueByMonth } = await supabaseAdmin
            .rpc('get_revenue_by_month', { months: 12 });

        const { data: userGrowth } = await supabaseAdmin
            .rpc('get_user_growth', { months: 12 });

        return NextResponse.json({
            stats,
            charts: {
                revenue: revenueByMonth,
                users: userGrowth,
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.message === 'Unauthorized' ? 401 : 403 }
        );
    }
}