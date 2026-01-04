// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { sendOrganizationWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Define your functions
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

// Export the serve handler
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        organizationCreated,
        // Add more functions here
    ],
});