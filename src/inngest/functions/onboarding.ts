// src/lib/inngest/functions/onboarding.ts
import { inngest } from '../client';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/email';

// Welcome email sequence (Day 1, 3, 7)
export const sendWelcomeSeries = inngest.createFunction(
    { id: 'send-welcome-series' },
    { event: 'user.signed-up' },
    async ({ event, step }) => {
        const { email, name, userId } = event.data;

        // Day 1: Welcome email
        await step.run('send-day-1-email', async () => {
            await resend.emails.send({
                from: 'Acme SaaS <onboarding@resend.dev>',
                to: email,
                subject: '👋 Welcome to Acme SaaS!',
                html: `
                    <h1>Hi ${name || 'there'}!</h1>
                    <p>Welcome to Acme SaaS. Here's what you can do next:</p>
                    <ul>
                        <li>Complete your profile</li>
                        <li>Invite team members</li>
                        <li>Explore the dashboard</li>
                    </ul>
                `
            });
        });

        // Wait 2 days
        await step.sleep('wait-2-days', '2d');

        // Day 3: Tips & tricks
        await step.run('send-day-3-email', async () => {
            await resend.emails.send({
                from: 'Acme SaaS <onboarding@resend.dev>',
                to: email,
                subject: '💡 Pro Tips for Getting Started',
                html: `
                    <h1>Quick tips to get the most out of Acme SaaS</h1>
                    <p>Here are 3 things successful users do:</p>
                    <ol>
                        <li>Set up their first project</li>
                        <li>Configure integrations</li>
                        <li>Invite their team</li>
                    </ol>
                `
            });
        });

        // Wait 4 more days
        await step.sleep('wait-4-days', '4d');

        // Day 7: Check-in
        await step.run('send-day-7-email', async () => {
            await resend.emails.send({
                from: 'Acme SaaS <onboarding@resend.dev>',
                to: email,
                subject: '🎯 How are things going?',
                html: `
                    <h1>How's your experience so far?</h1>
                    <p>We'd love to hear your feedback!</p>
                    <a href="https://yourdomain.com/feedback">Share Feedback</a>
                `
            });
        });
    }
);