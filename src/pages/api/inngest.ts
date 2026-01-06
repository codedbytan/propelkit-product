// src/pages/api/inngest.ts
// FIXED VERSION - No server-only import issues

import { serve } from "inngest/next";
import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

// Create Inngest client inline (no import from @/lib/inngest)
const inngest = new Inngest({
    id: 'acme-saas',
    eventKey: process.env.INNGEST_EVENT_KEY,
});

// Create Supabase admin client inline (no import from @/lib/supabase-admin)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Organization created function
const organizationCreated = inngest.createFunction(
    { id: 'organization-created' },
    { event: 'organization.created' },
    async ({ event }) => {
        try {
            // Get org details
            const { data: org } = await supabaseAdmin
                .from('organizations')
                .select('name')
                .eq('id', event.data.organizationId)
                .single();

            // Get user email
            const { data: user } = await supabaseAdmin.auth.admin.getUserById(event.data.userId);

            if (org && user.user && user.user.email) {
                // Send welcome email inline (instead of importing from @/lib/email)
                // For now, just log it - you can add Resend later
                console.log(`Welcome email would be sent to ${user.user.email} for org ${org.name}`);

                // TODO: Add actual email sending here when needed
                // await sendWelcomeEmail(user.user.email, org.name);
            }
        } catch (error) {
            console.error('Error in organizationCreated function:', error);
        }
    }
);

// DEFAULT EXPORT - No named exports
export default serve({
    client: inngest,
    functions: [organizationCreated],
    signingKey: process.env.INNGEST_SIGNING_KEY,
});