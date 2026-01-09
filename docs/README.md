# PropelKit - Next.js SaaS Boilerplate for Indian Developers

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Commercial-green)](https://propelkit.dev)

**Ship your SaaS in days, not months.** PropelKit is a production-ready Next.js 15 boilerplate specifically designed for Indian developers, featuring pre-built Razorpay integration, GST-compliant invoicing, multi-tenancy, and more.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/your-saas.git
cd your-saas

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy .env.example .env.local
# Edit .env.local with your keys

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Complete setup instructions
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to Vercel/Railway/AWS
- **[Customization Guide](./docs/CUSTOMIZATION_GUIDE.md)** - Make it your own
- **[API Reference](./docs/API_REFERENCE.md)** - API endpoints & usage
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues & fixes

---

## ✨ Features

### 🇮🇳 India-Specific
- ✅ **Razorpay Integration** - One-time & recurring payments
- ✅ **GST Invoicing** - Auto-calculates CGST/SGST/IGST
- ✅ **GST Compliance Engine** - Validates GSTIN, generates compliant invoices
- ✅ **Indian Phone Formats** - +91 validation
- ✅ **INR Currency** - Formatted pricing with ₹ symbol

### 🏢 Multi-Tenancy
- ✅ **Organizations & Teams** - Full B2B SaaS structure
- ✅ **Role-Based Access** - Owner/Admin/Member roles
- ✅ **Team Invitations** - Email-based team onboarding
- ✅ **Row Level Security** - Supabase RLS policies

### 🎨 UI Components
- ✅ **600+ Components** - Pre-built blocks (hero, pricing, testimonials, etc.)
- ✅ **shadcn/ui** - Beautiful, accessible components
- ✅ **Dark Mode** - Automatic theme switching
- ✅ **Responsive** - Mobile-first design

### 🤖 AI Development Assistant
- ✅ **Claude Code Skills** - Generate features on-demand
- ✅ **CRUD Generator** - Create full CRUD pages in seconds
- ✅ **API Route Generator** - Generate API endpoints
- ✅ **Email Templates** - Pre-built React Email templates

### 🔐 Authentication
- ✅ **Supabase Auth** - Email, Google, GitHub login
- ✅ **Magic Links** - Passwordless authentication
- ✅ **Protected Routes** - Middleware-based auth guards

### 💳 Payments
- ✅ **Razorpay Checkout** - One-time payments
- ✅ **Subscriptions** - Monthly/yearly recurring billing
- ✅ **Invoice Generation** - GST-compliant PDF invoices
- ✅ **Payment Webhooks** - Auto-sync payment status

### 📧 Emails
- ✅ **Resend Integration** - Reliable email delivery
- ✅ **React Email** - Beautiful email templates
- ✅ **Transactional Emails** - Welcome, invoice, password reset

### ⚙️ Background Jobs
- ✅ **Inngest** - Reliable background job processing
- ✅ **Email Sequences** - Onboarding drip campaigns
- ✅ **Scheduled Tasks** - Daily/weekly automation
- ✅ **Webhook Retry Logic** - Never miss a payment

### 🛡️ Super Admin Dashboard
- ✅ **Platform Analytics** - Users, revenue, growth charts
- ✅ **User Management** - Search, filter, impersonate
- ✅ **Payment Management** - Refunds, manual activations
- ✅ **Audit Logs** - Track all admin actions

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth |
| **Payments** | Razorpay |
| **Emails** | Resend + React Email |
| **Background Jobs** | Inngest |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Validation** | Zod |
| **Forms** | react-hook-form |
| **State Management** | React Context + Hooks |

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/             # Super admin dashboard
│   │   ├── api/               # API routes
│   │   └── (marketing)/       # Public marketing pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── blocks/                # Pre-built UI blocks
│   │   ├── hero/             # Hero sections
│   │   ├── pricing/          # Pricing tables
│   │   └── ...               # Other blocks
│   ├── lib/                   # Utility functions
│   │   ├── supabase-*.ts     # Supabase clients
│   │   ├── gst-engine.ts     # GST calculation
│   │   ├── invoice-generator.ts # PDF invoice generation
│   │   ├── email.ts          # Email utilities
│   │   └── inngest/          # Background jobs
│   ├── config/
│   │   └── brand.ts          # 🎯 SINGLE SOURCE OF TRUTH
│   └── types/                 # TypeScript types
├── .claude/                   # Claude AI skills
│   ├── skills/               # AI code generation skills
│   └── PROJECT_CONTEXT.md    # AI assistant context
├── public/                    # Static assets
├── docs/                      # Documentation
└── supabase/
    └── migrations/           # Database migrations
```

---

## 🎯 Customization

### 1. Update Brand Configuration

**Everything is centralized in `src/config/brand.ts`:**

```typescript
// src/config/brand.ts
export const brand = {
  name: "YourSaaS",                    // Your product name
  tagline: "Your amazing tagline",     // Your tagline
  company: {
    legalName: "YourCo Pvt Ltd",      // Legal entity name
    gstin: "27AAAAA0000A1Z5",         // Your GSTIN
    // ... other details
  },
  pricing: {
    plans: {
      starter: {
        priceInPaise: 499900,         // ₹4,999
        // ... features
      },
    },
  },
  // ... more config
};
```

**When you update `brand.ts`, changes reflect EVERYWHERE automatically:**
- Emails
- Invoices
- UI components
- API responses
- Meta tags
- Legal pages

### 2. Customize UI Components

All components in `src/blocks/` are customizable:

```tsx
import { HeroGradient } from '@/blocks/hero';

<HeroGradient
  title="Your custom title"
  description="Your description"
  primaryCTA="Get Started Free"
/>
```

### 3. Add Your Logo

Replace files in `public/`:
- `public/logo.png` - Main logo
- `public/favicon.ico` - Browser favicon
- `public/og-image.png` - Social media preview

---

## 🚦 Environment Variables

Create `.env.local` with these required variables:

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Resend (Emails)
RESEND_API_KEY=your-api-key

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

See [Setup Guide](./docs/SETUP_GUIDE.md) for detailed instructions.

---

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Generate TypeScript types from Supabase
npm run db:types

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy 🎉

See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for other platforms.

---

## 📝 License

This is a **commercial product** sold under a commercial license.

- **Starter License** (₹3,999): One project, personal/commercial use
- **Agency License** (₹9,999): Unlimited client projects

See [LICENSE](./LICENSE) for full terms.

---

## 🆘 Support

- **Email**: support@propelkit.dev
- **Documentation**: [propelkit.dev/docs](https://propelkit.dev/docs)
- **Discord**: [Join our community](https://discord.gg/propelkit)

---

## 🙏 Credits

Built with love by Indian developers, for Indian developers.

**Tech Stack Credits:**
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database & Auth
- [Razorpay](https://razorpay.com/) - Payments
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Resend](https://resend.com/) - Emails
- [Inngest](https://www.inngest.com/) - Background jobs

---

## 🚀 What's Next?

After setup, follow these guides:

1. **[Customization Guide](./docs/CUSTOMIZATION_GUIDE.md)** - Make it your own
2. **[Adding Features](./docs/ADDING_FEATURES.md)** - Extend the boilerplate
3. **[AI Assistant Guide](./docs/AI_ASSISTANT_GUIDE.md)** - Use Claude Code skills
4. **[Going to Production](./docs/PRODUCTION_CHECKLIST.md)** - Pre-launch checklist

---

**Happy building! 🚀**

Made with ❤️ in India