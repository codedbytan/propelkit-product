# 🚀 PropelKit Deployment Guide

Complete guide to deploy your SaaS to production.

---

## Quick Links

- [Vercel Deployment](#vercel-recommended) (Easiest, recommended)
- [Railway Deployment](#railway-deployment)
- [AWS Deployment](#aws-deployment)
- [Custom VPS](#custom-vps-deployment)

---

## Pre-Deployment Checklist

Before deploying, ensure:

### ✅ Code Ready

- [ ] All tests passing
- [ ] No console errors
- [ ] `brand.ts` updated with production values
- [ ] Logo and images replaced
- [ ] SEO metadata updated

### ✅ Environment Variables

- [ ] All secrets are production-ready
- [ ] No test API keys in production
- [ ] Razorpay switched to Live Mode
- [ ] Resend domain verified
- [ ] Inngest configured for production

### ✅ Database

- [ ] Supabase project created (production)
- [ ] Migrations applied
- [ ] RLS policies enabled
- [ ] Backup strategy in place

### ✅ Payments

- [ ] Razorpay KYC completed
- [ ] Live mode activated
- [ ] Webhook URL configured
- [ ] Test payment successful

### ✅ Legal

- [ ] Terms of Service added
- [ ] Privacy Policy added
- [ ] Refund Policy added
- [ ] GST compliance verified

---

## Vercel (Recommended)

### Why Vercel?

- ✅ **Zero config** for Next.js
- ✅ **Free tier** available
- ✅ **Edge network** (fast globally)
- ✅ **Preview deployments** for every push
- ✅ **Built-in analytics**

### 1. Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-saas.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com/)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### 3. Add Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**:

```bash
# App URL (use Vercel domain first, then custom domain later)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Supabase (PRODUCTION project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Razorpay (LIVE MODE keys!)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Razorpay Plans (production plan IDs)
NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY=plan_xxxxx
NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY=plan_xxxxx

# Resend (production API key)
RESEND_API_KEY=re_xxxxx

# Inngest (production keys)
INNGEST_EVENT_KEY=xxxxx
INNGEST_SIGNING_KEY=xxxxx
```

### 4. Deploy

Click **Deploy** → Wait 2-3 minutes → Done! 🎉

Your app is live at `https://your-app.vercel.app`

### 5. Setup Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain: `yoursaas.com`
3. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 mins)
5. SSL certificate auto-generated ✅

### 6. Update Webhooks

Update webhook URLs on:

**Razorpay:**
- Go to Settings → Webhooks
- Update URL: `https://yoursaas.com/api/webhooks/razorpay`

**Inngest:**
- Go to Serve → Edit endpoint
- Update URL: `https://yoursaas.com/api/inngest`

### 7. Post-Deployment

```bash
# Update NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_URL=https://yoursaas.com

# Redeploy on Vercel to pick up new URL
git add .
git commit -m "Update app URL"
git push
```

---

## Railway Deployment

### 1. Install Railway CLI

```bash
# Windows (using npm)
npm install -g @railway/cli

# Login
railway login
```

### 2. Initialize Railway

```bash
railway init
railway link
```

### 3. Add Environment Variables

```bash
railway variables set NEXT_PUBLIC_APP_URL=your-app.railway.app
railway variables set NEXT_PUBLIC_SUPABASE_URL=xxx
# ... add all env vars
```

### 4. Deploy

```bash
railway up
```

### 5. Custom Domain

1. Go to Railway dashboard
2. Click on your project → Settings → Domains
3. Add custom domain
4. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: your-app.railway.app
   ```

---

## AWS Deployment

### Option 1: AWS Amplify

**Easiest AWS option for Next.js:**

1. Go to AWS Amplify console
2. Connect GitHub repository
3. Add environment variables
4. Deploy

**Estimated cost**: ~$15-30/month

### Option 2: EC2 + PM2

**For full control:**

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/your-saas.git
cd your-saas

# Install dependencies
npm install

# Create .env.local (or use AWS Secrets Manager)
nano .env.local
# Paste your production env vars

# Build
npm run build

# Start with PM2
pm2 start npm --name "your-saas" -- start
pm2 startup
pm2 save
```

**Setup Nginx reverse proxy:**

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/your-saas
```

```nginx
server {
    listen 80;
    server_name yoursaas.com www.yoursaas.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/your-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Setup SSL with Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yoursaas.com -d www.yoursaas.com
```

---

## Custom VPS Deployment

### Providers

- **DigitalOcean**: $5-10/month
- **Linode**: $5-10/month
- **Vultr**: $5-10/month

### Setup Steps

Same as [AWS EC2 deployment](#option-2-ec2--pm2) above.

---

## Database Hosting

### Supabase (Recommended)

**Free tier:**
- 500 MB database
- 50,000 monthly active users
- Unlimited API requests

**Pro plan ($25/month):**
- 8 GB database
- 100,000 monthly active users
- Point-in-time recovery

**Setup:**
1. Create production project on [supabase.com](https://supabase.com/)
2. Run migrations
3. Update environment variables

### Alternatives

- **Neon** (serverless Postgres)
- **Railway** (Postgres add-on)
- **AWS RDS** (PostgreSQL)

---

## Email Hosting

### Resend (Recommended)

**Free tier:**
- 100 emails/day
- 1 verified domain

**Pro plan ($20/month):**
- 50,000 emails/month
- Unlimited domains

**Setup:**
1. Verify custom domain
2. Add DNS records
3. Update `brand.ts` with custom email

### Alternatives

- **SendGrid**
- **AWS SES**
- **Mailgun**

---

## Monitoring & Analytics

### 1. Vercel Analytics

**Built-in for Vercel users:**

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Google Analytics

```bash
npm install @next/third-parties
```

```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

### 3. Error Tracking

**Sentry:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Performance Optimization

### 1. Image Optimization

**Use Next.js Image component:**

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority
  quality={85}
/>
```

### 2. Enable Caching

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 3. Enable Compression

Vercel handles this automatically. For custom hosting:

```bash
# In nginx config
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## Security Checklist

### Code Security

- [ ] No API keys in client-side code
- [ ] All secrets in environment variables
- [ ] CORS configured properly
- [ ] Rate limiting on API routes
- [ ] Input validation with Zod
- [ ] SQL injection prevention (using Supabase)

### Supabase Security

- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secret
- [ ] Database backups enabled
- [ ] Email verification required

### Razorpay Security

- [ ] Webhook signature verification
- [ ] Live mode keys secured
- [ ] Payment flow tested
- [ ] Refund policy implemented

---

## Backup Strategy

### Database Backups

**Supabase:**
- Auto-backups on Pro plan
- Point-in-time recovery
- Manual backups via SQL dump

```bash
# Manual backup
pg_dump -h db.xxx.supabase.co -U postgres -F c -b -v -f backup.dump
```

### Code Backups

- ✅ **GitHub**: Main source of truth
- ✅ **Vercel**: Auto-deploys from GitHub
- ✅ **Local**: Keep local copy

---

## Rollback Plan

### Quick Rollback on Vercel

1. Go to **Deployments**
2. Find last working deployment
3. Click **...** → **Promote to Production**

### Database Rollback

**From Supabase dashboard:**
1. Go to Database → Backups
2. Choose backup point
3. Restore

---

## Post-Launch Checklist

### Week 1

- [ ] Monitor error logs daily
- [ ] Check payment success rate
- [ ] Verify email deliverability
- [ ] Test user flows
- [ ] Gather user feedback

### Month 1

- [ ] Review analytics
- [ ] Optimize slow pages
- [ ] Fix reported bugs
- [ ] Plan new features

---

## Cost Estimation

### Minimal Setup (Free tier)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| Resend | Free | $0 |
| Inngest | Free | $0 |
| **Total** | | **$0/month** |

**Limitations**: 500 MB DB, 100 emails/day

### Production Setup

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Resend | Pro | $20 |
| Inngest | Pro | $25 |
| Domain | .com | $12/year |
| **Total** | | **~$90/month** |

**Supports**: ~10K users, unlimited traffic

---

## 🎉 You're Live!

Congratulations! Your SaaS is now in production.

**Next steps:**
1. Monitor analytics
2. Collect user feedback
3. Plan feature roadmap
4. Scale as needed

---

## 🆘 Support

- 📧 Email: support@propelkit.dev
- 💬 Discord: [Join community](https://discord.gg/propelkit)
- 📖 Docs: [propelkit.dev/docs](https://propelkit.dev/docs)

---

**Happy launching! 🚀**