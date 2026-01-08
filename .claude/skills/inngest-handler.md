# Inngest Handler Skill (Background Jobs)

## Trigger
When user says: "Create background job for [task]" or "Add scheduled task" or "Run async [process]"

## What This Skill Does
Generates production-ready Inngest background jobs:
1. Event-triggered functions
2. Scheduled/cron jobs
3. Multi-step workflows
4. Email sequences
5. Webhook retry logic

---

## Inngest Setup in PropelKit

### Client Configuration
**File: `src/lib/inngest/client.ts`**

```typescript
import { Inngest } from 'inngest';
import { BRAND_CONFIG } from '@/config/brand';

export const inngest = new Inngest({
  id: BRAND_CONFIG.inngest.appId,     // "propelkit-acme-prod"
  name: BRAND_CONFIG.inngest.appName, // "PropelKit Product"
});
```

### API Route
**File: `src/app/api/inngest/route.ts`**

```typescript
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { allFunctions } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allFunctions,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
```

---

## Function Templates

### 1. Event-Triggered Function

```typescript
// src/lib/inngest/functions/[function-name].ts
import { inngest } from '../client';

export const myFunction = inngest.createFunction(
  { 
    id: 'my-function-name',          // Unique identifier
    name: 'My Function Display Name', // Optional display name
    retries: 3,                       // Number of retries on failure
  },
  { event: 'namespace/event.name' },  // Event trigger
  async ({ event, step }) => {
    // event.data contains the payload sent with inngest.send()
    const { userId, email } = event.data;

    // Step 1: First operation
    const result = await step.run('step-1-name', async () => {
      // Your logic here
      // Throwing an error will retry this step
      return { processed: true };
    });

    // Step 2: Can use result from previous step
    await step.run('step-2-name', async () => {
      console.log('Step 1 result:', result.processed);
      // More logic
    });

    // Return value is logged in Inngest dashboard
    return { success: true, processedAt: new Date().toISOString() };
  }
);
```

### 2. Scheduled (Cron) Job

```typescript
// src/lib/inngest/functions/scheduled-tasks.ts
import { inngest } from '../client';
import { createServiceClient } from '@/lib/supabase/service';

// Daily cleanup at 2 AM UTC
export const dailyCleanup = inngest.createFunction(
  { id: 'daily-cleanup' },
  { cron: '0 2 * * *' }, // Every day at 2:00 AM
  async ({ step }) => {
    const supabase = createServiceClient();

    // Delete expired tokens
    const { count: deletedTokens } = await step.run('delete-expired-tokens', async () => {
      const { data, error, count } = await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id', { count: 'exact' });
      
      return { count };
    });

    // Clean old webhook events (older than 30 days)
    const { count: deletedEvents } = await step.run('delete-old-webhooks', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { count } = await supabase
        .from('webhook_events')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('id', { count: 'exact' });
      
      return { count };
    });

    return { 
      deletedTokens, 
      deletedEvents,
      completedAt: new Date().toISOString() 
    };
  }
);

// Weekly analytics email (Every Monday at 9 AM)
export const weeklyAnalytics = inngest.createFunction(
  { id: 'weekly-analytics' },
  { cron: '0 9 * * 1' }, // Every Monday at 9:00 AM
  async ({ step }) => {
    const supabase = createServiceClient();

    // Gather stats
    const stats = await step.run('gather-stats', async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', weekAgo.toISOString());

      const { count: newLicenses } = await supabase
        .from('licenses')
        .select('id', { count: 'exact' })
        .gte('created_at', weekAgo.toISOString());

      return { newUsers, newLicenses };
    });

    // Send email to admin
    await step.run('send-analytics-email', async () => {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/send-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
    });

    return stats;
  }
);
```

### 3. Email Sequence (Drip Campaign)

```typescript
// src/lib/inngest/functions/email-sequences.ts
import { inngest } from '../client';
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/welcome';
import TipsEmail from '@/emails/tips-day3';
import CheckInEmail from '@/emails/checkin-day7';

export const welcomeSequence = inngest.createFunction(
  { id: 'welcome-email-sequence' },
  { event: 'user/signed-up' },
  async ({ event, step }) => {
    const { email, name, licenseKey, planName } = event.data;

    // Immediate: Welcome email
    await step.run('send-welcome', async () => {
      await sendEmail({
        to: email,
        subject: '🎉 Welcome to PropelKit!',
        react: WelcomeEmail({ name, licenseKey, planName }),
      });
    });

    // Day 3: Tips email
    await step.sleep('wait-3-days', '3 days');
    
    await step.run('send-tips', async () => {
      await sendEmail({
        to: email,
        subject: '3 tips to ship faster with PropelKit',
        react: TipsEmail({ name }),
      });
    });

    // Day 7: Check-in email
    await step.sleep('wait-4-days', '4 days');
    
    await step.run('send-checkin', async () => {
      await sendEmail({
        to: email,
        subject: 'How\'s your PropelKit setup going?',
        react: CheckInEmail({ name }),
      });
    });

    return { completed: true, email };
  }
);
```

