# 🎯 Project Context - Master Configuration

**READ THIS FIRST** - This file contains critical context that applies to ALL AI assistants (Claude, Cursor, Windsurf, etc.) working on this project.

---

## 🚨 CRITICAL: This is a Customizable Boilerplate

**This is NOT a fixed project called "PropelKit" or "Acme SaaS".**

This is a **TEMPLATE** that customers purchase and customize with their own branding. Each customer will have:
- Different project name
- Different company name
- Different URLs
- Different email addresses
- Different branding

---

## 📦 Single Source of Truth: `src/config/brand.ts`

**BEFORE generating ANY code, ALWAYS:**

1. ✅ Check `src/config/brand.ts`
2. ✅ Read the current project's `brand.name`
3. ✅ Use dynamic references, NEVER hardcode names

**Example:**
```typescript
import { brand } from '@/config/brand';

// ✅ RIGHT - Dynamic
const title = `Welcome to ${brand.name}`;
const email = brand.email.fromSupport;

// ❌ WRONG - Hardcoded
const title = "Welcome to PropelKit";
const email = "support@propelkit.dev";
```

---

## 🏗️ Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── brand.ts           ← 🎯 SINGLE SOURCE OF TRUTH
│   ├── lib/
│   │   ├── supabase-server.ts  ← Server-side DB client
│   │   └── supabase-browser.ts ← Client-side DB client
│   ├── app/
│   │   ├── api/               ← API routes
│   │   ├── dashboard/         ← Protected pages
│   │   └── (auth)/            ← Auth pages
│   └── components/
│       └── ui/                ← shadcn/ui components
├── .claude/
│   ├── PROJECT_CONTEXT.md     ← This file
│   └── skills/                ← AI skills
├── .cursorrules               ← Cursor AI config
└── .windsurfrules             ← Windsurf AI config
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Payments | Razorpay (India-specific) |
| Emails | Resend |
| Background Jobs | Inngest |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Validation | Zod |
| Forms | react-hook-form |

---

## 🚫 What You Should NEVER Do

1. ❌ Hardcode "PropelKit" in generated code
2. ❌ Hardcode "Acme SaaS" in generated code
3. ❌ Hardcode URLs like "propelkit.dev"
4. ❌ Hardcode email addresses
5. ❌ Use `any` type in TypeScript
6. ❌ Skip error handling
7. ❌ Forget to enable RLS on database tables
8. ❌ Use Stripe (this project uses Razorpay)
9. ❌ Forget to await `params` in Next.js 15

---

## ✅ What You MUST Always Do

1. ✅ Import `brand` from `@/config/brand`
2. ✅ Use `brand.name` for project name
3. ✅ Use `brand.url` for URLs
4. ✅ Use `brand.email.*` for email addresses
5. ✅ Enable RLS on all database tables
6. ✅ Validate all inputs with Zod
7. ✅ Handle errors properly
8. ✅ Use TypeScript types strictly
9. ✅ Follow Next.js 15 patterns (async params)

---

## 🇮🇳 India-Specific Features

This boilerplate is designed for **Indian developers** and includes:

### Currency & Formatting
```typescript
// Always use INR
const price = new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR' 
}).format(amount);
```

### Razorpay (NOT Stripe)
```typescript
// Amounts in paise (₹100 = 10000 paise)
const orderAmount = 10000; // ₹100
```

### GST Calculation
```typescript
// 18% GST split as CGST/SGST (intra-state) or IGST (inter-state)
const gstRate = 0.18;
```

### Phone Number Validation
```typescript
// Indian mobile: starts with 6-9, then 9 digits
z.string().regex(/^[6-9]\d{9}$/)
```

### GSTIN Format
```typescript
// 15-character alphanumeric
z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/)
```

---

## 📝 Code Generation Patterns

### API Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { brand } from '@/config/brand';
import { z } from 'zod';

const schema = z.object({
  // fields
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validation
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Logic here
  
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
      // Action logic
      toast({ 
        title: `${brand.name} Success`, 
        description: 'Action completed' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
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

## 🔐 Authentication Patterns

### Server Components
```typescript
import { createClient } from '@/lib/supabase-server';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  // ...
}
```

### Client Components
```typescript
import { createClient } from '@/lib/supabase-browser';

export function Component() {
  const supabase = createClient();
  // ...
}
```

---

## 💾 Database Patterns

### Always Include These Columns
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Always Enable RLS
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### Standard Policies
```sql
-- SELECT
CREATE POLICY "Users view own" ON table 
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users insert own" ON table 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users update own" ON table 
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users delete own" ON table 
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🎨 Brand Configuration Reference

When you need to reference project-specific values:

```typescript
import { brand } from '@/config/brand';

// Project identity
brand.name              // e.g., "TaskMaster Pro"
brand.tagline           // e.g., "Manage Tasks Effortlessly"
brand.url               // e.g., "https://taskmaster.com"
brand.company           // e.g., "TaskMaster Inc."

// Email configuration
brand.email.fromName    // e.g., "TaskMaster"
brand.email.fromEmail   // e.g., "support@taskmaster.com"
brand.email.fromSupport // e.g., "TaskMaster Support <support@taskmaster.com>"

// Payment configuration
brand.razorpay.keyId    // Razorpay key
brand.pricing.currency  // "INR"
brand.pricing.currencySymbol // "₹"

// Social links
brand.social.twitter    // Twitter URL
brand.social.github     // GitHub URL
```

---

## 🧪 Self-Check Before Generating Code

Ask yourself these questions:

1. ❓ Did I import `brand` from `@/config/brand`?
2. ❓ Am I using `brand.name` instead of a hardcoded name?
3. ❓ Would this code work if the project was renamed?
4. ❓ Are all project-specific references dynamic?
5. ❓ Did I enable RLS on database tables?
6. ❓ Did I add proper error handling?
7. ❓ Did I validate inputs with Zod?
8. ❓ Am I using TypeScript types (no `any`)?

**If you answered "No" to ANY of these, revise your code!**

---

## 📚 Reference Files

Always check these files for context:

- `src/config/brand.ts` - Current project configuration
- `schema.sql` - Database schema reference
- `.cursorrules` - Cursor AI specific rules
- `.windsurfrules` - Windsurf AI specific rules
- `CLAUDE.md` - Full Claude documentation

---

## 🎯 Customer Use Case Example

**Customer: "FlowSync"**
```typescript
// src/config/brand.ts
export const brand = {
  name: "FlowSync",
  url: "https://flowsync.io",
  company: "FlowSync Labs",
  email: {
    fromEmail: "support@flowsync.io",
    // ...
  }
}
```

**Generated code will automatically say:**
- "Welcome to FlowSync!"
- "FlowSync Dashboard"
- Emails from "support@flowsync.io"
- Links to "flowsync.io"

**This is the power of dynamic configuration!** 🚀

---

## 💡 Remember

This project is a **TEMPLATE**. Every customer will customize it. Your job as an AI assistant is to generate code that **adapts automatically** to whatever the customer names their project in `brand.ts`.

**Make it work for ANY project name, not just one!**