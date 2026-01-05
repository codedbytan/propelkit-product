// src/inngest/client.ts
import { Inngest } from "inngest";

// Create Inngest client
export const inngest = new Inngest({
    id: process.env.NEXT_PUBLIC_INNGEST_APP_NAME || "propelkit",
    name: "PropelKit",
});

// Event types for type safety
export type Events = {
    "user/signed-up": {
        data: {
            userId: string;
            email: string;
            name?: string;
        };
    };
    "user/upgraded": {
        data: {
            userId: string;
            email: string;
            planId: string;
            amount: number;
        };
    };
    "invoice/generate": {
        data: {
            invoiceId: string;
            userId: string;
            email: string;
            organizationId?: string;
        };
    };
    "webhook/failed": {
        data: {
            eventId: string;
            eventType: string;
            payload: any;
            error: string;
            attemptNumber: number;
        };
    };
    "subscription/charged": {
        data: {
            subscriptionId: string;
            userId: string;
            email: string;
            amount: number;
            planId: string;
        };
    };
    "organization/member-invited": {
        data: {
            organizationId: string;
            email: string;
            invitedBy: string;
            role: "admin" | "member";
            inviteToken: string;
        };
    };
};