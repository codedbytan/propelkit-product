// src/config/brand.ts
/**
 * 🎯 CENTRALIZED BRAND CONFIGURATION
 * 
 * This is the ONLY file your customers need to change!
 * All brand-specific details are stored here.
 * 
 * When someone clones the repo, they just update this file
 * and everything else automatically uses these values.
 */

export const BRAND_CONFIG = {
    // ===========================================
    // PRODUCT INFORMATION
    // ===========================================
    product: {
        name: "PropelKit",              // Your product name (used in emails, UI)
        tagline: "Ship Your SaaS in 24 Hours",
        description: "The fastest way to build and launch SaaS products in India",
        domain: "propelkit.dev",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://propelkit.dev",
    },

    // ===========================================
    // COMPANY INFORMATION
    // ===========================================
    company: {
        legalName: "PropelKit",         // Legal business name
        operatedBy: "Tanishq Agarwal",  // Owner/operator name
        address: {
            street: "Jagatpura",
            city: "Jaipur",
            state: "Rajasthan",
            stateCode: "08",              // For GST calculation
            pincode: "302017",
            country: "India",
        },
        gstin: "08AAAAA0000A1Z5",       // Your actual GSTIN (update when you get it)
    },

    // ===========================================
    // CONTACT INFORMATION
    // ===========================================
    contact: {
        email: "support@propelkit.dev",
        phone: "+91 63764 23215",
        adminEmail: "tanishqagarwalswm@gmail.com", // Where to receive notifications
    },

    // ===========================================
    // INNGEST CONFIGURATION
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
    // INVOICE CONFIGURATION
    // ===========================================
    invoice: {
        sacCode: "9983",                // SAC code for software services
        taxRate: 0.18,                  // 18% GST
        invoicePrefix: "INV-",          // Invoice number prefix
    },

    // ===========================================
    // FEATURES FLAGS (optional - for future use)
    // ===========================================
    features: {
        enableOrganizations: true,
        enableSubscriptions: true,
        enableBackgroundJobs: true,
        enableAnalytics: true,
    },
} as const;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get full company address as string
 */
export function getCompanyAddress(): string {
    const { address } = BRAND_CONFIG.company;
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country}`;
}

/**
 * Get formatted price
 */
export function formatPrice(amountInPaise: number): string {
    const amount = amountInPaise / 100;
    return `${BRAND_CONFIG.pricing.currencySymbol}${amount.toLocaleString("en-IN")}`;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(uniqueId: string): string {
    return `${BRAND_CONFIG.invoice.invoicePrefix}${uniqueId.slice(-8).toUpperCase()}`;
}

// ===========================================
// TYPE EXPORTS (for TypeScript)
// ===========================================
export type BrandConfig = typeof BRAND_CONFIG;