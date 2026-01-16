// Default brand configuration
// This file will be overwritten by the setup wizard
// Run: npm run setup

export const brand = {
  name: "My App",
  tagline: "Built with PropelKit",
  description: "My App - Built with PropelKit",

  product: {
    name: "My App",
    version: "1.0.0",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  company: {
    legalName: "My App Pvt Ltd",
    gstin: "YOUR_GSTIN_HERE",
    address: {
      line1: "Your Address",
      city: "Your City",
      state: "Your State",
      stateCode: "00",
      pincode: "000000",
      country: "India",
    },
    pan: "YOUR_PAN_HERE",
  },

  contact: {
    email: "support@example.com",
    phone: "+91-XXXXXXXXXX",
    supportUrl: "/support",
  },

  email: {
    fromSupport: "My App Support <support@example.com>",
    fromBilling: "My App Billing <billing@example.com>",
    fromNoReply: "My App <noreply@example.com>",
    replyTo: "support@example.com",
  },

  pricing: {
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
  },

  social: {
    twitter: "",
    github: "",
    discord: "",
  },

  inngest: {
    appId: process.env.INNGEST_APP_ID || "my-app",
    appName: "My App Background Jobs",
  },

  invoice: {
    sacCode: "998314", // SAC code for IT services
  },

  seo: {
    title: "My App - Built with PropelKit",
    description: "Built with PropelKit",
    keywords: ["saas", "nextjs", "india", "boilerplate"],
    ogImage: "/og-image.png",
    twitterHandle: "",
  },
};

export function formatPrice(amountInPaise: number): string {
  const amountInRupees = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: brand.pricing.currency,
    minimumFractionDigits: 0,
  }).format(amountInRupees);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(brand.pricing.locale, {
    style: "currency",
    currency: brand.pricing.currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateInvoiceNumber(licenseId: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const shortId = licenseId.slice(-8).toUpperCase();
  return `INV-${year}${month}-${shortId}`;
}
