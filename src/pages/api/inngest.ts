// src/pages/api/inngest.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { sendOrganizationWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

// ✅ DEFAULT EXPORT (not named exports)
export default serve({
    client: inngest,
    functions: [organizationCreated],
    signingKey: process.env.INNGEST_SIGNING_KEY,
});