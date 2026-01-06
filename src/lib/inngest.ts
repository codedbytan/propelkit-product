// src/lib/inngest.ts
import { Inngest } from 'inngest';

// Create Inngest client
export const inngest = new Inngest({
    id: 'propelkit-acme-prod',  // ← Unique name
    name: 'PropelKit Acme Production',
});

// Event types for type safety
export type InngestEvents = {
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
};