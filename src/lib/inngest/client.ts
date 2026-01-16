// src/lib/inngest/client.ts
import { Inngest } from "inngest";
import { brand } from "@/config/brand";

// Create Inngest client using centralized config
export const inngest = new Inngest({
    id: brand.inngest.appId,
    name: brand.inngest.appName,
    // Event key is injected by Inngest automatically in production
    // For local dev, set INNGEST_EVENT_KEY=test in .env.local
});
