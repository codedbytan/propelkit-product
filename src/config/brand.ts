// ============================================
// 🎯 BRAND CONFIGURATION (SINGLE SOURCE OF TRUTH)
// ============================================
// This file is the SINGLE SOURCE OF TRUTH for all project branding.
// AI assistants (Claude, Cursor, Windsurf, etc.) should ALWAYS reference
// this file instead of hardcoding "PropelKit" or any other project names.
// 
// When AI generates code, it should:
// 1. Import: import { brand } from '@/config/brand';
// 2. Use: brand.name, brand.url, brand.company, etc.
//
// EXAMPLE:
// ❌ WRONG:  const title = "PropelKit Dashboard";
// ✅ RIGHT:  const title = `${brand.name} Dashboard`;
//
// This ensures that when customers customize their project,
// ALL generated code automatically uses THEIR branding! 🚀
// ============================================

export const brand = {
    // ===========================================
    // CORE BRAND IDENTITY
    // ===========================================
    name: "PropelKit",                    // Your SaaS product name
    tagline: "Ship Your SaaS in Days",    // Short description
    url: "https://propelkit.dev",         // Production URL
    company: "PropelKit",                 // Legal company name

    // ===========================================
    // SUPABASE CONFIGURATION
    // ===========================================
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },

    // ===========================================
    // RAZORPAY CONFIGURATION (Indian Payments)
    // ===========================================
    razorpay: {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
    },

    // ===========================================
    // INNGEST CONFIGURATION (Background Jobs)
    // ===========================================
    inngest: {
        appId: "propelkit-acme-prod",   // Inngest app identifier (must be unique)
        appName: "PropelKit Product",   // Display name in Inngest dashboard
    },

    // ===========================================
    // EMAIL CONFIGURATION
    // ===========================================
    email: {
        fromName: "PropelKit",
        fromEmail: "support@propelkit.dev",
        fromSupport: "PropelKit Support <support@propelkit.dev>",
        fromBilling: "PropelKit Billing <billing@propelkit.dev>",
        fromInvites: "PropelKit <invites@propelkit.dev>",
    },

    // ===========================================
    // SOCIAL & LINKS
    // ===========================================
    social: {
        twitter: "https://twitter.com/propelkit",
        github: "https://github.com/yourusername/propelkit",
        discord: "https://discord.gg/propelkit",
    },

    // ===========================================
    // PRICING (for display purposes)
    // ===========================================
    pricing: {
        currency: "INR",
        currencySymbol: "₹",
        plans: {
            starter: {
                name: "Starter License",
                price: 2999,              // In rupees
                priceInPaise: 299900,     // In paise (for Razorpay)
            },
            agency: {
                name: "Agency License",
                price: 9999,
                priceInPaise: 999900,
            },
        },
    },

    // ===========================================
    // INVOICING
    // ===========================================
    invoicing: {
        companyName: "PropelKit",
        address: "123 Tech Street, Bangalore, Karnataka 560001",
        gstin: "29XXXXX1234X1ZX",  // Your GST Number
        pan: "ABCDE1234F",         // Your PAN
        email: "billing@propelkit.dev",
    },

    // ===========================================
    // FEATURES (for marketing & onboarding)
    // ===========================================
    features: {
        authentication: true,
        payments: true,
        backgroundJobs: true,
        emailNotifications: true,
        gstInvoicing: true,
        multiTenancy: true,
        superAdminDashboard: true,
    },
};

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

EXAMPLE 3: Page Metadata
---------------------------
import { brand } from '@/config/brand';

export const metadata = {
  title: `${brand.name} - ${brand.tagline}`,
  description: `Build and ship your SaaS with ${brand.name}`,
};

EXAMPLE 4: API Route
---------------------------
import { brand } from '@/config/brand';

export async function GET() {
  return Response.json({
    name: brand.name,
    url: brand.url,
    features: brand.features,
  });
}

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
*/