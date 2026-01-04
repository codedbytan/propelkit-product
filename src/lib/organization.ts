// src/lib/organizations.ts
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { Organization, OrganizationMember, OrganizationInvite } from '@/types/organization';
import {
    createOrganizationSchema,
    updateOrganizationSchema,
    inviteMemberSchema,
    generateSlug,
    OrganizationNotFoundError, // ✅ Import the error classes
    InsufficientPermissionsError,
    DuplicateSlugError,
    InviteExpiredError,
    OrganizationError, // ✅ Add this
} from '@/types/organization';
import { sendInviteEmail, sendOrganizationWelcomeEmail } from '@/lib/email'; // ✅ Fixed import
import { inngest } from '@/lib/inngest'; // ✅ Fixed import


// ============================================
// ORGANIZATION CRUD
// ============================================

export async function createOrganization(data: {
    name: string;
    slug?: string;
    userId: string;
}): Promise<Organization> {
    // Validate
    const validated = createOrganizationSchema.parse({
        name: data.name,
        slug: data.slug || generateSlug(data.name),
    });

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', validated.slug)
        .is('deleted_at', null)
        .maybeSingle();

    if (existing) {
        throw new DuplicateSlugError(validated.slug);
    }

    // Create org
    const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
            name: validated.name,
            slug: validated.slug,
            created_by: data.userId,
            subscription_status: 'trial',
        })
        .select()
        .single();

    if (orgError) throw orgError;

    // Add creator as owner
    const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: data.userId,
            role: 'owner',
        });

    if (memberError) {
        // Rollback: delete org
        await supabaseAdmin.from('organizations').delete().eq('id', org.id);
        throw memberError;
    }

    // Audit log
    await logAudit({
        user_id: data.userId,
        action: 'organization_created',
        details: { organization_id: org.id, name: org.name },
    });

    // Send welcome email (async)
    await inngest.send({
        name: 'organization.created',
        data: { organizationId: org.id, userId: data.userId },
    });

    return org;
}

export async function getOrganization(
    orgId: string,
    userId: string
): Promise<Organization> {
    const { data: org, error } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .is('deleted_at', null)
        .single();

    if (error || !org) throw new OrganizationNotFoundError(orgId);

    // Verify user has access
    const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .maybeSingle();

    if (!membership) {
        throw new InsufficientPermissionsError('access this organization');
    }

    return org;
}

export async function updateOrganization(
    orgId: string,
    userId: string,
    updates: Partial<Organization>
): Promise<Organization> {
    // Validate
    const validated = updateOrganizationSchema.parse(updates);

    // Check permissions
    const role = await getUserRole(orgId, userId);
    if (role !== 'owner' && role !== 'admin') {
        throw new InsufficientPermissionsError('update organization');
    }

    // Update
    const { data: org, error } = await supabaseAdmin
        .from('organizations')
        .update(validated)
        .eq('id', orgId)
        .is('deleted_at', null)
        .select()
        .single();

    if (error) throw error;

    await logAudit({
        user_id: userId,
        action: 'organization_updated',
        details: { organization_id: orgId, updates: validated },
    });

    return org;
}

export async function deleteOrganization(
    orgId: string,
    userId: string
): Promise<void> {
    // Only owners can delete
    const role = await getUserRole(orgId, userId);
    if (role !== 'owner') {
        throw new InsufficientPermissionsError('delete organization');
    }

    // Soft delete
    const { error } = await supabaseAdmin
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', orgId);

    if (error) throw error;

    await logAudit({
        user_id: userId,
        action: 'organization_deleted',
        details: { organization_id: orgId },
    });
}

// ============================================
// MEMBER MANAGEMENT
// ============================================

export async function getUserRole(
    orgId: string,
    userId: string
): Promise<OrganizationMember['role'] | null> {
    const { data } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .maybeSingle();

    return data?.role ?? null;
}

export async function getOrganizationMembers(
    orgId: string,
    userId: string
): Promise<Array<OrganizationMember & { user: { email: string; full_name?: string } }>> {
    // Verify access
    await getOrganization(orgId, userId);

    const { data: members, error } = await supabaseAdmin
        .from('organization_members')
        .select(`
      *,
      user:user_id (
        email,
        raw_user_meta_data
      )
    `)
        .eq('organization_id', orgId)
        .order('joined_at', { ascending: true });

    if (error) throw error;

    return members.map((m: any) => ({
        ...m,
        user: {
            email: m.user.email,
            full_name: m.user.raw_user_meta_data?.full_name,
        },
    }));
}

