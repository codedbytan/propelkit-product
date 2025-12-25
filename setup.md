# 🚀 Acme SaaS Boilerplate - Setup Guide

Welcome! This guide will help you get your SaaS up and running in under 30 minutes.

---

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Razorpay account (test mode is fine to start)
- A Resend account (free tier: 100 emails/day)

---

## 🎨 Step 1: Customize Your Branding

### 1.1 Replace Product Name
Search the entire codebase for `"Acme SaaS"` and replace with your product name.

**Files to update:**
- `app/layout.tsx` (Page title & metadata)
- `components/Navbar.tsx` (Brand name)
- `components/Footer.tsx` (Company name)
- `app/page.tsx` (Hero section)

### 1.2 Update Logo
- Replace `/public/placeholder.png` with your logo
- Update favicon: Replace `/public/favicon.ico`

### 1.3 Color Theme (Optional)
Edit `app/globals.css` to change the primary color:
```css
--primary: 48 96% 52%; /* Current: Yellow */
```
Try these presets:
- Blue: `220 90% 56%`
- Purple: `270 70% 60%`
- Green: `142 76% 36%`

---

## 🔧 Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ================================
# SUPABASE (Database & Auth)
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# RAZORPAY (Payments)
# ================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# ================================
# RESEND (Emails)
# ================================
RESEND_API_KEY=re_xxxxx
```

### Where to Get These Keys:

**Supabase:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings → API
4. Copy `URL`, `anon key`, and `service_role key`

**Razorpay:**
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Keys
3. Copy `Key ID` and `Key Secret`
4. For webhook secret: Settings → Webhooks → Create Webhook
   - URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Events: Select `payment.captured`, `payment.failed`
   - Copy the webhook secret

**Resend:**
1. Go to [resend.com](https://resend.com)
2. Create account → API Keys → Create
3. Copy the key

---

## 🗄️ Step 3: Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the entire contents of schema.sql here
```

**What this creates:**
- `profiles` - User data storage
- `licenses` - License key management
- `invoices` - Payment history
- `webhook_events` - Prevents duplicate webhook processing
- `audit_logs` - Action tracking
- RLS policies - Security rules

---

## 📧 Step 4: Configure Email Sending

### 4.1 Verify Your Domain (For Production)
1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records they provide
4. Wait for verification

### 4.2 Update Email Sender
In `lib/email.ts`, change:
```typescript
from: 'onboarding@resend.dev' // ← Test mode
```
To:
```typescript
from: 'noreply@yourdomain.com' // ← Your domain
```

⚠️ **Important:** Keep `resend.dev` until your domain is verified!

---

## 💰 Step 5: Configure Payments

### 5.1 Set Your Pricing
Edit `components/Pricing.tsx`:

```typescript
const plans = [
  {
    key: "starter_lifetime",
    name: "Starter Plan",
    price: 2999, // ← Change this (in rupees)
    features: [
      "Feature 1",
      "Feature 2",
      // Add your features
    ],
  },
  // Add more plans
];
```

### 5.2 Update Server-Side Prices
⚠️ **Critical Security Step:**

In `app/api/checkout/route.ts`, update prices:
```typescript
const prices: Record<string, number> = {
  "starter_lifetime": 299900, // ← Must match (in paise)
};
```

**Why?** Never trust prices from the frontend!

### 5.3 Customize GST Details
In `lib/gst-engine.ts`:
```typescript
const gstCalculator = new GSTCalculator({
  sellerStateCode: "08", // ← Your state code (see STATE_CODES)
  sellerGSTIN: "08AAAAA0000A1Z5", // ← Your GSTIN
});
```

State codes: `"27"` = Maharashtra, `"08"` = Rajasthan, etc.

---

## 🚀 Step 6: Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test the Flow:
1. ✅ Sign up with email
2. ✅ Log in
3. ✅ Go to `/dashboard`
4. ✅ Try the payment flow (use Razorpay test cards)

**Razorpay Test Card:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

---

## 🌐 Step 7: Deploy to Vercel

### 7.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-saas.git
git push -u origin main
```

### 7.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add all environment variables (from `.env.local`)
4. Deploy!

### 7.3 Update Razorpay Webhook
Once deployed, update the webhook URL:
- Old: `http://localhost:3000/api/webhooks/razorpay`
- New: `https://yourdomain.vercel.app/api/webhooks/razorpay`

---

## 🔒 Security Checklist

Before going live:
- [ ] All `.env` variables are set in Vercel
- [ ] RLS policies are enabled on all tables
- [ ] Razorpay is in LIVE mode (not test)
- [ ] Webhook secret is updated
- [ ] Email domain is verified
- [ ] Test a real payment in live mode

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Resend Docs](https://resend.com/docs)

---

## 🆘 Need Help?

Common issues:
- **"Invalid GSTIN"**: Check format in `gst-engine.ts`
- **"Payment failed"**: Verify Razorpay webhook is active
- **"Email not sent"**: Check Resend API key & domain verification

---

## 🎉 You're Ready to Ship!

Your SaaS is now live. Focus on building your unique features and acquiring customers!

**What's included:**
✅ Authentication (Email + Google)
✅ Payment processing (Razorpay)
✅ GST-compliant invoicing
✅ User dashboard
✅ Email notifications
✅ Admin capabilities

**Next steps:**
1. Build your core product features
2. Add more pricing tiers
3. Set up analytics (Plausible/Umami)
4. Launch! 🚀