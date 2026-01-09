# 🎨 PropelKit Customization Guide

Learn how to make PropelKit truly yours - from branding to features.

---

## Table of Contents

1. [Brand Configuration](#1-brand-configuration)
2. [Visual Customization](#2-visual-customization)
3. [UI Components](#3-ui-components)
4. [Email Templates](#4-email-templates)
5. [Pricing Plans](#5-pricing-plans)
6. [Adding Features](#6-adding-features)
7. [Database Schema](#7-database-schema)
8. [API Routes](#8-api-routes)

---

## 1. Brand Configuration

### The Single Source of Truth

**Everything starts with `src/config/brand.ts`**

This file controls:
- ✅ Product name, tagline, description
- ✅ Company details (legal name, GSTIN, address)
- ✅ Contact information
- ✅ Email senders
- ✅ Pricing & currency
- ✅ GST settings
- ✅ Social links
- ✅ SEO metadata

### Example: Complete Brand Update

```typescript
// src/config/brand.ts
export const brand = {
  // PRODUCT IDENTITY
  name: "TaskMaster",
  tagline: "Manage Tasks, Not Chaos",
  description: "AI-powered task management for modern teams",

  product: {
    name: "TaskMaster Pro",
    version: "2.0.0",
    url: "https://taskmaster.io",
  },

  // COMPANY DETAILS
  company: {
    legalName: "TaskMaster Technologies Pvt Ltd",
    gstin: "27ABCDE1234F1Z5",
    address: {
      line1: "456 Tech Tower, Bandra",
      line2: "Mumbai, Maharashtra - 400050",
      city: "Mumbai",
      state: "Maharashtra",
      stateCode: "27",
      pincode: "400050",
      country: "India",
    },
    pan: "ABCDE1234F",
  },

  // CONTACT
  contact: {
    email: "support@taskmaster.io",
    phone: "+91-22-12345678",
    supportUrl: "https://taskmaster.io/support",
  },

  // EMAIL SENDERS
  email: {
    fromSupport: "TaskMaster Support <support@taskmaster.io>",
    fromBilling: "TaskMaster Billing <billing@taskmaster.io>",
    fromNoReply: "TaskMaster <noreply@taskmaster.io>",
    replyTo: "support@taskmaster.io",
  },

  // PRICING (in paise!)
  pricing: {
    currency: "INR",
    currencySymbol: "₹",
    plans: {
      starter: {
        name: "Freelancer",
        priceInPaise: 29900,  // ₹299
        price: 299,
        description: "Perfect for solo founders",
        features: [
          "Up to 100 tasks/month",
          "2 projects",
          "Email support",
        ],
      },
      agency: {
        name: "Business",
        priceInPaise: 99900,  // ₹999
        price: 999,
        description: "For growing teams",
        features: [
          "Unlimited tasks",
          "Unlimited projects",
          "Priority support",
          "Advanced analytics",
        ],
      },
    },
  },

  // GST & INVOICING
  invoice: {
    sacCode: "998314",
    prefix: "TASK",  // TASK/24-25/0001
    taxRate: 0.18,
    hsnCode: "998314",
  },

  // SOCIAL LINKS
  social: {
    twitter: "https://twitter.com/taskmaster",
    github: "https://github.com/taskmaster",
    linkedin: "https://linkedin.com/company/taskmaster",
    discord: "https://discord.gg/taskmaster",
  },

  // SEO
  seo: {
    title: "TaskMaster - AI-Powered Task Management",
    description: "Manage tasks, not chaos. AI-powered productivity for modern teams.",
    keywords: "task management, productivity, ai, collaboration",
    ogImage: "/og-image.png",
    twitterHandle: "@taskmaster",
  },
};
```

### Impact of Changing `brand.ts`

When you update `brand.ts`, **these change automatically**:

- 📧 **All emails** use new company name & contact
- 📄 **All invoices** show new legal name, GSTIN, address
- 🎨 **All UI components** display new product name
- 💳 **Pricing pages** show new plans & prices
- 🔍 **SEO tags** update across all pages
- 📱 **Meta tags** reflect new title & description

**No manual find-and-replace needed!**

---

## 2. Visual Customization

### 2.1 Colors & Themes

Edit `tailwind.config.ts`:

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your brand colors
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',  // Main brand color
          900: '#1e3a8a',
        },
        // ... more colors
      },
    },
  },
};
```

### 2.2 Fonts

**Add custom fonts:**

```typescript
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'] 
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      {children}
    </html>
  );
}
```

### 2.3 Logo

Replace files in `public/`:

```
public/
├── logo.png          # Main logo (500x500px recommended)
├── logo-dark.png     # Dark mode logo (optional)
├── favicon.ico       # Browser tab icon (32x32px)
├── apple-icon.png    # Apple touch icon (180x180px)
└── og-image.png      # Social media preview (1200x630px)
```

**Use logo in components:**

```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt={brand.name}
  width={150}
  height={50}
/>
```

---

## 3. UI Components

### 3.1 Pre-built Blocks

All UI blocks are in `src/blocks/`:

```
src/blocks/
├── hero/           # Hero sections
├── pricing/        # Pricing tables
├── testimonials/   # Customer testimonials
├── features/       # Feature grids
├── cta/            # Call-to-action sections
├── navbar/         # Navigation bars
├── footer/         # Footer sections
└── forms/          # Contact forms
```

**Example: Customize Hero Section**

```tsx
// app/page.tsx
import { HeroGradient } from '@/blocks/hero';

export default function HomePage() {
  return (
    <HeroGradient
      title="Ship Your SaaS Faster"
      description="Build, launch, and scale with TaskMaster"
      primaryCTA="Start Free Trial"
      secondaryCTA="View Demo"
      onPrimaryClick={() => router.push('/signup')}
      onSecondaryClick={() => window.open('/demo')}
      showStats={true}
      stats={[
        { label: "Active Users", value: "10,000+" },
        { label: "Tasks Completed", value: "1M+" },
        { label: "Success Rate", value: "99.9%" },
      ]}
    />
  );
}
```

### 3.2 Create Custom Block

```tsx
// src/blocks/custom/my-feature.tsx
'use client';

import { brand } from '@/config/brand';

interface MyFeatureProps {
  title?: string;
  description?: string;
}

export function MyFeature({ 
  title = "Amazing Feature",
  description = "This is great"
}: MyFeatureProps) {
  return (
    <section className="py-20">
      <div className="container">
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="text-xl text-muted-foreground">{description}</p>
        <p className="mt-4">Powered by {brand.name}</p>
      </div>
    </section>
  );
}
```

---

## 4. Email Templates

### 4.1 Existing Templates

All emails use `src/lib/email.ts`:

- `sendWelcomeEmail()` - New user welcome
- `sendInvoiceEmail()` - Payment receipt with PDF
- `sendSubscriptionActivatedEmail()` - Subscription start
- `sendSubscriptionChargedEmail()` - Monthly/yearly billing
- `sendSubscriptionCancelledEmail()` - Cancellation notice

### 4.2 Customize Email Template

```typescript
// src/lib/email.ts
export async function sendWelcomeEmail(to: string, userName: string) {
  await resend.emails.send({
    from: brand.email.fromSupport,
    to: to,
    subject: `Welcome to ${brand.name}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Your custom HTML here -->
        <h1>Welcome ${userName}!</h1>
        <p>Thank you for joining ${brand.name}</p>
        
        <!-- CTA Button -->
        <a href="${brand.product.url}/dashboard"
           style="background: #10b981; color: #fff; padding: 12px 24px; text-decoration: none;">
          Get Started
        </a>
        
        <p>— The ${brand.name} Team</p>
      </body>
      </html>
    `,
  });
}
```

### 4.3 Add New Email Template

```typescript
// src/lib/email.ts
export async function sendCustomEmail(to: string, data: any) {
  await resend.emails.send({
    from: brand.email.fromSupport,
    to: to,
    subject: "Your custom email",
    html: `<p>Custom content using ${brand.name}</p>`,
  });
}
```

**Use it:**

```typescript
import { sendCustomEmail } from '@/lib/email';

await sendCustomEmail(user.email, { /* data */ });
```

---

## 5. Pricing Plans

### 5.1 Update Plans

Edit `src/config/brand.ts`:

```typescript
pricing: {
  plans: {
    starter: {
      name: "Basic",
      priceInPaise: 49900,     // ₹499
      price: 499,
      description: "For individuals",
      features: [
        "10 projects",
        "100 tasks/month",
        "Email support",
      ],
    },
    pro: {                     // Add new plan!
      name: "Pro",
      priceInPaise: 149900,    // ₹1,499
      price: 1499,
      description: "For professionals",
      features: [
        "Unlimited projects",
        "Unlimited tasks",
        "Priority support",
        "Advanced analytics",
      ],
    },
    agency: {
      name: "Enterprise",
      priceInPaise: 499900,    // ₹4,999
      price: 4999,
      description: "For teams",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
    },
  },
}
```

### 5.2 Update Pricing UI

Pricing components automatically read from `brand.pricing.plans`!

Just update `brand.ts` and pricing pages reflect changes.

---

## 6. Adding Features

### 6.1 Add New Page

```bash
# Create new route
mkdir src/app/features
touch src/app/features/page.tsx
```

```tsx
// src/app/features/page.tsx
import { brand } from '@/config/brand';

export const metadata = {
  title: `Features - ${brand.name}`,
  description: `Discover ${brand.name} features`,
};

export default function FeaturesPage() {
  return (
    <div>
      <h1>{brand.name} Features</h1>
      {/* Your content */}
    </div>
  );
}
```

### 6.2 Add Protected Route

```tsx
// src/app/dashboard/my-feature/page.tsx
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function MyFeaturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <div>Protected content for {user.email}</div>;
}
```

### 6.3 Add API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Your logic here
  
  return NextResponse.json({ success: true });
}
```

---

## 7. Database Schema

### 7.1 Add New Table

Create migration file:

```sql
-- supabase/migrations/20240115_add_tasks_table.sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create tasks
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);
```

**Apply migration:**

```bash
supabase db push
```

### 7.2 Generate TypeScript Types

```bash
npm run db:types
```

This updates `src/types/supabase.ts` with new table types.

---

## 8. API Routes

### Example: Complete CRUD API

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

// GET /api/tasks
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    );
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}
```

---

## 🎉 Next Steps

You now know how to:
- ✅ Update brand configuration
- ✅ Customize visual design
- ✅ Modify UI components
- ✅ Edit email templates
- ✅ Change pricing plans
- ✅ Add new features
- ✅ Extend database schema
- ✅ Create API routes

**Continue with:**
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Go live
- [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) - Generate code faster
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Pre-launch tasks

---

**Happy customizing! 🚀**