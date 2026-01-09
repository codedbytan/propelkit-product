# ✅ PropelKit Production Checklist

Complete pre-launch checklist to ensure your SaaS is production-ready.

---

## Table of Contents

1. [Code Quality](#code-quality)
2. [Configuration](#configuration)
3. [Security](#security)
4. [Database](#database)
5. [Payments](#payments)
6. [Emails](#emails)
7. [Legal & Compliance](#legal--compliance)
8. [Performance](#performance)
9. [Monitoring](#monitoring)
10. [Launch Day](#launch-day)

---

## Code Quality

### TypeScript & Build

- [ ] No TypeScript errors
  ```bash
  npm run build  # Must succeed with no errors
  ```

- [ ] No console.log statements in production code
  ```bash
  # Search and remove:
  grep -r "console.log" src/
  ```

- [ ] All TODO/FIXME comments addressed
  ```bash
  grep -r "TODO\|FIXME" src/
  ```

- [ ] Code formatted consistently
  ```bash
  npm run format  # or prettier
  ```

- [ ] Dependencies up to date
  ```bash
  npm outdated
  npm update
  ```

---

## Configuration

### Brand Configuration (`src/config/brand.ts`)

- [ ] **Product name** updated
  ```typescript
  name: "YourSaaS",  // Not "PropelKit"
  ```

- [ ] **Company details** accurate
  ```typescript
  company: {
    legalName: "YourCo Pvt Ltd",  // Your legal entity
    gstin: "27AAAAA0000A1Z5",     // YOUR GSTIN
    pan: "AAAAA0000A",             // YOUR PAN
    address: {
      // YOUR address
    }
  }
  ```

- [ ] **Contact information** correct
  ```typescript
  contact: {
    email: "support@yoursaas.com",  // Your support email
    phone: "+91-XXXXXXXXXX",         // Your phone
  }
  ```

- [ ] **Email senders** verified
  ```typescript
  email: {
    fromSupport: "YourSaaS <support@yoursaas.com>",
    // Must be verified on Resend
  }
  ```

- [ ] **Pricing** finalized
  ```typescript
  pricing: {
    plans: {
      starter: {
        priceInPaise: 499900,  // YOUR pricing
      }
    }
  }
  ```

- [ ] **Social links** updated
  ```typescript
  social: {
    twitter: "https://twitter.com/yoursaas",
    // Your actual social URLs
  }
  ```

- [ ] **SEO metadata** optimized
  ```typescript
  seo: {
    title: "YourSaaS - Your tagline",
    description: "...",
    keywords: "...",
  }
  ```

---

### Environment Variables

- [ ] **All variables set in production**
  - Vercel Dashboard → Settings → Environment Variables
  - Check against `.env.example`

- [ ] **No test/development keys in production**
  ```bash
  # Verify:
  RAZORPAY_KEY_ID=rzp_live_xxxxx  # NOT rzp_test_
  # All keys should be production keys
  ```

- [ ] **Secrets are secret**
  - `SUPABASE_SERVICE_ROLE_KEY` - Never exposed to client
  - `RAZORPAY_KEY_SECRET` - Server-side only
  - `RAZORPAY_WEBHOOK_SECRET` - Server-side only
  - `INNGEST_SIGNING_KEY` - Server-side only

- [ ] **App URL correct**
  ```bash
  NEXT_PUBLIC_APP_URL=https://yoursaas.com  # Your domain
  ```

---

### Visual Assets

- [ ] **Logo replaced**
  - `public/logo.png` (500x500px recommended)
  - `public/logo-dark.png` (for dark mode, optional)

- [ ] **Favicon updated**
  - `public/favicon.ico` (32x32px)
  - `public/apple-icon.png` (180x180px)

- [ ] **OG image created**
  - `public/og-image.png` (1200x630px)
  - Shows when shared on social media

- [ ] **All placeholder images replaced**
  ```bash
  # Search for placeholder images:
  grep -r "placeholder" src/
  grep -r "unsplash" src/
  ```

---

## Security

### Authentication

- [ ] **Email verification enabled**
  - Supabase Dashboard → Authentication → Email Templates
  - Confirm account template configured

- [ ] **Password requirements enforced**
  - Minimum 8 characters
  - Complexity rules if needed

- [ ] **Rate limiting implemented**
  - Login attempts limited
  - API endpoints protected

- [ ] **Session timeout configured**
  ```typescript
  // Check Supabase settings:
  JWT expiry: 3600s (1 hour)
  Refresh token expiry: 2592000s (30 days)
  ```

---

### API Security

- [ ] **CORS configured properly**
  ```typescript
  // next.config.js
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yoursaas.com' }
      ]
    }]
  }
  ```

- [ ] **Input validation on all endpoints**
  - Using Zod schemas
  - SQL injection prevention (using Supabase)
  - XSS prevention (React auto-escapes)

- [ ] **Error messages don't leak sensitive info**
  ```typescript
  // ❌ Bad
  return NextResponse.json({ error: error.message })
  
  // ✅ Good
  return NextResponse.json({ error: 'Operation failed' })
  // Log details server-side only
  ```

---

### Database Security

- [ ] **RLS enabled on all tables**
  ```sql
  -- Verify:
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  -- All should show: true
  ```

- [ ] **Policies reviewed and tested**
  - Users can only access their own data
  - Organization members can access org data
  - Admin policies separate from user policies

- [ ] **Service role key never exposed to client**
  ```typescript
  // ✅ Only in server-side code:
  import { supabaseAdmin } from '@/lib/supabase-admin';
  
  // ❌ Never in client components
  ```

- [ ] **Database backups enabled**
  - Supabase Pro plan required for auto-backups
  - Or set up manual backup schedule

---

## Database

### Schema & Migrations

- [ ] **All migrations applied**
  ```bash
  supabase db push
  # Verify in Supabase dashboard
  ```

- [ ] **Indexes created for performance**
  ```sql
  -- Check common query columns are indexed
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_payments_user_id ON payments(user_id);
  ```

- [ ] **Foreign keys properly set**
  ```sql
  -- Verify cascading deletes where needed:
  ON DELETE CASCADE
  ```

- [ ] **Test data cleaned**
  ```sql
  -- Remove any test/dummy data from production DB
  DELETE FROM users WHERE email LIKE '%test%';
  ```

---

### Data Validation

- [ ] **All required fields have constraints**
  ```sql
  -- Example:
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
  ```

- [ ] **Email addresses validated**
  ```sql
  -- Check constraint or use Supabase auth
  ```

- [ ] **GSTIN format validated**
  ```typescript
  // Using brand.ts helper:
  validateGSTIN(gstin)  // Returns boolean
  ```

---

## Payments

### Razorpay Setup

- [ ] **KYC completed**
  - Razorpay Dashboard → Account & Settings → KYC
  - Status: Activated

- [ ] **Live Mode activated**
  - Toggle: Test Mode → Live Mode
  - Production keys generated

- [ ] **Live keys in production**
  ```bash
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
  RAZORPAY_KEY_SECRET=xxxxx  # Live secret
  ```

- [ ] **Webhook configured**
  - URL: `https://yoursaas.com/api/webhooks/razorpay`
  - Events: All payment events selected
  - Secret: Matches `RAZORPAY_WEBHOOK_SECRET`

- [ ] **Subscription plans created (if applicable)**
  - Monthly plan: Plan ID added to `.env`
  - Yearly plan: Plan ID added to `.env`

---

### Payment Flow Testing

- [ ] **Test complete payment flow**
  1. Click "Buy Now"
  2. Razorpay checkout opens
  3. Complete payment (use test card first, then real card)
  4. Redirected to success page
  5. Invoice email received
  6. License key generated
  7. Database updated

- [ ] **Test payment failures**
  - Declined card
  - Insufficient funds
  - Network error
  - User sees error message

- [ ] **Test webhooks**
  - Payment success triggers webhook
  - Subscription activation triggers webhook
  - Database updates correctly
  - Emails sent

- [ ] **Verify invoice generation**
  - PDF generated correctly
  - GST calculated properly
  - Company details match `brand.ts`
  - Invoice attached to email

---

## Emails

### Resend Configuration

- [ ] **Domain verified**
  - Resend Dashboard → Domains
  - DNS records added (TXT, MX, CNAME)
  - Status: Verified

- [ ] **SPF/DKIM/DMARC configured**
  - Check via: [MXToolbox](https://mxtoolbox.com/)
  - All should pass

- [ ] **Production API key set**
  ```bash
  RESEND_API_KEY=re_xxxxx  # Production key
  ```

- [ ] **Sender emails updated**
  ```typescript
  // In brand.ts:
  email: {
    fromSupport: "YourSaaS <support@yoursaas.com>",
    // NOT @resend.dev for production
  }
  ```

---

### Email Templates Testing

- [ ] **Welcome email** tested
  - Subject line clear
  - Logo displays
  - Links work
  - Mobile responsive

- [ ] **Invoice email** tested
  - PDF attached
  - GST details correct
  - Amount formatted properly
  - Download link works

- [ ] **Password reset** tested
  - Reset link works
  - Expires after use
  - Expires after 1 hour

- [ ] **Subscription emails** tested (if applicable)
  - Activation email
  - Renewal reminder
  - Payment failed
  - Cancellation

---

### Email Deliverability

- [ ] **Test deliverability**
  - Send to Gmail
  - Send to Outlook
  - Send to Yahoo
  - Check spam folder

- [ ] **Email scoring**
  - Use [Mail-Tester](https://www.mail-tester.com/)
  - Score should be 8/10 or higher

- [ ] **Unsubscribe link present**
  - Required by law
  - Works correctly

---

## Legal & Compliance

### Legal Pages

- [ ] **Terms of Service** created
  - Located at `/terms`
  - Reviewed by lawyer (recommended)
  - Updated with your company name
  - Link in footer

- [ ] **Privacy Policy** created
  - Located at `/privacy`
  - Covers data collection
  - GDPR compliant (if serving EU)
  - Link in footer

- [ ] **Refund Policy** created
  - Located at `/refund-policy`
  - Clear refund terms
  - Within Indian laws
  - Link in footer and checkout

- [ ] **Cookie Policy** (if using cookies)
  - Cookie banner implemented
  - Policy page created
  - User can opt-out

---

### GST Compliance

- [ ] **Valid GSTIN obtained**
  - From GST portal
  - Updated in `brand.ts`

- [ ] **GST registration complete**
  - Business registered for GST
  - State code correct

- [ ] **Invoices GST-compliant**
  - GSTIN on invoice
  - SAC code correct (998314 for SaaS)
  - CGST/SGST or IGST calculated
  - HSN/SAC codes present

- [ ] **GST returns process set up**
  - Know your filing schedule
  - Have CA/accountant ready

---

### Data Protection

- [ ] **Data encryption**
  - HTTPS enabled (Vercel auto-provides)
  - Database encrypted at rest (Supabase default)
  - Sensitive fields encrypted

- [ ] **Data retention policy**
  - Old audit logs cleaned (90 days)
  - Deleted user data removed
  - Backup retention defined

- [ ] **GDPR compliance** (if serving EU)
  - Data export feature
  - Account deletion feature
  - Cookie consent banner

---

## Performance

### Loading Speed

- [ ] **Lighthouse score > 90**
  - Run: [PageSpeed Insights](https://pagespeed.web.dev/)
  - Test on mobile and desktop
  - Fix critical issues

- [ ] **Images optimized**
  - Using Next.js Image component
  - WebP format where possible
  - Lazy loading enabled

- [ ] **Fonts optimized**
  - Using next/font
  - No layout shift

- [ ] **Code splitting working**
  - Dynamic imports for large components
  - Bundle size reasonable

---

### Database Performance

- [ ] **Slow queries identified**
  ```sql
  -- Check Supabase logs for slow queries
  -- Add indexes where needed
  ```

- [ ] **Connection pooling enabled**
  - Supabase handles this automatically

- [ ] **N+1 queries eliminated**
  - Use `select` with joins
  - Avoid loading relations in loops

---

### Caching

- [ ] **Static assets cached**
  ```typescript
  // next.config.js
  async headers() {
    return [{
      source: '/images/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }]
    }]
  }
  ```

- [ ] **API responses cached** (where appropriate)
  ```typescript
  export const revalidate = 3600; // 1 hour
  ```

---

## Monitoring

### Error Tracking

- [ ] **Sentry installed** (recommended)
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] **Error boundaries implemented**
  - Catch React errors
  - Show fallback UI
  - Log to monitoring service

- [ ] **API error logging**
  - All errors logged
  - Includes context (user ID, request ID)

---

### Analytics

- [ ] **Google Analytics set up**
  ```typescript
  // app/layout.tsx
  import { GoogleAnalytics } from '@next/third-parties/google';
  <GoogleAnalytics gaId="G-XXXXXXXXXX" />
  ```

- [ ] **Vercel Analytics enabled** (if using Vercel)
  ```bash
  npm install @vercel/analytics
  ```

- [ ] **Custom events tracked**
  - Sign ups
  - Payments
  - Feature usage

---

### Uptime Monitoring

- [ ] **Uptime monitor configured**
  - [UptimeRobot](https://uptimerobot.com/) (free)
  - Or Vercel monitoring
  - Check every 5 minutes

- [ ] **Status page created** (optional)
  - [Statuspage.io](https://statuspage.io/)
  - Show current status
  - Incident history

---

## Launch Day

### Pre-Launch (24 hours before)

- [ ] **Final test of entire flow**
  - Sign up
  - Purchase
  - Receive email
  - Access dashboard
  - All features work

- [ ] **Load testing** (if expecting traffic)
  ```bash
  # Use tools like:
  # - Apache Bench
  # - k6
  # - Artillery
  ```

- [ ] **Database backup taken**
  - Manual backup before launch
  - Confirm restore works

- [ ] **Team notified**
  - Support team ready
  - Dev team on standby
  - Monitoring alerts enabled

---

### Launch

- [ ] **DNS updated**
  - Domain points to production
  - SSL certificate active
  - WWW redirect works

- [ ] **Social media ready**
  - Launch tweet drafted
  - LinkedIn post ready
  - Product Hunt submission prepared

- [ ] **Support channels active**
  - Email support@yoursaas.com monitored
  - Discord/Slack for community
  - FAQ page live

---

### Post-Launch (First 48 hours)

- [ ] **Monitor errors actively**
  - Check Sentry dashboard
  - Review Vercel logs
  - Watch for spikes

- [ ] **Track sign-ups**
  - Google Analytics
  - Database queries
  - Conversion rate

- [ ] **Respond to feedback**
  - Bug reports
  - Feature requests
  - User questions

- [ ] **Have rollback plan ready**
  - Previous deployment saved
  - Database backup confirmed
  - Know how to roll back

---

## Final Checklist

Before going live, verify:

- [ ] All items in this checklist completed
- [ ] 3 test purchases completed successfully
- [ ] 10+ friends/beta testers used the product
- [ ] No known critical bugs
- [ ] Team trained on support process
- [ ] Lawyer reviewed legal pages (recommended)
- [ ] CA confirmed GST setup (recommended)

---

## Launch Readiness Score

Count your completed items:

- **90-100%**: ✅ Ready to launch!
- **75-89%**: ⚠️ Almost there, fix critical items
- **Below 75%**: ❌ Not ready, complete more items

---

## Support

Questions about production readiness?

- 📧 Email: support@propelkit.dev
- 💬 Discord: [Join community](https://discord.gg/propelkit)
- 📖 Docs: [propelkit.dev/docs](https://propelkit.dev/docs)

---

**Good luck with your launch! 🚀**