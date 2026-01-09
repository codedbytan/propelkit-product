# 🚀 PropelKit Setup Guide

Complete step-by-step guide to set up your SaaS from scratch.

**Time Required**: 30-45 minutes

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** 18+ installed ([Download](https://nodejs.org/))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **Code Editor** (VS Code recommended)
- ✅ **Accounts** on:
  - [Supabase](https://supabase.com/) (Free tier)
  - [Razorpay](https://razorpay.com/) (Test mode)
  - [Resend](https://resend.com/) (Free tier)
  - [Inngest](https://www.inngest.com/) (Free tier)

---

## Step 1: Clone & Install

### 1.1 Download the Code

After purchase, you'll receive a download link for the source code.

```bash
# Extract the ZIP file
# Navigate to the folder
cd propelkit-product

# Install dependencies
npm install
```

### 1.2 Verify Installation

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version
```

---

## Step 2: Supabase Setup

### 2.1 Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: Your SaaS Name
   - **Database Password**: Generate strong password (save it!)
   - **Region**: ap-south-1 (Mumbai) for Indian users
4. Click **Create Project** (wait 2-3 minutes)

### 2.2 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these keys:
   - `URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` → SUPABASE_SERVICE_ROLE_KEY (⚠️ Keep secret!)

### 2.3 Run Database Migrations

```bash
# Install Supabase CLI (Windows)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Or manually** execute SQL from `supabase/migrations/` in Supabase SQL Editor.

### 2.4 Enable Auth Providers

1. Go to **Authentication** → **Providers**
2. Enable:
   - **Email** (default)
   - **Google** (optional):
     - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
     - Add authorized redirect: `https://your-project.supabase.co/auth/v1/callback`

---

## Step 3: Razorpay Setup

### 3.1 Create Account

1. Sign up at [razorpay.com](https://razorpay.com/)
2. Complete KYC (for production use)
3. For testing, use **Test Mode** (top-right toggle)

### 3.2 Get API Keys

1. Go to **Settings** → **API Keys**
2. Generate new keys (Test Mode):
   - **Key ID** → NEXT_PUBLIC_RAZORPAY_KEY_ID
   - **Key Secret** → RAZORPAY_KEY_SECRET (⚠️ Keep secret!)

### 3.3 Create Subscription Plans (Optional)

For recurring payments:

1. Go to **Subscriptions** → **Plans**
2. Create plans:
   - **Monthly Plan**:
     - Amount: ₹999 (in paise: 99900)
     - Interval: 1 month
     - Copy Plan ID → NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY
   - **Yearly Plan**:
     - Amount: ₹9,999 (in paise: 999900)
     - Interval: 1 year
     - Copy Plan ID → NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY

### 3.4 Setup Webhooks

1. Go to **Settings** → **Webhooks**
2. Add new webhook:
   - **URL**: `https://your-app.vercel.app/api/webhooks/razorpay`
   - **Events**: Select all payment events
   - **Secret**: Generate and copy → RAZORPAY_WEBHOOK_SECRET

---

## Step 4: Resend Setup

### 4.1 Create Account

1. Sign up at [resend.com](https://resend.com/)
2. Verify your email

### 4.2 Get API Key

1. Go to **API Keys**
2. Create new API key
3. Copy key → RESEND_API_KEY

### 4.3 Add Domain (for production)

1. Go to **Domains**
2. Add your domain (e.g., `yoursaas.com`)
3. Add DNS records:
   ```
   Type: TXT
   Name: @
   Value: [provided by Resend]
   ```
4. Verify domain

**For development**: Use `onboarding@resend.dev` (works out of the box)

### 4.4 Update Email Sender

Edit `src/config/brand.ts`:

```typescript
email: {
  fromSupport: "Your SaaS <support@yoursaas.com>",
  fromBilling: "Your SaaS Billing <billing@yoursaas.com>",
  // ...
},
```

---

## Step 5: Inngest Setup

### 5.1 Create Account

1. Sign up at [inngest.com](https://www.inngest.com/)
2. Create new app

### 5.2 Get Keys

1. Go to **Keys**
2. Copy:
   - **Event Key** → INNGEST_EVENT_KEY
   - **Signing Key** → INNGEST_SIGNING_KEY

### 5.3 Configure Serve Endpoint

1. Go to **Serve**
2. Add serve endpoint:
   ```
   https://your-app.vercel.app/api/inngest
   ```

---

## Step 6: Environment Variables

### 6.1 Create `.env.local`

In project root (Windows):

```bash
copy .env.example .env.local
```

### 6.2 Fill in Values

Edit `.env.local`:

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ⚠️ KEEP SECRET!

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx # ⚠️ KEEP SECRET!
RAZORPAY_WEBHOOK_SECRET=xxxxx # ⚠️ KEEP SECRET!

# Razorpay Plans (optional for subscriptions)
NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY=plan_xxxxx
NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY=plan_xxxxx

# Resend
RESEND_API_KEY=re_xxxxx # ⚠️ KEEP SECRET!

# Inngest
INNGEST_EVENT_KEY=xxxxx # ⚠️ KEEP SECRET!
INNGEST_SIGNING_KEY=xxxxx # ⚠️ KEEP SECRET!
```

---

## Step 7: Customize Brand Configuration

Edit `src/config/brand.ts`:

```typescript
export const brand = {
  name: "YourSaaS",                     // ✏️ Your product name
  tagline: "Ship faster, scale easier", // ✏️ Your tagline
  
  company: {
    legalName: "YourCo Pvt Ltd",       // ✏️ Your legal entity
    gstin: "27AAAAA0000A1Z5",          // ✏️ Your GSTIN
    address: {
      line1: "Your Address",           // ✏️ Update
      line2: "Mumbai, Maharashtra - 400001",
      city: "Mumbai",
      state: "Maharashtra",
      stateCode: "27",                 // ✏️ Your state code
      pincode: "400001",
      country: "India",
    },
  },

  contact: {
    email: "support@yoursaas.com",     // ✏️ Your support email
    phone: "+91-9876543210",           // ✏️ Your phone
  },

  pricing: {
    plans: {
      starter: {
        priceInPaise: 499900,          // ✏️ ₹4,999
        price: 4999,
        // ... features
      },
    },
  },

  invoice: {
    sacCode: "998314",                 // ✏️ Update if different service
    prefix: "YOUR",                    // ✏️ Invoice prefix (e.g., YOUR/24-25/0001)
  },

  // ... rest stays the same
};
```

---

## Step 8: First Run

### 8.1 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 8.2 Create First User

1. Go to `/signup`
2. Register with email
3. Check email for verification link
4. Verify and login

### 8.3 Make Yourself Admin

Run this in Supabase SQL Editor:

```sql
-- Replace 'your-user-id' with actual UUID from auth.users table
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-id';
```

Now access Super Admin Dashboard at `/admin`

---

## Step 9: Test Payments

### 9.1 Test One-Time Payment

1. Go to pricing page
2. Click "Buy Now"
3. Use Razorpay test card:
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: Any future date
   CVV: Any 3 digits
   OTP: 123456
   ```

### 9.2 Verify

- ✅ Payment should succeed
- ✅ Check email for invoice
- ✅ Check Supabase `payments` table
- ✅ Check Inngest dashboard for background jobs

---

## Step 10: Production Checklist

Before deploying to production:

### Security

- [ ] Update all `KEEP SECRET!` environment variables
- [ ] Never commit `.env.local` to Git
- [ ] Enable Supabase RLS policies
- [ ] Switch Razorpay to Live Mode

### Branding

- [ ] Update `brand.ts` with actual company details
- [ ] Replace logo in `public/logo.png`
- [ ] Update favicon `public/favicon.ico`
- [ ] Update OG image `public/og-image.png`

### Emails

- [ ] Verify custom domain on Resend
- [ ] Update `brand.email.*` with custom domain
- [ ] Test all email templates

### Legal

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund Policy
- [ ] Comply with Indian laws (IT Act, Data Protection)

### GST Compliance

- [ ] Get valid GSTIN
- [ ] Update `brand.company.gstin`
- [ ] Update SAC code if different service
- [ ] Consult CA for tax compliance

---

## 🎉 You're Ready!

Your SaaS is now set up and ready for development!

**Next Steps:**
1. [Customization Guide](./CUSTOMIZATION_GUIDE.md) - Make it your own
2. [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Go live
3. [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) - Use Claude Code

---

## 🆘 Troubleshooting

### Common Issues

**1. "Supabase connection failed"**
- Verify URL and anon key in `.env.local`
- Check if project is active on Supabase dashboard

**2. "Razorpay payment not working"**
- Ensure test mode is ON (for development)
- Verify key ID and secret are correct
- Check browser console for errors

**3. "Emails not sending"**
- Verify RESEND_API_KEY is set
- For production, ensure domain is verified
- Check Resend dashboard for error logs

**4. "Inngest functions not showing"**
- Restart dev server after adding INNGEST keys
- Check Inngest dashboard → Apps → Sync status

**5. "Module not found" errors**
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

### Still Stuck?

- 📧 Email: support@propelkit.dev
- 💬 Discord: [Join community](https://discord.gg/propelkit)
- 📖 Docs: [propelkit.dev/docs](https://propelkit.dev/docs)

---

**Happy coding! 🚀**