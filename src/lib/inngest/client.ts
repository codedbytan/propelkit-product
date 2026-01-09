// src/lib/inngest/client.ts
import { Inngest } from "inngest";
import { brand } from "@/config/brand";  // ✅ FIXED: Changed from BRAND_CONFIG

// ✅ Create Inngest client using centralized config
export const inngest = new Inngest({
    id: brand.inngest.appId,       // ✅ FIXED: Changed from BRAND_CONFIG
    name: brand.inngest.appName,   // ✅ FIXED: Changed from BRAND_CONFIG
    // Event key is injected by Inngest automatically in production
    // For local dev, set INNGEST_EVENT_KEY=test in .env.local
});