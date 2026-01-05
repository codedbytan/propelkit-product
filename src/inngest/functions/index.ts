// src/inngest/functions/index.ts
// Export all Inngest functions

import {
    onboardingSequence,
    postPurchaseSequence,
    subscriptionRenewalReminder,
} from "./email-sequences";

import {
    dailyCleanup,
    weeklyAnalyticsReport,
    monthlyBillingCycle,
} from "./scheduled-tasks";

import {
    retryFailedWebhook,
    generateInvoicePDF,
    sendOrganizationInvite,
} from "./webhooks-and-pdf";

// Export all functions as an array
export const functions = [
    // Email sequences
    onboardingSequence,
    postPurchaseSequence,
    subscriptionRenewalReminder,

    // Scheduled tasks
    dailyCleanup,
    weeklyAnalyticsReport,
    monthlyBillingCycle,

    // Webhooks & PDF
    retryFailedWebhook,
    generateInvoicePDF,
    sendOrganizationInvite,
];

// Export individual functions for direct use
export {
    // Email sequences
    onboardingSequence,
    postPurchaseSequence,
    subscriptionRenewalReminder,
    // Scheduled tasks
    dailyCleanup,
    weeklyAnalyticsReport,
    monthlyBillingCycle,
    // Webhooks & PDF
    retryFailedWebhook,
    generateInvoicePDF,
    sendOrganizationInvite,
};