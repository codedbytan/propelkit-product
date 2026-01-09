# Inngest Handler Skill (Background Jobs)

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Check `src/config/brand.ts` for project config
3. ✅ Use `brand.*` dynamically

---

## Trigger
"Create background job for [task]" or "Add cron job for [schedule]"

## What This Does
Generates Inngest functions for:
- Async background tasks
- Scheduled cron jobs
- Multi-step workflows
- Email sequences

---

## Template: Basic Background Function

**File: `src/lib/inngest/functions/[name].ts`**

```typescript
import { inngest } from '@/lib/inngest/client';
import { brand } from '@/config/brand';

export const myFunction = inngest.createFunction(
  { id: 'my-function-id', name: 'My Function' },
  { event: 'app/event.name' },
  async ({ event, step }) => {
    // Step 1: Process data
    const result = await step.run('step-1', async () => {
      // Your logic
      return { processed: true };
    });

    // Step 2: Wait if needed
    await step.sleep('wait-1h', '1h');

    // Step 3: Final action
    await step.run('step-2', async () => {
      // More logic
    });

    return { success: true };
  }
);
```

---

## Template: Cron Job

```typescript
import { inngest } from '@/lib/inngest/client';

export const dailyCleanup = inngest.createFunction(
  { id: 'daily-cleanup', name: 'Daily Cleanup' },
  { cron: '0 0 * * *' }, // Every day at midnight
  async ({ step }) => {
    await step.run('cleanup-old-data', async () => {
      // Cleanup logic
    });

    return { cleaned: true };
  }
);
```

---

## Common Cron Expressions

| Schedule | Expression |
|----------|-----------|
| Every hour | `0 * * * *` |
| Daily at midnight | `0 0 * * *` |
| Daily at 9 AM | `0 9 * * *` |
| Every Monday at 9 AM | `0 9 * * 1` |
| First day of month | `0 0 1 * *` |
| Every 15 minutes | `*/15 * * * *` |

---

## Step Methods

| Method | Usage |
|--------|-------|
| `step.run()` | Execute retriable code |
| `step.sleep()` | Wait for duration |
| `step.sleepUntil()` | Wait until time |
| `step.invoke()` | Call another function |
| `step.waitForEvent()` | Wait for event |

---

## Usage Example

**User:** "Create email sequence for new users"

**Claude generates:** Inngest function with day 1, day 3, day 7 emails using `step.sleep()` and `brand.email.*` config.
