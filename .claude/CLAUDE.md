# CLAUDE.md - PropelKit Boilerplate Development

> **DELETE THIS FILE** when boilerplate is production-ready.

---

## ⚠️ CRITICAL CONTEXT

```
Project: propelkit-boilerplate-fresh
Goal: Clean boilerplate with UNIQUE blueprints
Status: Fresh extraction from old project
```

**THIS IS NOT A WEBSITE. THIS IS A BOILERPLATE PRODUCT.**

Customers will:
1. Clone this repo
2. Run setup wizard
3. Select a blueprint
4. Get a UNIQUE app (not a PropelKit clone)

---

## 🚫 NEVER DO THIS

```typescript
// ❌ NEVER hardcode any brand
const title = "PropelKit";
const title = "Acme SaaS";
const email = "support@propelkit.dev";

// ❌ NEVER create license/download features
<DownloadButton />
<LicenseCard />
"Download Source Code"

// ❌ NEVER make pages that look like propelkit.dev
// The homepage should NOT be about selling a boilerplate
```

---

## ✅ ALWAYS DO THIS

```typescript
// ✅ ALWAYS use brand config
import { brand } from '@/config/brand';
const title = brand.name;
const email = brand.contact.email;

// ✅ ALWAYS think "What would a customer's app look like?"
// Marketplace → Search bar, listings, bookings
// SaaS Tool → Dashboard, projects, analytics
// NOT → "Buy this boilerplate for ₹9,999"
```

---

## 📁 Project Structure

```
propelkit-boilerplate-fresh/
├── blueprints/           ← Complete app templates
│   ├── marketplace/      ← For freelancer/service marketplaces
│   ├── saas-tool/        ← For dashboard/analytics apps
│   └── blank/            ← Minimal starter
│
├── src/
│   ├── app/              ← MINIMAL (populated by blueprint)
│   │   └── api/          ← Core API routes (payments, auth)
│   ├── components/
│   │   ├── ui/           ← shadcn components (shared)
│   │   └── shared/       ← Navbar, Footer (generic)
│   ├── lib/              ← Core functionality
│   │   ├── supabase/     ← Auth & database
│   │   ├── razorpay/     ← Payments
│   │   ├── gst/          ← India tax compliance
│   │   ├── inngest/      ← Background jobs
│   │   └── email/        ← Transactional emails
│   └── config/           ← Brand & theme (generated)
│
└── scripts/
    └── setup-blueprint.js ← Interactive wizard
```

---

## 🎯 Blueprint Requirements

Each blueprint MUST:
1. Have its own `app/page.tsx` (unique homepage)
2. Have its own `app/dashboard/` (relevant to use case)
3. Look COMPLETELY different from PropelKit.dev
4. Use `{brand.name}` and `{brand.tagline}` everywhere
5. Have appropriate features for that use case

### Marketplace Blueprint Should Have:
- Search bar prominently displayed
- Categories grid
- Featured listings
- Provider/buyer dual dashboard
- Bookings system
- Reviews system

### SaaS Tool Blueprint Should Have:
- Feature-focused hero
- Dashboard with widgets/stats
- Projects management
- Team features
- Analytics placeholder

### Blank Blueprint Should Have:
- Minimal hero ("Welcome to {brand.name}")
- Empty dashboard shell
- Just the basics to start building

---

## 🔧 Core Features (Shared Across All Blueprints)

These are in `src/lib/` and used by all blueprints:

1. **Authentication** - Supabase Auth
2. **Database** - Supabase PostgreSQL + RLS
3. **Payments** - Razorpay (one-time + recurring)
4. **GST** - Tax calculation, invoice generation
5. **Multi-tenancy** - Organizations, roles
6. **Background Jobs** - Inngest
7. **Email** - Resend templates
8. **UI Components** - shadcn/ui

---

## 📋 Verification Checklist

Before considering complete:

- [ ] Running setup wizard works
- [ ] Selecting "Marketplace" shows marketplace app
- [ ] Selecting "SaaS Tool" shows SaaS app
- [ ] Selecting "Blank" shows minimal starter
- [ ] NO "PropelKit" text visible anywhere
- [ ] NO license/download features
- [ ] brand.name appears correctly throughout
- [ ] Color scheme changes work
- [ ] `npm run build` passes
- [ ] Payment flow works
- [ ] Auth flow works

---

## 💡 When Generating Code

Always ask: "Would this make sense for a customer's app?"

**Good examples:**
- "Create a booking form" → Makes sense for marketplace
- "Create a project list page" → Makes sense for SaaS tool
- "Add analytics dashboard" → Makes sense for SaaS tool

**Bad examples:**
- "Add license purchase button" → This is PropelKit website feature
- "Create download page" → This is PropelKit website feature
- "Add boilerplate pricing" → This is PropelKit website feature

---

## 🏁 Definition of Done

This boilerplate is ready when:

1. ✅ Customer clones repo
2. ✅ Runs `npm install` (triggers setup wizard)
3. ✅ Answers questions (name, blueprint, color)
4. ✅ Gets UNIQUE app based on selection
5. ✅ App looks NOTHING like propelkit.dev
6. ✅ All core features work (auth, payments, etc.)
7. ✅ Can start building their specific features

**DELETE this file when all checkboxes are complete!**