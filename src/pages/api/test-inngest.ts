// src/pages/api/test-inngest.ts
// Use this to test if Inngest is actually working

import { NextApiRequest, NextApiResponse } from 'next';
import { Inngest } from 'inngest';

const inngest = new Inngest({
    id: 'acme-saas',
    eventKey: process.env.INNGEST_EVENT_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Send test event to trigger organization-created function
        const result = await inngest.send({
            name: "organization.created",
            data: {
                organizationId: "test-org-123",
                userId: "test-user-456"
            }
        });

        res.status(200).json({
            success: true,
            message: "Event sent successfully!",
            instructions: "Check Inngest dashboard → Runs tab to see execution",
            eventId: result.ids[0]
        });
    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            hint: "Check INNGEST_EVENT_KEY is set in Vercel env vars"
        });
    }
}