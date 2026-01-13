# PropelKit - Next.js SaaS Boilerplate for Indian Developers

A production-ready Next.js 15 SaaS boilerplate specifically designed for Indian developers. Build and ship your SaaS product in days, not months.

## Features

- **Next.js 15** with App Router and React Server Components
- **TypeScript** with strict mode enabled
- **Supabase** for database, authentication, and RLS
- **Razorpay** for payments (one-time & subscriptions) with GST support
- **Inngest** for background jobs and workflows
- **Resend** for transactional emails
- **shadcn/ui** components with Tailwind CSS
- **Blueprint System** - Choose from Marketplace, SaaS Tool, or Blank templates
- **Dynamic Branding** - Complete white-label support
- **Theme System** - 5 color schemes and 3 visual styles
- **Claude Code Integration** - AI-powered development assistant

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd propelkit-boilerplate-fresh

# Install dependencies
npm install
```

### 2. Run Setup Wizard

The setup wizard will configure your project:

```bash
npm run setup
```

You'll be asked to:
- Choose a blueprint (Marketplace, SaaS Tool, E-commerce, or Blank)
- Enter your project name and tagline
- Select a color scheme and visual style
- Provide a support email

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Inngest
INNGEST_EVENT_KEY=your-inngest-key
INNGEST_SIGNING_KEY=your-signing-key

# Resend
RESEND_API_KEY=your-resend-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run the migration SQL for your chosen blueprint:

```bash
# Open Supabase SQL Editor and run:
# blueprints/<blueprint-name>/migration.sql
```

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Blueprints

PropelKit includes three pre-built blueprints:

### 1. Marketplace
Perfect for two-sided platforms, freelance marketplaces, or service directories.

**Includes:**
- Provider profiles and listings
- Search and category browsing
- Booking system
- Reviews and ratings
- Earnings dashboard

**Database Tables:**
- `provider_profiles`
- `listings`
- `bookings`
- `reviews`

### 2. SaaS Tool
Ideal for B2B SaaS, analytics tools, or productivity apps.

**Includes:**
- Project management
- Team collaboration
- Analytics tracking
- Pricing tiers

**Database Tables:**
- `projects`
- `project_members`
- `analytics_events`

### 3. Blank
Minimal starter with just authentication and basic pages. Build from scratch.

**Includes:**
- Landing page
- Authentication pages
- Dashboard shell

## Project Structure

```
propelkit-boilerplate-fresh/
├── blueprints/           # Blueprint templates
│   ├── marketplace/
│   ├── saas-tool/
│   └── blank/
├── scripts/
│   └── setup-blueprint.js  # Setup wizard
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── shared/      # Shared components
│   │   └── marketplace/ # Blueprint components
│   ├── config/
│   │   ├── brand.ts     # Brand configuration
│   │   └── theme.ts     # Theme configuration
│   ├── lib/
│   │   ├── supabase/    # Supabase clients
│   │   ├── razorpay/    # Payment integration
│   │   ├── gst/         # GST calculations
│   │   ├── inngest/     # Background jobs
│   │   └── email/       # Email templates
│   └── styles/
│       └── themes/      # Color scheme CSS
└── supabase/
    └── migrations/      # Database migrations
```

## Key Concepts

### Dynamic Branding

All branding is managed through `src/config/brand.ts`. **Never hardcode** your brand name:

```typescript
// ❌ Wrong
const title = "My App Name";

// ✅ Correct
import { brand } from "@/config/brand";
const title = brand.name;
```

### Theme System

Visual customization is managed through `src/config/theme.ts`:

```typescript
export const themeConfig = {
  colorScheme: "blue",     // blue | purple | green | orange | neutral
  variant: "modern",        // modern | minimal | bold
  layout: {
    cardStyle: "elevated",  // elevated | flat | bordered
    buttonStyle: "rounded", // rounded | sharp | pill
  },
};
```

### India-Specific Features

- **Currency**: All amounts stored in paise (₹100 = 10000 paise)
- **Razorpay Integration**: No Stripe - designed for Indian market
- **GST Support**: Automatic GST calculation (CGST/SGST or IGST)
- **Phone Validation**: +91 format with proper validation
- **Localization**: `en-IN` locale for currency and dates

## Development

### Adding a New Page

```bash
# Create a new page in src/app
# For example: src/app/about/page.tsx
```

### Adding a New Component

```bash
# Add to src/components
# Use shadcn components: npx shadcn@latest add <component>
```

### Adding a New API Route

```bash
# Create in src/app/api/
# Example: src/app/api/users/route.ts
```

### Database Changes

1. Create a new migration file in `supabase/migrations/`
2. Always enable RLS on new tables
3. Create appropriate policies for data access

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Works with any platform that supports Next.js:
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform

## Environment-Specific Notes

### Supabase

- Set up Row Level Security (RLS) for all tables
- Use server-side client for API routes
- Use browser client for client components

### Razorpay

- Test with test keys during development
- Enable webhooks for subscription tracking
- Verify payment signatures server-side

### Inngest

- Use for background jobs (emails, notifications)
- Set up retry policies for critical tasks
- Monitor job execution in Inngest dashboard

## Support

- Documentation: [PropelKit Docs](https://propelkit.dev/docs)
- GitHub Issues: [Report a bug](https://github.com/yourusername/propelkit/issues)
- Email: support@propelkit.dev

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Built With PropelKit

Share your project:
- Tweet at us: [@propelkit](https://twitter.com/propelkit)
- Add to showcase: support@propelkit.dev

---

**Made with ❤️ for Indian developers**
