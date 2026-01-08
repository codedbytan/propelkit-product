# PropelKit - Claude Code Instructions

> 🧠 This file makes Claude Code your AI co-founder. It understands PropelKit's architecture and can generate production-ready code instantly.

## 🎯 Project Overview

**PropelKit** is a production-ready Next.js 15 SaaS boilerplate built specifically for Indian developers. It includes Razorpay payments, GST invoicing, Supabase auth, and everything needed to ship a SaaS in days.

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Payments | Razorpay (one-time + subscriptions) |
| Emails | Resend |
| Background Jobs | Inngest |
| UI Components | shadcn/ui + Tailwind CSS |
| Validation | Zod |
| State | React Query (@tanstack/react-query) |

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Super admin panel
│   └── (marketing)/       # Public pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   └── blocks/            # Reusable page blocks
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── inngest/           # Background job definitions
│   └── utils.ts           # Utility functions (cn, etc.)
├── config/
│   └── brand.ts           # Centralized branding config
└── emails/                # React email templates
```

---

## 🔧 Code Patterns & Conventions

### 1. API Routes (Next.js 15)

```typescript
// ✅ CORRECT: app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Always check auth first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Validate with Zod
  const parsed = yourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  // Your logic here
  return NextResponse.json({ success: true });
}
```

### 2. Dynamic Route Parameters (Next.js 15 Breaking Change!)

```typescript
// ⚠️ CRITICAL: In Next.js 15, params are now Promises!

// ❌ WRONG (Next.js 14 style)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id; // This will break!
}

// ✅ CORRECT (Next.js 15 style)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await!
}
```

### 3. Supabase Clients

```typescript
// Server Components / API Routes
import { createClient } from '@/lib/supabase-server';
const supabase = await createClient();

// Client Components
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Admin operations (bypasses RLS)
import { createServiceClient } from '@/lib/supabase/service';
const supabase = createServiceClient();
```

### 4. Database Schema Patterns

```sql
-- Always include these columns
CREATE TABLE your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Always add RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Standard policies
CREATE POLICY "Users can view own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON your_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON your_table FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON your_table FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Component Patterns

```typescript
// ✅ Client Component (interactive)
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/something', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Success!' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Click Me'}
    </Button>
  );
}

// ✅ Server Component (data fetching)
import { createClient } from '@/lib/supabase-server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('table').select('*');

  return <div>{/* render data */}</div>;
}
```

### 6. Form Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  price: z.number().positive('Price must be positive'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  gst: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN').optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

### 7. Inngest Background Jobs

```typescript
// src/lib/inngest/functions/your-function.ts
import { inngest } from '../client';

export const yourFunction = inngest.createFunction(
  { id: 'your-function-name' },
  { event: 'your/event.name' },
  async ({ event, step }) => {
    // Step 1
    const result1 = await step.run('step-1-name', async () => {
      // Your logic
      return { data: 'something' };
    });

    // Step 2 (can use result1)
    await step.run('step-2-name', async () => {
      console.log(result1.data);
    });

    // Sleep
    await step.sleep('wait-1-hour', '1h');

    // Final step
    return { success: true };
  }
);

// Trigger from anywhere:
await inngest.send({
  name: 'your/event.name',
  data: { userId: '123', email: 'user@example.com' }
});
```

### 8. Email Templates (Resend + React Email)

```typescript
// src/emails/welcome.tsx
import { Html, Head, Body, Container, Text, Button, Hr } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  licenseKey: string;
}

export default function WelcomeEmail({ name, licenseKey }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Welcome to PropelKit, {name}! 🎉
          </Text>
          <Text>Your license key: <strong>{licenseKey}</strong></Text>
          <Hr />
          <Button
            href="https://propelkit.dev/dashboard"
            style={{ backgroundColor: '#fbbf24', padding: '12px 24px', color: '#000' }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## 🇮🇳 India-Specific Patterns

### GST Invoice Generation

```typescript
// When generating invoices, always include:
interface GSTInvoice {
  invoiceNumber: string;      // Format: INV-YYYY-MM-NNNN
  invoiceDate: Date;
  
