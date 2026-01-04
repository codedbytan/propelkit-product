import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Get all payments
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 50;

        let query = supabaseAdmin
            .from('invoices')
            .select(`
                *,
                user:user_id (email, id),
                organization:organization_id (name, id)
            `)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: payments, error } = await query;

        if (error) throw error;

        return NextResponse.json({ payments });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Issue refund
export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const { paymentId, amount } = await request.json();

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
        }

        // Issue refund via Razorpay
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount, // Amount in paise
        });

        // Update invoice status
        await supabaseAdmin
            .from('invoices')
            .update({ status: 'refunded' })
            .eq('id', paymentId);

        // Log action
        await logAdminAction({
            adminId: admin.id,
            action: 'payment_refunded',
            details: { paymentId, amount, refundId: refund.id },
        });

        return NextResponse.json({ success: true, refund });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}