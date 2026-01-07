// src/lib/inngest/client.ts
import { Inngest } from "inngest";
import { BRAND_CONFIG } from "@/config/brand";

// ✅ Create Inngest client using centralized config
export const inngest = new Inngest({
    id: BRAND_CONFIG.inngest.appId,       // "propelkit-acme-prod"
    name: BRAND_CONFIG.inngest.appName,   // "PropelKit Product"
    // Event key is injected by Inngest automatically in production
    // For local dev, set INNGEST_EVENT_KEY=test in .env.local
});