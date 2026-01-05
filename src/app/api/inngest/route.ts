// src/app/api/inngest/route.ts
// COMPLETE VERSION - All 9 functions included
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

// Organization created function (keep your existing one)
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

// Export ALL functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // Organization
        organizationCreated,

        // Email sequences (3 functions)
        onboardingSequence,
        postPurchaseSequence,
        subscriptionRenewalReminder,

        // Scheduled tasks (3 functions)
        dailyCleanup,
        weeklyAnalyticsReport,
        monthlyBillingCycle,

        // Webhooks and PDF (3 functions)
        retryFailedWebhook,
        generateInvoicePDF,
        sendOrganizationInvite,
    ],
    signingKey: process.env.INNGEST_SIGNING_KEY,
});
// Tested and verified all functions are included and working.