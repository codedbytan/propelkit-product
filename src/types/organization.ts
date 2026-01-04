// src/types/organization.ts
import { z } from 'zod';

// ============================================
// DATABASE TYPES
// ============================================

export type Organization = {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    settings: Record<string, any>;
    stripe_customer_id: string | null;
    subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
    subscription_plan: 'starter' | 'pro' | 'agency' | null;
    subscription_ends_at: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type OrganizationMember = {
    id: string;
    organization_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    invited_by: string | null;
    invited_at: string | null;
    joined_at: string;
    created_at: string;
};

export type OrganizationInvite = {
    id: string;
    organization_id: string;
    email: string;
    role: 'admin' | 'member';
    token: string;
    invited_by: string;
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
};

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

export const createOrganizationSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    slug: z.string()
        .min(2)
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
        .trim()
        .toLowerCase(),
});

export const updateOrganizationSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    logo_url: z.string().url().optional().nullable(),
    settings: z.record(z.string(), z.any()).optional(), // ✅ FIXED
});

export const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    role: z.enum(['admin', 'member']),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(['admin', 'member']),
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
}

export function canManageMembers(role: OrganizationMember['role']): boolean {
    return role === 'owner' || role === 'admin';
}

export function canManageBilling(role: OrganizationMember['role']): boolean {
    return role === 'owner';
}

export function canDeleteOrganization(role: OrganizationMember['role']): boolean {
    return role === 'owner';
}

// ============================================
// ERROR CLASSES
// ============================================

export class OrganizationError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'OrganizationError';
    }
}

export class InsufficientPermissionsError extends OrganizationError {
    constructor(action: string) {
        super(`Insufficient permissions to ${action}`, 'INSUFFICIENT_PERMISSIONS');
    }
}

export class OrganizationNotFoundError extends OrganizationError {
    constructor(identifier: string) {
        super(`Organization not found: ${identifier}`, 'ORG_NOT_FOUND');
    }
}

export class DuplicateSlugError extends OrganizationError {
    constructor(slug: string) {
        super(`Organization slug already exists: ${slug}`, 'DUPLICATE_SLUG');
    }
}

export class InviteExpiredError extends OrganizationError {
    constructor() {
        super('Invitation has expired', 'INVITE_EXPIRED');
    }
}