export async function inviteMember(
    orgId: string,
    inviterId: string,
    data: { email: string; role: 'admin' | 'member' }
): Promise<OrganizationInvite> {
    // Validate
    const validated = inviteMemberSchema.parse(data);

    // Check permissions
    const role = await getUserRole(orgId, inviterId);
    if (role !== 'owner' && role !== 'admin') {
        throw new InsufficientPermissionsError('invite members');
    }

    // Check if already a member
    const { data: existingUser } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', validated.email)
        .maybeSingle();

    if (existingUser) {
        const { data: existingMember } = await supabaseAdmin
            .from('organization_members')
            .select('id')
            .eq('organization_id', orgId)
            .eq('user_id', existingUser.id)
            .maybeSingle();

        if (existingMember) {
            throw new OrganizationError('User is already a member', 'ALREADY_MEMBER');
        }
    }

    // Check for pending invite
    const { data: pendingInvite } = await supabaseAdmin
        .from('organization_invites')
        .select('id')
        .eq('organization_id', orgId)
        .eq('email', validated.email)
        .is('accepted_at', null)
        .maybeSingle();

    if (pendingInvite) {
        throw new OrganizationError('Invite already sent', 'INVITE_PENDING');
    }

    // Create invite
    const { data: invite, error } = await supabaseAdmin
        .from('organization_invites')
        .insert({
            organization_id: orgId,
            email: validated.email,
            role: validated.role,
            invited_by: inviterId,
        })
        .select()
        .single();

    if (error) throw error;

    // Send email
    const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

    await sendInviteEmail({
        to: validated.email,
        organizationName: org!.name,
        inviteToken: invite.token,
        role: validated.role,
    });

    await logAudit({
        user_id: inviterId,
        action: 'member_invited',
        details: { organization_id: orgId, email: validated.email, role: validated.role },
    });

    return invite;
}

export async function acceptInvite(
    token: string,
    userId: string
): Promise<OrganizationMember> {
    // Get invite
    const { data: invite, error: inviteError } = await supabaseAdmin
        .from('organization_invites')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .single();

    if (inviteError || !invite) {
        throw new OrganizationError('Invalid invite token', 'INVALID_TOKEN');
    }

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
        throw new InviteExpiredError();
    }

    // Get user email
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user.user || user.user.email !== invite.email) {
        throw new OrganizationError('Email mismatch', 'EMAIL_MISMATCH');
    }

    // Add as member
    const { data: member, error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
            organization_id: invite.organization_id,
            user_id: userId,
            role: invite.role,
            invited_by: invite.invited_by,
            invited_at: invite.created_at,
        })
        .select()
        .single();

    if (memberError) throw memberError;

    // Mark invite as accepted
    await supabaseAdmin
        .from('organization_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id);

    await logAudit({
        user_id: userId,
        action: 'member_joined',
        details: { organization_id: invite.organization_id },
    });

    return member;
}

export async function removeMember(
    orgId: string,
    adminId: string,
    memberId: string
): Promise<void> {
    // Check permissions
    const adminRole = await getUserRole(orgId, adminId);
    if (adminRole !== 'owner' && adminRole !== 'admin') {
        throw new InsufficientPermissionsError('remove members');
    }

    // Can't remove yourself
    if (adminId === memberId) {
        throw new OrganizationError('Cannot remove yourself', 'CANNOT_REMOVE_SELF');
    }

    // Can't remove owner
    const memberRole = await getUserRole(orgId, memberId);
    if (memberRole === 'owner') {
        throw new OrganizationError('Cannot remove owner', 'CANNOT_REMOVE_OWNER');
    }

    const { error } = await supabaseAdmin
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', memberId);

    if (error) throw error;

    await logAudit({
        user_id: adminId,
        action: 'member_removed',
        details: { organization_id: orgId, member_id: memberId },
    });
}

// ============================================
// HELPERS
// ============================================

async function logAudit(data: {
    user_id: string;
    action: string;
    details: Record<string, any>;
}) {
    await supabaseAdmin.from('audit_logs').insert(data);
}