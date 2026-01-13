import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import * as functions from "@/lib/inngest/functions";

// Force runtime evaluation of environment variables
const signingKey = process.env.INNGEST_SIGNING_KEY;
const eventKey = process.env.INNGEST_EVENT_KEY;

// Debug: Log key status (remove in production)
if (!signingKey) console.error("❌ INNGEST_SIGNING_KEY is missing!");
if (!eventKey) console.error("❌ INNGEST_EVENT_KEY is missing!");

const handler = serve({
    client: inngest,
    functions: Object.values(functions),
    signingKey: signingKey!,
    // Don't pass eventKey here - it's used in the client
});

// Disable Next.js body parsing for Inngest
export const config = {
    api: {
        bodyParser: false,
    },
};

export { handler as GET, handler as POST, handler as PUT };