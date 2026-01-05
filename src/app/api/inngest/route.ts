// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { sendOrganizationWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    onboardingSequence,
    postPurchaseSequence
} from '@/lib/inngest-functions'; // ✅ Import new functions

// Keep your existing function
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

// Export with ALL functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        organizationCreated,    // ✅ Your existing function
        onboardingSequence,     // ✅ New: Day 1, 3, 7 emails
        postPurchaseSequence,   // ✅ New: Post-purchase flow
    ],
});