// src/lib/inngest/events.ts
export type InngestEvents = {
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
    'organization.created': {
        data: {
            organizationId: string;
            userId: string;
        };
    };
    'invoice.generated': {
        data: {
            invoiceId: string;
            userId: string;
        };
    };
    'daily.cleanup': {
        data: {
            timestamp: string;
        };
    };
};