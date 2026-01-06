// src/app/api/inngest/route.ts
// COMPLETE CORRECT VERSION - All 10 functions + signingKey

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { sendOrganizationWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Import email sequence functions
import {
    onboardingSequence,
    postPurchaseSequence,
    subscriptionRenewalReminder
} from '@/lib/inngest-functions';

// Import scheduled task functions
import {
    dailyCleanup,
    weeklyAnalyticsReport,
    monthlyBillingCycle
} from '@/lib/inngest-scheduled-tasks';

// Import webhook and PDF functions
import {
    retryFailedWebhook,
    generateInvoicePDF,
    sendOrganizationInvite
} from '@/lib/inngest-webhooks-pdf';

// ============================================
// FUNCTION 1: Organization Created
// ============================================
const organizationCreated = inngest.createFunction(
    { id: 'organization-created' },
    { event: 'organization.created' },
    async ({ event }) => {
        // Get org details
        const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('name')
            .eq('id', event.data.organizationId)
            .single();

        // Get user email
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(event.data.userId);

        if (org && user.user) {
            await sendOrganizationWelcomeEmail({
                to: user.user.email!,
                organizationName: org.name,
            });
        }
    }
);

// ============================================
// EXPORT SERVE HANDLER - WITH SIGNINGKEY
// ============================================
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // Function 1: Organization welcome
        organizationCreated,

        // Functions 2-4: Email sequences
        onboardingSequence,
        postPurchaseSequence,
        subscriptionRenewalReminder,

        // Functions 5-7: Scheduled tasks
        dailyCleanup,
        weeklyAnalyticsReport,
        monthlyBillingCycle,

        // Functions 8-10: Webhooks and PDF
        retryFailedWebhook,
        generateInvoicePDF,
        sendOrganizationInvite,
    ],
    // ✅✅✅ THIS IS THE CRITICAL LINE ✅✅✅
    signingKey: process.env.INNGEST_SIGNING_KEY,
});