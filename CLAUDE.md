# 🤖 Claude AI - Complete Documentation

## 🚨 CRITICAL: Read This First

**This is a customizable boilerplate template, NOT a fixed project.**

Before generating ANY code:
1. ✅ Read `.claude/PROJECT_CONTEXT.md` for master rules
2. ✅ Check `src/config/brand.ts` for current project configuration
3. ✅ NEVER hardcode "PropelKit" or "Acme SaaS" - use `brand.*` dynamically

---

## Quick Start

### Project Context
- **Type**: Next.js 15 SaaS Boilerplate
- **Target**: Indian developers
- **Features**: Razorpay, GST invoicing, Supabase, Inngest
- **Customizable**: Every customer has different branding

### Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict)
- Supabase (PostgreSQL + Auth + RLS)
- Razorpay (payments)
- Resend (emails)
- Inngest (background jobs)
- shadcn/ui (components)

---

## Dynamic Brand Configuration

**ALWAYS use brand config:**

```typescript
import { brand } from '@/config/brand';

// ✅ CORRECT
const title = `Welcome to ${brand.name}`;
const email = brand.email.fromSupport;
const price = `${brand.pricing.currencySymbol}${amount}`;

// ❌ WRONG  
const title = "Welcome to PropelKit";
const email = "support@propelkit.dev";
```

---

## Available Skills

Claude has 10 specialized skills in `.claude/skills/`:

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| `ui-handler` | "Create [component]" | Generates React components |
| `add-api-route` | "Add API route for [feature]" | Creates API endpoints |
| `payments-handler` | "Add payment" | Razorpay integration |
| `inngest-handler` | "Create background job" | Async task functions |
| `create-email-template` | "Create [type] email" | Email templates |
| `create-crud-page` | "CRUD for [Entity]" | Full CRUD interface |
| `auth-handler` | "Protect [route]" | Auth guards |
| `db-handler` | "Create table for [entity]" | SQL schemas with RLS |
| `seo-specialist` | "Optimize SEO" | Meta tags, JSON-LD |
| `gst-handler` | "Add GST" | India tax calculation |

---

## Next.js 15 Critical Change

**Route params are Promises:**

```typescript
// ✅ CORRECT
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST await
}

// ❌ WRONG (will break!)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id; // No await
}
```

---

## Code Patterns

### API Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { brand } from '@/config/brand';
import { z } from 'zod';

const schema = z.object({ /* validation */ });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Validation
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Your logic
  return NextResponse.json({ success: true });
}
```

### Component Template
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { brand } from '@/config/brand';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    setLoading(true);
    try {
      // Action
      toast({ title: `${brand.name} Success` });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleAction} disabled={loading}>
      {loading ? 'Loading...' : 'Submit'}
    </Button>
  );
}
```

---

## Database Rules

### Standard Table
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

---

## India-Specific Features

### Currency (INR)
```typescript
const formatted = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
}).format(amount);
```

### Razorpay (NOT Stripe)
```typescript
// Amounts in paise: ₹100 = 10000
const amountInPaise = brand.pricing.plans.starter.priceInPaise;
```

### GST (18%)
```typescript
const gstAmount = baseAmount * 0.18;
// Intra-state: CGST + SGST
// Inter-state: IGST
```

### Phone Validation
```typescript
z.string().regex(/^[6-9]\d{9}$/)
```

---

## File Structure

```
src/
├── config/
│   └── brand.ts              ← SINGLE SOURCE OF TRUTH
├── lib/
│   ├── supabase-server.ts    ← Server DB client
│   └── supabase-browser.ts   ← Client DB client
├── app/
│   ├── api/                  ← API routes
│   └── dashboard/            ← Protected pages
└── components/
    └── ui/                   ← shadcn/ui components
```

---

## Quick Commands

**API Route:**
```
"Add API route for user preferences"
```

**Component:**
```
"Create a pricing card component"
```

**Payment:**
```
"Add Razorpay checkout for starter plan"
```

**Background Job:**
```
"Create email sequence for new users"
```

**CRUD:**
```
"Create CRUD page for Products with name, price, description"
```

---

## Security Checklist

- ✅ Auth check in API routes
- ✅ Input validation with Zod
- ✅ RLS enabled on all tables
- ✅ Proper error handling
- ✅ No secrets in frontend
- ✅ User can only access own data

---

## Reference Files

- `.claude/PROJECT_CONTEXT.md` - Master rules
- `.claude/skills/` - Feature templates
- `src/config/brand.ts` - Project config
- `.cursorrules` - Cursor AI rules
- `.windsurfrules` - Windsurf AI rules

---

## Important Reminders

1. **Dynamic Branding**: Use `brand.*`, never hardcode
2. **Next.js 15**: Always await params
3. **RLS**: Enable on all tables
4. **Validation**: Use Zod for all input
5. **India-Specific**: Razorpay, GST, INR
6. **Error Handling**: Always catch and log
7. **TypeScript**: No `any` types

---

**Remember: This code works for ANY project name!** 🚀

For detailed info on each skill, check files in `.claude/skills/`
