// src/lib/inngest/functions/index.ts
// Export all Inngest functions for registration

export { onboardingSequence } from "./onboarding";
export { handleLicensePurchase } from "./license";
export { dailyCleanup } from "./scheduled";

// ✅ Also export from webhook PDF functions if they exist
// These are in a separate file but should be registered
export { generateInvoicePDF, sendOrganizationInvite } from "src/lib/inngest-webhooks-pdf";