### 4. Webhook Retry Logic

```typescript
// src/lib/inngest/functions/webhook-handler.ts
import { inngest } from '../client';

export const processWebhook = inngest.createFunction(
  { 
    id: 'process-webhook',
    retries: 5, // Retry up to 5 times
  },
  { event: 'webhook/received' },
  async ({ event, step }) => {
    const { webhookId, payload, targetUrl } = event.data;

    // Attempt to process
    const result = await step.run('process-payload', async () => {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      return { status: response.status };
    });

    // Log success
    await step.run('log-success', async () => {
      const supabase = createServiceClient();
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', webhookId);
    });

    return result;
  }
);
```

### 5. PDF Generation (Async)

```typescript
// src/lib/inngest/functions/pdf-generator.ts
import { inngest } from '../client';
import { createServiceClient } from '@/lib/supabase/service';

export const generateInvoicePDF = inngest.createFunction(
  { id: 'generate-invoice-pdf' },
  { event: 'invoice/created' },
  async ({ event, step }) => {
    const { invoiceId, userId } = event.data;

    // Generate PDF
    const pdfBuffer = await step.run('generate-pdf', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/invoice/${invoiceId}/generate`,
        { method: 'POST' }
      );
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    });

    // Upload to storage
    const pdfUrl = await step.run('upload-pdf', async () => {
      const supabase = createServiceClient();
      const fileName = `invoices/${userId}/${invoiceId}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    });

    // Update invoice record
    await step.run('update-invoice', async () => {
      const supabase = createServiceClient();
      await supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', invoiceId);
    });

    return { pdfUrl };
  }
);
```

---

## Export All Functions

**File: `src/lib/inngest/functions/index.ts`**

```typescript
// Import all functions
import { dailyCleanup, weeklyAnalytics } from './scheduled-tasks';
import { welcomeSequence } from './email-sequences';
import { processWebhook } from './webhook-handler';
import { generateInvoicePDF } from './pdf-generator';

// Export as array for Inngest serve()
export const allFunctions = [
  dailyCleanup,
  weeklyAnalytics,
  welcomeSequence,
  processWebhook,
  generateInvoicePDF,
];
```

---

## Triggering Events

### From API Routes

```typescript
// In any API route
import { inngest } from '@/lib/inngest/client';

// Trigger an event
await inngest.send({
  name: 'user/signed-up',
  data: {
    userId: user.id,
    email: user.email,
    name: profile.full_name,
    licenseKey: license.license_key,
    planName: 'Starter License',
  },
});
```

### From Server Actions

```typescript
'use server';

import { inngest } from '@/lib/inngest/client';

export async function sendWelcomeEmail(userId: string) {
  await inngest.send({
    name: 'user/signed-up',
    data: { userId, email: '...' },
  });
}
```

---

## Common Cron Expressions

| Schedule | Cron Expression |
|----------|-----------------|
| Every hour | `0 * * * *` |
| Every day at midnight | `0 0 * * *` |
| Every day at 9 AM | `0 9 * * *` |
| Every Monday at 9 AM | `0 9 * * 1` |
| Every month on 1st | `0 0 1 * *` |
| Every 15 minutes | `*/15 * * * *` |

---

## Step Methods Reference

| Method | Usage | Example |
|--------|-------|---------|
| `step.run()` | Execute code that may fail | `await step.run('name', async () => {})` |
| `step.sleep()` | Wait for duration | `await step.sleep('wait', '1h')` |
| `step.sleepUntil()` | Wait until specific time | `await step.sleepUntil('wait', new Date())` |
| `step.invoke()` | Call another function | `await step.invoke('other-function', { data: {} })` |
| `step.waitForEvent()` | Wait for external event | `await step.waitForEvent('event/name', { timeout: '1h' })` |

---

## Usage Examples

**User**: "Create a background job for sending invoices"

**Claude generates**: Inngest function that generates PDF, uploads to storage, and sends email.

**User**: "Add daily cleanup job"

**Claude generates**: Cron-based function that runs at specified time to clean up old data.
