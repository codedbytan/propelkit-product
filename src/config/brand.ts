// src/config/brand.ts
// ===========================================
// 🎯 SINGLE SOURCE OF TRUTH FOR YOUR BRAND
// ===========================================
// This file controls ALL branding across your SaaS.
// Update once, changes reflect everywhere.

export const brand = {
    // ===========================================
    // PRODUCT IDENTITY
    // ===========================================
    name: "PropelKit",
    tagline: "Ship Your SaaS in Days, Not Months",
    description: "Next.js 15 SaaS boilerplate with Razorpay, GST invoicing, and multi-tenancy built for Indian developers",

    product: {
        name: "PropelKit",
        version: "1.0.0",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://propelkit.dev",
    },

    // ===========================================
    // COMPANY DETAILS
    // ===========================================
    company: {
        legalName: "PropelKit Technologies Pvt Ltd",
        gstin: "27AAAAA0000A1Z5", // ⚠️ IMPORTANT: Update with YOUR GSTIN
        address: {
            line1: "123 Startup Hub, Tech Park",
            line2: "Mumbai, Maharashtra - 400001",
            city: "Mumbai",
            state: "Maharashtra",
            stateCode: "27", // Maharashtra = 27
            pincode: "400001",
            country: "India",
        },
        pan: "AAAAA0000A", // ⚠️ IMPORTANT: Update with YOUR PAN
    },

    // ===========================================
    // CONTACT INFORMATION
    // ===========================================
    contact: {
        email: "support@propelkit.dev",
        phone: "+91-9876543210",
        supportUrl: "https://propelkit.dev/support",
    },

    // ===========================================
    // EMAIL CONFIGURATION
    // ===========================================
    email: {
        fromSupport: "PropelKit Support <support@propelkit.dev>",
        fromBilling: "PropelKit Billing <billing@propelkit.dev>",
        fromNoReply: "PropelKit <noreply@propelkit.dev>",
        replyTo: "support@propelkit.dev",
    },

    // ===========================================
    // PRICING & CURRENCY
    // ===========================================
    pricing: {
        currency: "INR",
        currencySymbol: "₹",
        plans: {
            starter: {
                name: "Starter",
                priceInPaise: 399900, // ₹3,999
                price: 3999,
                description: "Perfect for indie developers",
                features: [
                    "One-time payment",
                    "Lifetime updates",
                    "Email support",
                    "Full source code",
                ],
            },
            agency: {
                name: "Agency",
                priceInPaise: 999900, // ₹9,999
                price: 9999,
                description: "For agencies and teams",
                features: [
                    "Everything in Starter",
                    "Unlimited client projects",
                    "Priority support",
                    "Commercial license",
                    "White-label ready",
                ],
            },
        },
    },

    // ===========================================
    // GST & INVOICE SETTINGS
    // ===========================================
    invoice: {
        sacCode: "998314", // SAC code for Software Development Services
        prefix: "PROP", // Invoice number prefix (e.g., PROP/24-25/0001)
        taxRate: 0.18, // 18% GST
        hsnCode: "998314", // Same as SAC for software services
    },

    // ===========================================
    // RAZORPAY CONFIGURATION
    // ===========================================
    razorpay: {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        keySecret: process.env.RAZORPAY_KEY_SECRET || "",
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
        // Subscription plan IDs (create these in Razorpay Dashboard)
        plans: {
            monthly: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY || "",
            yearly: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY || "",
        },
    },

    // ===========================================
    // INNGEST CONFIGURATION (Background Jobs)
    // ===========================================
    inngest: {
        appId: "propelkit-acme-prod",   // ← Inngest app identifier (must be unique)
        appName: "PropelKit Product",   // ← Display name in Inngest dashboard
    },

    // ===========================================
    // SOCIAL LINKS
    // ===========================================
    social: {
        twitter: "https://twitter.com/propelkit",
        github: "https://github.com/propelkit",
        linkedin: "https://linkedin.com/company/propelkit",
        discord: "https://discord.gg/propelkit",
    },

    // ===========================================
    // FEATURES LIST (for marketing pages)
    // ===========================================
    features: [
        "Multi-tenancy with organizations & teams",
        "Razorpay payment integration",
        "GST-compliant invoicing",
        "Email with Resend",
        "Background jobs with Inngest",
        "Supabase authentication",
        "Row Level Security (RLS)",
        "shadcn/ui components",
    ],

    // ===========================================
    // SEO METADATA
    // ===========================================
    seo: {
        title: "PropelKit - Next.js SaaS Boilerplate for Indian Developers",
        description: "Ship your SaaS faster with PropelKit. Pre-built Razorpay payments, GST invoicing, multi-tenancy, and more.",
        keywords: "nextjs saas, india saas boilerplate, razorpay integration, gst invoicing, supabase auth",
        ogImage: "/og-image.png",
        twitterHandle: "@propelkit",
    },

    // ===========================================
    // LEGAL PAGES
    // ===========================================
    legal: {
        termsUrl: "/terms",
        privacyUrl: "/privacy",
        refundUrl: "/refund-policy",
    },
};

