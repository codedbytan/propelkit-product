// src/pages/api/inngest.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";

// Import all your function files
import {
    onboardingSequence,
    postPurchaseSequence,
    subscriptionRenewalReminder
} from '@/lib/inngest-functions';

import {
    dailyCleanup,
    weeklyAnalyticsReport,
    monthlyBillingCycle
} from '@/lib/inngest-scheduled-tasks';

import {
    retryFailedWebhook,
    generateInvoicePDF,
    sendOrganizationInvite
} from '@/lib/inngest-webhooks-pdf';

import { sendOrganizationWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Organization created function
const organizationCreated = inngest.createFunction(
    { id: 'organization-created' },
    { event: 'organization.created' },
    async ({ event }) => {
        const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('name')
            .eq('id', event.data.organizationId)
            .single();

        const { data: user } = await supabaseAdmin.auth.admin.getUserById(event.data.userId);

        if (org && user.user) {
            await sendOrganizationWelcomeEmail({
                to: user.user.email!,
                organizationName: org.name,
            });
        }
    }
);

// ✅ DEFAULT EXPORT - NOT named exports!
export default serve({
    client: inngest,
    functions: [
        organizationCreated,
        onboardingSequence,
        postPurchaseSequence,
        subscriptionRenewalReminder,
        dailyCleanup,
        weeklyAnalyticsReport,
        monthlyBillingCycle,
        retryFailedWebhook,
        generateInvoicePDF,
        sendOrganizationInvite,
    ],
    signingKey: process.env.INNGEST_SIGNING_KEY,
});