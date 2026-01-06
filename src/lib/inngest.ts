// src/lib/inngest.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
    id: 'acme-saas',
    eventKey: process.env.INNGEST_EVENT_KEY,
});

// ✅ ENHANCED Event types
export type InngestEvents = {
    // Existing
    'organization.created': {
        data: {
            organizationId: string;
            userId: string;
        };
    };
    'subscription.charged': {
        data: {
            organizationId: string;
            amount: number;
        };
    };
    'subscription.cancelled': {
        data: {
            organizationId: string;
            immediately: boolean;
        };
    };
    'member.invited': {
        data: {
            organizationId: string;
            email: string;
            role: 'admin' | 'member';
        };
    };

    // 🆕 ADD THESE for Priority 2: Background Jobs
    'user.signed-up': {
        data: {
            userId: string;
            email: string;
            name?: string;
        };
    };
    'license.purchased': {
        data: {
            userId: string;
            licenseId: string;
            planKey: string;
            email: string;
        };
    };
    'invoice.generated': {
        data: {
            invoiceId: string;
            userId: string;
            pdfUrl?: string;
        };
    };
    'daily.cleanup': {
        data: {
            timestamp: string;
        };
    };
};