# 🔧 PropelKit Troubleshooting Guide

Complete troubleshooting guide for all common issues and their solutions.

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Build Errors](#build-errors)
3. [Database Issues](#database-issues)
4. [Payment Integration](#payment-integration)
5. [Email Delivery](#email-delivery)
6. [Background Jobs (Inngest)](#background-jobs-inngest)
7. [Deployment Issues](#deployment-issues)
8. [TypeScript Errors](#typescript-errors)
9. [Windows-Specific Issues](#windows-specific-issues)

---

## Setup Issues

### Issue: "Module not found" errors after npm install

**Error:**
```
Module not found: Can't resolve '@/lib/supabase-server'
```

**Solution:**
```bash
# Windows - delete and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install

# If still failing, check tsconfig.json paths:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  # Must be present
    }
  }
}
```

---

### Issue: Environment variables not loading

**Symptoms:**
- `undefined` errors for `process.env.NEXT_PUBLIC_*`
- Supabase connection fails
- Razorpay not initializing

**Solution:**
1. Ensure `.env.local` exists in project root
2. Restart dev server after adding env vars
   ```bash
   # Kill server (Ctrl+C) then:
   npm run dev
   ```
3. For Windows, check file encoding is UTF-8 (not UTF-16)
4. Verify no quotes around values:
   ```bash
   # ❌ WRONG
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   
   # ✅ CORRECT
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```

---

## Build Errors

### Issue: Turbopack symlink error (Windows)

**Error:**
```
TurbopackInternalError: create symlink to node_modules/pdfkit
Caused by: A required privilege is not held by the client. (os error 1314)
```

**Solution:**

**Option 1: Run as Administrator** (Recommended)
```bash
# Right-click PowerShell/CMD → Run as Administrator
npm run dev
npm run build
```

**Option 2: Enable Developer Mode**
1. Settings → Update & Security → For developers
2. Turn on "Developer Mode"
3. Restart computer
4. Try build again

**Option 3: Disable Turbopack** (temporary workaround)
```bash
# In package.json, change:
"dev": "next dev --turbo"

# To:
"dev": "next dev"
```

---

### Issue: Build fails with "Property does not exist" errors

**Error:**
```
Type error: Property 'cgst' does not exist on type 'TaxResult'
```

**Solution:**
The TaxResult interface uses `cgstAmount`, not `cgst`. Check correct property names:

```typescript
// ❌ WRONG
data.taxResult.cgst
data.taxResult.sgst  
data.taxResult.igst

// ✅ CORRECT
data.taxResult.cgstAmount
data.taxResult.sgstAmount
data.taxResult.igstAmount
```

---

## Database Issues

### Issue: Supabase connection failed

**Symptoms:**
- "Invalid API key" errors
- RLS policy violations
- Data not loading

**Solution:**

**1. Verify environment variables:**
```bash
# Check .env.local has:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Different from anon key!
```

**2. Verify URL format:**
- Must start with `https://`
- Must end with `.supabase.co`
- No trailing slash

**3. Check project status:**
- Login to Supabase dashboard
- Ensure project is active (not paused)
- Verify API settings show same keys

---

### Issue: RLS policy violations

**Error:**
```
new row violates row-level security policy
```

**Solution:**

**1. Enable RLS on table:**
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

**2. Create policies:**
```sql
-- Users can view own data
CREATE POLICY "Users can view own data"
ON your_table FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own data
CREATE POLICY "Users can insert own data"
ON your_table FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**3. For service role (bypass RLS):**
Use `supabaseAdmin` client instead of `createClient()`:
```typescript
import { supabaseAdmin } from '@/lib/supabase-admin';

// This bypasses RLS
const { data } = await supabaseAdmin
  .from('table')
  .select('*');
```

---

### Issue: Migrations not applying

**Solution:**
```bash
# Windows (PowerShell)
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link to project
supabase link --project-ref your-project-ref

# 4. Push migrations
supabase db push

# Or manually: Copy SQL from supabase/migrations/ and run in SQL Editor
```

---

## Payment Integration

### Issue: Razorpay payment not working

**Symptoms:**
- Checkout not opening
- "Invalid key" errors
- Payment failing

**Solution:**

**1. Verify test mode:**
- Check Razorpay dashboard: Top-right should say "Test Mode"
- Ensure keys are test keys (start with `rzp_test_`)

**2. Check environment variables:**
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx  # NOT rzp_live_
RAZORPAY_KEY_SECRET=xxxxx
```

**3. Test card numbers:**
```
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
OTP: 123456
```

**4. Check browser console:**
```javascript
// Should see Razorpay script loaded
console.log(window.Razorpay)  // Should not be undefined
```

---

### Issue: Webhook not receiving events

**Symptoms:**
- Payments succeed but database not updated
- No invoice emails sent
- Background jobs not triggered

**Solution:**

**1. Verify webhook URL:**
- Razorpay Dashboard → Settings → Webhooks
- URL should be: `https://your-app.com/api/webhooks/razorpay`
- Must be HTTPS (not HTTP) in production

**2. Check webhook secret:**
```bash
# In .env.local:
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Must match secret from Razorpay dashboard
```

**3. Verify webhook signature in code:**
```typescript
// src/app/api/webhooks/razorpay/route.ts
const signature = headers().get('x-razorpay-signature');
const isValid = Razorpay.validateWebhookSignature(
  body,
  signature,
  process.env.RAZORPAY_WEBHOOK_SECRET
);
```

**4. Test locally with ngrok:**
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use ngrok URL in Razorpay webhook:
# https://abc123.ngrok.io/api/webhooks/razorpay
```

---

## Email Delivery

### Issue: Emails not sending

**Symptoms:**
- No emails received
- "Email service not configured" errors
- Resend API errors

**Solution:**

**1. Verify API key:**
```bash
# In .env.local:
RESEND_API_KEY=re_xxxxx
```

**2. Check sender domain:**
```typescript
// For development:
from: 'onboarding@resend.dev'  // ✅ Works out of the box

// For production:
from: 'support@yourdomain.com'  // ⚠️ Requires domain verification
```

**3. Verify domain on Resend:**
- Resend Dashboard → Domains
- Add domain
- Add DNS records (TXT, MX)
- Wait for verification (can take 30 min)

**4. Check Resend logs:**
- Dashboard → Emails
- Look for failed deliveries
- Check bounce/complaint rates

---

### Issue: PDF not attached to email

**Solution:**

**1. Verify PDF buffer generation:**
```typescript
const pdfBuffer = await generateInvoicePDF(data);
console.log('PDF Buffer:', Buffer.isBuffer(pdfBuffer));  // Should be true
console.log('PDF Size:', pdfBuffer.length);  // Should be > 0
```

**2. Check email attachment:**
```typescript
await resend.emails.send({
  // ...
  attachments: [{
    filename: 'invoice.pdf',
    content: pdfBuffer,  // Must be Buffer, not base64 string
  }],
});
```

---

## Background Jobs (Inngest)

### Issue: Inngest functions not showing

**Symptoms:**
- Functions not appearing in Inngest dashboard
- Events not triggering
- "No functions found" error

**Solution:**

**1. Verify environment variables:**
```bash
INNGEST_EVENT_KEY=01H8X9Y2Z3ABC4DEF5GH6  # ~25-35 chars
INNGEST_SIGNING_KEY=signkey-prod-xxxxx   # Starts with signkey-prod-
```

**⚠️ Common mistake:** Event key format
```bash
# ❌ WRONG - Auto-generated keys sometimes wrong
INNGEST_EVENT_KEY=evt_01H8X9Y2Z3ABC4DEF5GH6  # Has "evt_" prefix

# ✅ CORRECT - Manual from dashboard
INNGEST_EVENT_KEY=01H8X9Y2Z3ABC4DEF5GH6  # No prefix
```

**2. Check Inngest app ID matches:**
```typescript
// src/lib/inngest/client.ts
export const inngest = new Inngest({
  id: 'propelkit-acme-prod',  // Must be unique, consistent
});
```

**3. Verify serve endpoint:**
- Inngest Dashboard → Apps → Your app → Serve
- URL should be: `https://your-app.com/api/inngest`
- Status should be: "Connected" (green)

**4. Test endpoint manually:**
```bash
# Windows PowerShell:
Invoke-WebRequest -Uri "https://your-app.com/api/inngest"

# Should return:
{
  "message": "Inngest endpoint",
  "function_count": 3,
  "mode": "cloud"
}
```

---

### Issue: "Authentication failed" from Inngest

**Error:**
```
Inngest authentication failed: Invalid event key
```

**Solution:**

**1. Get keys manually from dashboard:**
- Go to Inngest Dashboard → Keys
- Make sure "Production" is selected (dropdown top-right)
- Copy "Event Key" (NOT Integration Key)
- Copy "Signing Key"

**2. Replace in Vercel:**
- Vercel → Settings → Environment Variables
- Edit `INNGEST_EVENT_KEY`
- Edit `INNGEST_SIGNING_KEY`
- Redeploy

**3. Verify keys length:**
```typescript
// Create debug endpoint to check:
// src/app/api/debug-inngest/route.ts
export async function GET() {
  return Response.json({
    eventKeyLength: process.env.INNGEST_EVENT_KEY?.length,
    signingKeyLength: process.env.INNGEST_SIGNING_KEY?.length,
    eventKeyStarts: process.env.INNGEST_EVENT_KEY?.substring(0, 5),
  });
}

// Event key should be ~25-35 chars
// Signing key should be ~40-50 chars
```

---

## Deployment Issues

### Issue: Vercel build fails

**Error:**
```
Type errors in production build
```

**Solution:**

**1. Test build locally first:**
```bash
npm run build
```

**2. Fix all TypeScript errors:**
```bash
# Check for errors:
npx tsc --noEmit

# Common fixes:
# - Add proper types to function params
# - Fix import paths
# - Ensure all required props passed
```

**3. Check environment variables:**
- Vercel → Settings → Environment Variables
- Ensure all from `.env.example` are set
- Set for "Production" environment

---

### Issue: 500 Internal Server Error on API routes

**Solution:**

**1. Check Vercel function logs:**
- Vercel Dashboard → Project → Deployments
- Click latest deployment → Functions tab
- Look for your API route → View logs

**2. Common causes:**
```typescript
// ❌ Missing await
const user = supabase.auth.getUser();  // Returns Promise!

// ✅ Correct
const { data: { user } } = await supabase.auth.getUser();

// ❌ Environment variable undefined
const apiKey = process.env.API_KEY;  // Undefined!

// ✅ Check first
if (!process.env.API_KEY) {
  throw new Error('API_KEY not set');
}
```

**3. Add error logging:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    console.error('API Error:', error);  // Will show in Vercel logs
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## TypeScript Errors

### Issue: "Cannot find module" for types

**Error:**
```
Cannot find module '@/types/supabase' or its corresponding type declarations
```

**Solution:**

**1. Generate Supabase types:**
```bash
# Windows PowerShell:
npx supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

**2. Verify tsconfig paths:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Issue: "Type 'X' is not assignable to type 'Y'"

**Solution:**

**1. Check actual types in Supabase:**
```typescript
// Check what Supabase returns:
const { data } = await supabase.from('table').select('*').single();
console.log('Type:', typeof data.field);

// Then match your interface
```

**2. Use type assertions carefully:**
```typescript
// ❌ Avoid unsafe casting
const data = response.data as MyType;  // Can break at runtime

// ✅ Better - validate first
if (response.data && 'requiredField' in response.data) {
  const data = response.data as MyType;
}
```

---

## Windows-Specific Issues

### Issue: Line ending issues (CRLF vs LF)

**Symptoms:**
- Git showing all files as modified
- Build warnings about line endings

**Solution:**

**1. Configure Git:**
```bash
git config core.autocrlf true
```

**2. In VS Code:**
- Bottom right corner → "CRLF" → Change to "LF"
- Or set in settings.json:
  ```json
  {
    "files.eol": "\n"
  }
  ```

---

### Issue: Path separator issues

**Error:**
```
Cannot find module at path: src\components\ui\button
```

**Solution:**
```typescript
// ✅ Always use forward slashes in imports
import { Button } from '@/components/ui/button';

// ❌ Never use backslashes
import { Button } from '@\components\ui\button';
```

---

## Getting More Help

### Create Debug Info

When asking for help, provide:

```bash
# 1. System info
node --version
npm --version

# 2. Build output
npm run build > build-log.txt 2>&1

# 3. Environment check (hide sensitive values!)
cat .env.local | Select-String -Pattern "^[A-Z]"

# 4. Package versions
cat package.json | Select-String -Pattern "next|react|supabase|inngest"

# 5. Git status
git status
```

### Contact Support

- 📧 Email: support@propelkit.dev
- 💬 Discord: [Join community](https://discord.gg/propelkit)
- 📖 Docs: [propelkit.dev/docs](https://propelkit.dev/docs)

### Before Asking:

1. ✅ Check this troubleshooting guide
2. ✅ Search GitHub Issues
3. ✅ Try local build (`npm run build`)
4. ✅ Check Vercel/Supabase logs
5. ✅ Verify environment variables

---

## Common Command Quick Reference

```bash
# Windows PowerShell

# Fresh install
rmdir /s /q node_modules
del package-lock.json
npm install

# Restart dev server
# Ctrl+C to stop
npm run dev

# Test build
npm run build

# Generate types
npx supabase gen types typescript --project-id xxx > src/types/supabase.ts

# Check for updates
npm outdated

# Update dependencies
npm update

# Clear Next.js cache
rmdir /s /q .next
npm run build
```

---

**Most issues are environment variables or build cache problems. Try a fresh install first!** 🔄