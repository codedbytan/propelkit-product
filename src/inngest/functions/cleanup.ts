// src/lib/inngest/functions/cleanup.ts
import { inngest } from '../client';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Daily cleanup at 2 AM
export const dailyCleanup = inngest.createFunction(
    { id: 'daily-cleanup' },
    { cron: '0 2 * * *' }, // 2 AM every day
    async ({ step }) => {
        // Step 1: Delete expired tokens
        await step.run('delete-expired-tokens', async () => {
            const { data, error } = await supabaseAdmin
                .from('password_reset_tokens')
                .delete()
                .lt('expires_at', new Date().toISOString());

            console.log(`Deleted ${data?.length || 0} expired tokens`);
        });

        // Step 2: Clean up abandoned carts (if applicable)
        await step.run('clean-abandoned-checkouts', async () => {
            // Your cleanup logic
        });

        // Step 3: Send daily stats to admin
        await step.run('send-daily-report', async () => {
            const { count: newUsers } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            console.log(`New users in last 24h: ${newUsers}`);
            // Send email report here
        });
    }
);