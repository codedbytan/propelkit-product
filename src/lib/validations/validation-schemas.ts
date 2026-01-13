// src/lib/validation-schemas.ts
// ✅ FIXED - All TypeScript errors resolved
// Zod validation schemas for ALL API endpoints

import { z } from "zod";

// ========================================
// COMMON VALIDATORS (Reusable patterns)
// ========================================

export const emailSchema = z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long");

export const slugSchema = z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((val) => val.toLowerCase());

export const uuidSchema = z.string().uuid("Invalid ID format");

export const phoneSchema = z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Invalid Indian phone number (format: +91XXXXXXXXXX)")
    .optional()
    .or(z.literal(""));

export const gstinSchema = z
    .string()
    .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format"
    )
    .optional()
    .or(z.literal(""));

export const urlSchema = z
    .string()
    .url("Invalid URL")
    .max(2048, "URL too long")
    .optional();

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

// ========================================
// ORGANIZATION SCHEMAS
// ========================================

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    slug: slugSchema.optional(),
    settings: z.record(z.string(), z.any()).optional(),
});

export const updateOrganizationSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100)
        .trim()
        .optional(),
    logo_url: urlSchema,
    settings: z.record(z.string(), z.any()).optional(),
});

// ✅ FIXED: Removed errorMap parameter (not supported in Zod v3)
export const inviteMemberSchema = z.object({
    email: emailSchema,
    role: z.enum(["admin", "member"], {
        message: "Role must be either 'admin' or 'member'",
    }),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(["owner", "admin", "member"]),
});

export const removeMemberSchema = z.object({
    memberId: uuidSchema,
});

// ========================================
// SUBSCRIPTION SCHEMAS
// ========================================

// Plan key enum - supports all possible plan variations for flexibility in boilerplate
export const planKeyEnum = z.enum([
    "starter_monthly",
    "starter_yearly",
    "starter_lifetime",
    "pro_monthly",
    "pro_yearly",
    "pro_lifetime",
    "agency_monthly",
    "agency_yearly",
    "agency_lifetime"
]);

export const checkoutSchema = z.object({
    planKey: planKeyEnum,
    couponCode: z.string().max(50).optional(),
});

export const cancelSubscriptionSchema = z.object({
    organizationId: uuidSchema,
    cancelAtCycleEnd: z.boolean().optional().default(true),
});

export const upgradePlanSchema = z.object({
    organizationId: uuidSchema,
    newPlanKey: planKeyEnum,
});

// ========================================
// PAYMENT SCHEMAS
// ========================================

export const verifyPaymentSchema = z.object({
    orderCreationId: z.string().min(1, "Order ID required"),
    razorpayPaymentId: z.string().startsWith("pay_", "Invalid payment ID"),
    razorpaySignature: z.string().min(1, "Signature required"),
    razorpaySubscriptionId: z.string().startsWith("sub_").optional(),
    planKey: planKeyEnum,
});

export const createOrderSchema = z.object({
    amount: z.number().int().positive().max(10000000), // Max ₹1,00,000
    currency: z.literal("INR"),
    receipt: z.string().max(40).optional(),
    notes: z.record(z.string(), z.string()).optional(),
});

// ========================================
// USER/PROFILE SCHEMAS
// ========================================

export const updateProfileSchema = z.object({
    full_name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name too long")
        .trim()
        .optional(),
    phone: phoneSchema,
    company_name: z.string().max(200).trim().optional(),
    gstin: gstinSchema,
    avatar_url: urlSchema,
});

export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    full_name: z.string().min(2).max(100).trim().optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password required"),
});

export const resetPasswordSchema = z.object({
    email: emailSchema,
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
});

// ========================================
// WEBHOOK SCHEMAS
// ========================================

export const razorpayWebhookSchema = z.object({
    event: z.string(),
    payload: z.any(),
    account_id: z.string().optional(),
    created_at: z.number(),
});

// ========================================
// ADMIN SCHEMAS
// ========================================

export const adminUserSearchSchema = z.object({
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const adminImpersonateSchema = z.object({
    userId: uuidSchema,
});

export const adminRefundSchema = z.object({
    paymentId: z.string().startsWith("pay_"),
    amount: z.number().int().positive().optional(),
    reason: z.string().max(500).optional(),
});

// ========================================
// COUPON SCHEMAS
// ========================================

export const createCouponSchema = z.object({
    code: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[A-Z0-9]+$/, "Coupon code must be uppercase letters and numbers only")
        .transform((val) => val.toUpperCase()),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().int().positive(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    appliesTo: z
        .object({
            plans: z.array(z.string()).optional(),
        })
        .optional(),
});

export const validateCouponSchema = z.object({
    code: z.string().max(20),
    planKey: z.string(),
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Validate request body and return typed data or formatted error
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    body: unknown
): { success: true; data: T } | { success: false; error: z.ZodError; formattedError: any } {
    const result = schema.safeParse(body);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        error: result.error,
        formattedError: result.error.format(),
    };
}

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
        .replace(/<[^>]+>/g, "") // Remove HTML tags
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Check if error is a Zod validation error
 */
export function isZodError(error: unknown): error is z.ZodError {
    return error instanceof z.ZodError;
}

/**
 * Format Zod errors for API response
 */
export function formatZodError(error: z.ZodError): {
    message: string;
    errors: Record<string, string[]>;
} {
    const formatted = error.format();
    const errors: Record<string, string[]> = {};

    Object.keys(formatted).forEach((key) => {
        if (key === "_errors") return;
        const fieldErrors = (formatted as any)[key]?._errors;
        if (fieldErrors && fieldErrors.length > 0) {
            errors[key] = fieldErrors;
        }
    });

    return {
        message: "Validation failed",
        errors,
    };
}