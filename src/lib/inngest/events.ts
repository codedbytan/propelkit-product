// src/lib/inngest/events.ts
// ⚠️ CRITICAL: All event names use DOTS not slashes!
// Example: "user.signed-up" NOT "user/signed-up"

export type InngestEvents = {
    // User events
    "user.signed-up": {
        data: {
            userId: string;
            email: string;
            name?: string;
        };
    };

    // License & Purchase events
    "license.purchased": {
        data: {
            userId: string;
            licenseId: string;
            planKey: string;
            email: string;
            amount: number;
        };
    };

    // Organization events
    "organization.created": {
        data: {
            organizationId: string;
            userId: string;
        };
    };

    "organization.member-invited": {
        data: {
            organizationId: string;
            email: string;
            invitedBy: string;
            role: "admin" | "member";
            inviteToken: string;
        };
    };

    // Invoice events
    "invoice.generated": {
        data: {
            invoiceId: string;
            userId: string;
            email: string;
        };
    };

    // Subscription events
    "subscription.charged": {
        data: {
            subscriptionId: string;
            userId: string;
            email: string;
            amount: number;
            planId: string;
        };
    };

    "subscription.cancelled": {
        data: {
            subscriptionId: string;
            userId: string;
            immediately: boolean;
        };
    };

    // Webhook events
    "webhook.failed": {
        data: {
            eventId: string;
            eventType: string;
            payload: any;
            error: string;
            attemptNumber: number;
        };
    };
};