// ===========================================
// HELPER FUNCTIONS (Exported for use across app)
// ===========================================

/**
 * Format amount in paise to currency string
 * @param amountInPaise - Amount in paise (e.g., 399900)
 * @returns Formatted string (e.g., "₹3,999")
 */
export function formatPrice(amountInPaise: number): string {
    const amountInRupees = amountInPaise / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: brand.pricing.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amountInRupees);
}

/**
 * Generate sequential invoice number
 * @param sequenceId - Unique sequence ID (license ID, payment ID, etc.)
 * @returns Formatted invoice number (e.g., "PROP/24-25/0001")
 */
export function generateInvoiceNumber(sequenceId: string): string {
    // Get current financial year (Apr-Mar in India)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 3=Apr)

    // Financial year starts in April (month 3)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyEndYear = fyStartYear + 1;

    // Format: YY-YY (e.g., 24-25)
    const fy = `${fyStartYear % 100}-${fyEndYear % 100}`;

    // Use last 4 characters of sequenceId as invoice number
    const invoiceNum = sequenceId.slice(-4).padStart(4, '0');

    return `${brand.invoice.prefix}/${fy}/${invoiceNum}`;
}

/**
 * Calculate GST breakdown
 * @param amountInPaise - Taxable amount in paise
 * @param isSameState - Whether buyer is in same state as seller
 * @returns Object with GST breakdown
 */
export function calculateGST(amountInPaise: number, isSameState: boolean = true) {
    const taxableAmount = amountInPaise / 100;
    const gstRate = brand.invoice.taxRate;
    const totalGST = taxableAmount * gstRate;

    if (isSameState) {
        // Intra-state: Split into CGST + SGST
        return {
            taxableAmount,
            cgst: totalGST / 2,
            sgst: totalGST / 2,
            igst: 0,
            totalTax: totalGST,
            totalAmount: taxableAmount + totalGST,
        };
    } else {
        // Inter-state: IGST only
        return {
            taxableAmount,
            cgst: 0,
            sgst: 0,
            igst: totalGST,
            totalTax: totalGST,
            totalAmount: taxableAmount + totalGST,
        };
    }
}

/**
 * Validate GSTIN format
 * @param gstin - GSTIN string
 * @returns true if valid format
 */
export function validateGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
}

/**
 * Extract state code from GSTIN
 * @param gstin - GSTIN string
 * @returns State code (first 2 digits)
 */
export function getStateCodeFromGSTIN(gstin: string): string {
    if (!validateGSTIN(gstin)) {
        throw new Error(`Invalid GSTIN format: ${gstin}`);
    }
    return gstin.substring(0, 2);
}

// ===========================================
// TYPE EXPORTS (for TypeScript autocomplete)
// ===========================================
export type BrandConfig = typeof brand;

// ===========================================
// USAGE EXAMPLES FOR AI ASSISTANTS
// ===========================================
/*
EXAMPLE 1: Welcome Message
---------------------------
import { brand } from '@/config/brand';

export function WelcomeMessage() {
  return <h1>Welcome to {brand.name}!</h1>;
}

EXAMPLE 2: Email Template
---------------------------
import { brand } from '@/config/brand';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: brand.email.fromSupport,
  to: user.email,
  subject: `Welcome to ${brand.name}`,
  html: `<p>Thank you for joining ${brand.name}!</p>`,
});

EXAMPLE 3: Format Price
---------------------------
import { formatPrice } from '@/config/brand';

const displayPrice = formatPrice(399900); // "₹3,999"

EXAMPLE 4: Generate Invoice Number
---------------------------
import { generateInvoiceNumber } from '@/config/brand';

const invoiceNum = generateInvoiceNumber(licenseId); // "PROP/24-25/0001"

EXAMPLE 5: Payment Checkout
---------------------------
import { brand } from '@/config/brand';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: brand.razorpay.keyId,
  key_secret: brand.razorpay.keySecret,
});

const order = await razorpay.orders.create({
  amount: brand.pricing.plans.starter.priceInPaise,
  currency: brand.pricing.currency,
});

EXAMPLE 6: Calculate GST
---------------------------
import { calculateGST } from '@/config/brand';

const gst = calculateGST(399900, true); // Same state
console.log(gst.cgst, gst.sgst, gst.totalAmount);

EXAMPLE 7: Validate GSTIN
---------------------------
import { validateGSTIN, getStateCodeFromGSTIN } from '@/config/brand';

if (validateGSTIN(customerGSTIN)) {
  const stateCode = getStateCodeFromGSTIN(customerGSTIN);
}

EXAMPLE 8: Inngest Configuration
---------------------------
import { brand } from '@/config/brand';
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: brand.inngest.appId,
  name: brand.inngest.appName,
});
*/