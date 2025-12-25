# 🔒 Security Best Practices

## Before Going Live

### ✅ Critical Checks

#### 1. Environment Variables
- [ ] All secrets are in `.env.local` (NOT `.env`)
- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded API keys in code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NEVER exposed to client
- [ ] Razorpay keys are switched to LIVE mode
- [ ] Webhook secret matches your Razorpay dashboard

#### 2. Authentication
- [ ] Supabase RLS (Row Level Security) is enabled on all tables
- [ ] Middleware protects `/dashboard/*` routes
- [ ] No user can access another user's data
- [ ] Email confirmation is enabled in Supabase
- [ ] Password reset works correctly

#### 3. Payment Security
- [ ] Razorpay signature verification is active in webhook
- [ ] Server-side price validation in `/api/checkout`
- [ ] Webhook URL uses HTTPS (not HTTP)
- [ ] Webhook events table prevents duplicate processing
- [ ] Failed payments are logged

#### 4. Database Security
- [ ] RLS policies are tested for each table
- [ ] Service role key is ONLY used in API routes (never client)
- [ ] No SQL injection vulnerabilities (using Supabase client correctly)
- [ ] Audit logs capture critical actions

#### 5. Email Security
- [ ] Resend domain is verified (not using `resend.dev`)
- [ ] Email sender address matches your domain
- [ ] No test/debug email addresses hardcoded
- [ ] Invoice PDFs don't contain sensitive data beyond transaction info

#### 6. API Security
- [ ] Input validation on all POST routes (using Zod)
- [ ] Error messages don't expose internal details
- [ ] Rate limiting is configured (Vercel or Upstash)
- [ ] CORS is properly configured
- [ ] API routes have proper error handling

---

## 🛡️ Defense in Depth

### Layer 1: Network Security
**Vercel automatically provides:**
- ✅ HTTPS/TLS encryption
- ✅ DDoS protection
- ✅ CDN with edge caching

**You should add:**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Layer 2: Application Security
**Already implemented:**
- ✅ Razorpay signature verification
- ✅ Supabase RLS policies
- ✅ React auto-escapes XSS

**Recommended additions:**
- Add CSRF tokens for sensitive mutations
- Implement session timeout (30 minutes)
- Add "Remember Me" with secure cookies

### Layer 3: Database Security
**Already implemented:**
- ✅ Row Level Security on all tables
- ✅ Service role isolation

**Best practices:**
```sql
-- Example: Users can only update their own profile
create policy "Users update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

### Layer 4: Monitoring
**Set up alerts for:**
- Failed payment attempts (>5 in 10 minutes)
- Multiple failed logins
- Unusual API usage
- Database errors

Use Sentry or LogRocket:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🚨 Common Vulnerabilities to Avoid

### 1. Exposing Service Role Key
**❌ NEVER do this:**
```typescript
// ❌ BAD: Client-side code
const supabase = createClient(url, SERVICE_ROLE_KEY); 
```

**✅ ALWAYS do this:**
```typescript
// ✅ GOOD: Server-side only
import { supabaseAdmin } from '@/lib/supabase-admin'; // Only in API routes
```

### 2. Trusting Client-Side Prices
**❌ NEVER do this:**
```typescript
// ❌ BAD: Client sends price
const { amount } = await req.json();
razorpay.orders.create({ amount });
```

**✅ ALWAYS do this:**
```typescript
// ✅ GOOD: Server defines price
const prices = { "pro": 599900 };
const amount = prices[planKey]; // Server-side validation
```

### 3. Webhook Without Verification
**❌ NEVER do this:**
```typescript
// ❌ BAD: Trust webhook blindly
const event = await req.json();
activateLicense(event.userId); // Anyone could fake this!
```

**✅ ALWAYS do this:**
```typescript
// ✅ GOOD: Verify signature first
const signature = req.headers.get("x-razorpay-signature");
if (digest !== signature) return new Response("Invalid", { status: 400 });
```

### 4. SQL Injection (Rare with Supabase)
**❌ NEVER do this:**
```typescript
// ❌ BAD: Raw SQL with user input
await supabase.rpc('custom_query', { user_input: req.body.name });
```

**✅ ALWAYS do this:**
```typescript
// ✅ GOOD: Use Supabase query builder
await supabase.from('users').select('*').eq('name', name);
```

---

## 🔐 Secrets Management

### Development
Store in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
RAZORPAY_KEY_SECRET=rzp_test_xxx
```

### Production (Vercel)
1. Go to Project Settings → Environment Variables
2. Add all secrets
3. **NEVER** commit `.env.production`

### Key Rotation Schedule
- API Keys: Every 90 days
- Webhook Secrets: Every 6 months
- Database passwords: Every 6 months

---

## 🧪 Security Testing Checklist

Before launch, test:

### Authentication
- [ ] Can users access each other's dashboards? (Should fail)
- [ ] Can logged-out users access `/dashboard`? (Should redirect)
- [ ] Does password reset work?
- [ ] Can users sign up with same email twice? (Should fail)

### Payments
- [ ] Can users change price in browser devtools? (Should fail)
- [ ] Does webhook reject invalid signatures? (Should fail)
- [ ] Can users trigger webhook manually? (Should fail)
- [ ] Are duplicate webhooks handled? (Should skip)

### Database
- [ ] Can users query other users' data via API? (Should fail)
- [ ] Can users directly access Supabase tables? (Should fail with RLS)
- [ ] Are sensitive fields hidden from public? (Should be)

### API Routes
- [ ] Do API routes return detailed errors? (Should be generic)
- [ ] Can API routes be called without auth? (Protected ones should fail)
- [ ] Is rate limiting working? (Try 100 rapid requests)

---

## 📞 Incident Response Plan

If you discover a security issue:

1. **Immediate Actions (within 1 hour)**
   - Disable affected API route or feature
   - Rotate compromised credentials
   - Check logs for exploitation attempts

2. **Assessment (within 24 hours)**
   - Determine scope of breach
   - Identify affected users
   - Document timeline

3. **Notification (within 72 hours)**
   - Email affected users (if personal data exposed)
   - Post public status update
   - Report to authorities if required by law

4. **Recovery**
   - Deploy fix
   - Re-enable service
   - Monitor for 7 days

---

## 🔄 Regular Maintenance

### Weekly
- Review failed login attempts
- Check webhook error logs
- Monitor API usage spikes

### Monthly
- Update dependencies (`npm audit`)
- Review Supabase access logs
- Test disaster recovery

### Quarterly
- Rotate API keys
- Security audit with OWASP checklist
- Penetration testing (optional)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Razorpay Best Practices](https://razorpay.com/docs/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Remember:** Security is not a one-time setup. It's an ongoing process.