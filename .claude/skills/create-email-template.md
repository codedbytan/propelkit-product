# Create Email Template Skill

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Check `src/config/brand.ts` for email config
3. ✅ Use `brand.email.*` for sender info

---

## Trigger
"Create email template for [purpose]" or "Generate [type] email"

## What This Does
Generates React Email templates with:
- Responsive HTML design
- Dynamic branding from `brand.ts`
- Inline CSS (email-safe)
- Plain text fallback

---

## Template: Basic Email

**File: `src/emails/[name]-email.tsx`**

```tsx
import { brand } from '@/config/brand';

interface EmailProps {
  name: string;
}

export function WelcomeEmail({ name }: EmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#333' }}>
          Welcome to {brand.name}!
        </h1>
        <p>Hi {name},</p>
        <p>
          Thank you for joining {brand.name}. We're excited to have you!
        </p>
        <a
          href={brand.url}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#fed60b',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '6px',
            marginTop: '20px',
          }}
        >
          Get Started
        </a>
        <p style={{ marginTop: '40px', color: '#666', fontSize: '14px' }}>
          {brand.company}<br />
          {brand.email.fromEmail}
        </p>
      </div>
    </div>
  );
}
```

---

## Sending Email

```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome-email';
import { brand } from '@/config/brand';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: brand.email.fromSupport,
  to: user.email,
  subject: `Welcome to ${brand.name}`,
  react: WelcomeEmail({ name: user.name }),
});
```

---

## Common Email Types

1. **Welcome** - New user onboarding
2. **Receipt** - Payment confirmation
3. **Invoice** - With GST details
4. **Password Reset** - With magic link
5. **Notification** - Status updates

---

## Usage Example

**User:** "Create invoice receipt email"

**Claude generates:** Email template with order details, GST breakdown, and download link using `brand.*` config.
