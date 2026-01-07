// src/app/api/inngest/route.ts
// ⚠️ CRITICAL: This MUST be in /app/api/inngest/ for App Router

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Import functions directly - avoid index exports for now
import { onboardingSequence } from "@/lib/inngest/functions/onboarding";
import { handleLicensePurchase } from "@/lib/inngest/functions/license";
import { dailyCleanup } from "@/lib/inngest/functions/scheduled";

// Register all Inngest functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        onboardingSequence,
        handleLicensePurchase,
        dailyCleanup,
        // Add more functions here as you create them
    ],
});