  // Seller (PropelKit)
  sellerName: string;
  sellerGSTIN: string;        // 22 character GSTIN
  sellerAddress: string;
  sellerState: string;        // State code (e.g., "27" for Maharashtra)
  
  // Buyer
  buyerName: string;
  buyerEmail: string;
  buyerAddress?: string;
  buyerGSTIN?: string;        // If B2B
  buyerState?: string;
  
  // Items
  items: {
    description: string;
    hsn: string;              // HSN/SAC code
    quantity: number;
    rate: number;             // Pre-tax rate
    taxableValue: number;
  }[];
  
  // Taxes
  isInterState: boolean;      // Determines IGST vs CGST+SGST
  cgst: number;               // 9% for intra-state
  sgst: number;               // 9% for intra-state
  igst: number;               // 18% for inter-state
  totalTax: number;
  grandTotal: number;
}
```

### Razorpay Integration

```typescript
// Creating a payment order
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const order = await razorpay.orders.create({
  amount: 299900,           // Amount in paise (₹2,999)
  currency: 'INR',
  receipt: `order_${Date.now()}`,
  notes: {
    userId: user.id,
    plan: 'starter',
  },
});

// Verifying payment signature
import crypto from 'crypto';

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
```

---

## 📁 Available Skills

Claude Code has access to specialized skills in `.claude/skills/`:

| Skill | Description | Usage |
|-------|-------------|-------|
| `create-crud-page` | Generate complete CRUD interface | "Create a CRUD page for Products" |
| `add-api-route` | Generate API endpoint | "Add API route for user preferences" |
| `create-email-template` | Generate email template | "Create a payment confirmation email" |
| `auth-handler` | Add authentication to routes | "Add auth check to this endpoint" |
| `payments-handler` | Razorpay payment integration | "Add payment flow for subscriptions" |
| `db-handler` | Database schema + migrations | "Create table for blog posts" |
| `seo-specialist` | SEO optimization | "Optimize this page for SEO" |
| `ui-handler` | UI components generation | "Create a pricing table component" |
| `gst-handler` | GST compliance features | "Add GST invoice generation" |
| `inngest-handler` | Background job creation | "Create email sequence job" |

---

## ⚡ Quick Commands

When using Claude Code, you can say:

- "Create a CRUD page for [Entity] with [fields]"
- "Add an API route for [feature]"
- "Generate an email template for [purpose]"
- "Create a background job that [does something]"
- "Add Razorpay payment for [product/plan]"
- "Generate GST invoice for [transaction]"
- "Create a dashboard widget for [metric]"
- "Add form validation for [fields]"

---

## 🚫 Anti-Patterns (Don't Do This)

```typescript
// ❌ Don't use any
const data: any = await fetch('/api');

// ❌ Don't forget error handling
const { data } = await supabase.from('table').select('*');
// Missing error check!

// ❌ Don't hardcode secrets
const razorpay = new Razorpay({ key_secret: 'sk_live_xxx' });

// ❌ Don't skip RLS policies
// Every table must have RLS enabled!

// ❌ Don't use client-side imports in server components
'use client'; // Remove this if not needed!

// ❌ Don't forget to await params in Next.js 15
const { id } = params; // WRONG - must await params first!
```

---

## 🔐 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 📖 Reference Files

When generating code, always reference:

- `src/config/brand.ts` - For branding/naming
- `src/lib/supabase/*.ts` - For database access patterns
- `src/lib/inngest/client.ts` - For Inngest client
- `src/components/ui/*` - For available UI components
- `schema.sql` - For database schema reference

---

## 💡 Tips for Best Results

1. **Be specific**: "Create a products CRUD with name, price, description, and image_url"
2. **Mention the stack**: "Using Supabase and shadcn/ui"
3. **Reference patterns**: "Follow the existing license management pattern"
4. **Include validation**: "Add Zod validation for all fields"
5. **Mention India-specific**: "Include GST calculation" or "Use Razorpay"

---

*This is PropelKit - Ship Your SaaS in 24 Hours* 🚀
