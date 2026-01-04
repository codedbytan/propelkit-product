// src/lib/admin.ts
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export async function isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('is_admin, is_super_admin')
        .eq('id', userId)
        .single();

    return data?.is_admin || data?.is_super_admin || false;
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('is_super_admin')
        .eq('id', userId)
        .single();

    return data?.is_super_admin || false;
}

export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin) {
        throw new Error('Forbidden - Admin access required');
    }

    return user;
}

export async function requireSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const isSuperAdminUser = await isSuperAdmin(user.id);
    if (!isSuperAdminUser) {
        throw new Error('Forbidden - Super admin access required');
    }

    return user;
}

export async function logAdminAction(params: {
    adminId: string;
    action: string;
    targetUserId?: string;
    targetOrganizationId?: string;
    details?: Record<string, any>;
}) {
    await supabaseAdmin
        .from('admin_activity_log')
        .insert({
            admin_id: params.adminId,
            action: params.action,
            target_user_id: params.targetUserId,
            target_organization_id: params.targetOrganizationId,
            details: params.details,
        });
}