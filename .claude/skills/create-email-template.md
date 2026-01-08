# Email Template Skill

## Trigger
When user says: "Create email template for [purpose]" or "Generate email for [event]"

## What This Skill Does
Generates production-ready email templates using:
1. React Email components
2. Resend integration
3. Responsive HTML email design
4. PropelKit branding

---

## Template Structure

**File: `src/emails/[template-name].tsx`**

```typescript
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Img,
  Link,
} from '@react-email/components';
import { BRAND_CONFIG } from '@/config/brand';

interface [TemplateName]EmailProps {
  // Define your props
  name: string;
  // ... other props
}

export default function [TemplateName]Email({
  name,
  // ... other props
}: [TemplateName]EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>[Preview text shown in email client]</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={`${BRAND_CONFIG.app.url}/logo.png`}
              width="120"
              height="40"
              alt={BRAND_CONFIG.company.name}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              [Your heading here]
            </Heading>
            
            <Text style={styles.text}>
              Hi {name},
            </Text>
            
            <Text style={styles.text}>
              [Your message content]
            </Text>

            <Button style={styles.button} href="[action-url]">
              [Call to Action]
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {BRAND_CONFIG.company.name}. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              <Link href={`${BRAND_CONFIG.app.url}/unsubscribe`} style={styles.link}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href={`${BRAND_CONFIG.app.url}/privacy`} style={styles.link}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles object
const styles = {
  body: {
    backgroundColor: '#f4f4f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  header: {
    padding: '32px 40px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e4e4e7',
  },
  content: {
    padding: '40px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#18181b',
    margin: '0 0 24px 0',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#3f3f46',
    margin: '0 0 16px 0',
  },
  button: {
    backgroundColor: '#fbbf24',
    color: '#000000',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    display: 'inline-block',
    marginTop: '16px',
  },
  hr: {
    borderColor: '#e4e4e7',
    margin: '0',
  },
  footer: {
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '14px',
    color: '#71717a',
    margin: '0 0 8px 0',
  },
  link: {
    color: '#71717a',
    textDecoration: 'underline',
  },
};
```

---

## Email Sending Utility

**File: `src/lib/email.ts`**

```typescript
import { Resend } from 'resend';
import { BRAND_CONFIG } from '@/config/brand';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  from = BRAND_CONFIG.email.fromSupport,
  replyTo,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}
```

---

## Common Email Templates

### Welcome Email

```typescript
// src/emails/welcome.tsx
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Button, Hr, Img } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  licenseKey: string;
  planName: string;
}

export default function WelcomeEmail({ name, licenseKey, planName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to PropelKit! Your license is ready.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src="https://propelkit.dev/logo.png" width="120" height="40" alt="PropelKit" />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>🎉 Welcome to PropelKit!</Heading>
            
            <Text style={styles.text}>Hi {name},</Text>
            
            <Text style={styles.text}>
              Thank you for purchasing the <strong>{planName}</strong>! 
              You're now ready to ship your SaaS faster than ever.
            </Text>

            <Section style={styles.licenseBox}>
              <Text style={styles.licenseLabel}>Your License Key</Text>
              <Text style={styles.licenseKey}>{licenseKey}</Text>
            </Section>

            <Text style={styles.text}>
              Save this key somewhere safe. You'll need it to activate PropelKit.
            </Text>

            <Button style={styles.button} href="https://propelkit.dev/docs/getting-started">
              Get Started →
            </Button>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Reply to this email or check our docs.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: '#0a0a0a', fontFamily: 'Arial, sans-serif' },
  container: { backgroundColor: '#18181b', margin: '40px auto', maxWidth: '600px', borderRadius: '12px' },
  header: { padding: '32px', textAlign: 'center' as const, borderBottom: '1px solid #27272a' },
  content: { padding: '40px' },
  heading: { fontSize: '28px', color: '#fbbf24', margin: '0 0 24px' },
  text: { fontSize: '16px', lineHeight: '24px', color: '#a1a1aa', margin: '0 0 16px' },
  licenseBox: { backgroundColor: '#27272a', padding: '20px', borderRadius: '8px', textAlign: 'center' as const, margin: '24px 0' },
  licenseLabel: { fontSize: '12px', color: '#71717a', margin: '0 0 8px', textTransform: 'uppercase' as const },
  licenseKey: { fontSize: '24px', color: '#fbbf24', fontFamily: 'monospace', margin: '0', letterSpacing: '2px' },
  button: { backgroundColor: '#fbbf24', color: '#000', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
  hr: { borderColor: '#27272a', margin: '0' },
  footer: { padding: '24px', textAlign: 'center' as const },
  footerText: { fontSize: '14px', color: '#71717a', margin: '0' },
};
```

### Payment Confirmation

```typescript
// src/emails/payment-confirmation.tsx
interface PaymentConfirmationProps {
  name: string;
  planName: string;
  amount: number;
  invoiceNumber: string;
  invoiceUrl: string;
}

export default function PaymentConfirmationEmail({
  name,
  planName,
  amount,
  invoiceNumber,
  invoiceUrl,
}: PaymentConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment received - ₹{amount.toLocaleString('en-IN')}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.checkmark}>✓</Text>
            <Heading style={styles.heading}>Payment Successful</Heading>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.text}>Hi {name},</Text>
            
            <Text style={styles.text}>
              We've received your payment for <strong>{planName}</strong>.
            </Text>

            {/* Receipt */}
            <Section style={styles.receipt}>
              <table style={styles.table}>
                <tr>
                  <td style={styles.label}>Amount</td>
                  <td style={styles.value}>₹{amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Invoice</td>
                  <td style={styles.value}>{invoiceNumber}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Plan</td>
                  <td style={styles.value}>{planName}</td>
                </tr>
              </table>
            </Section>

            <Button style={styles.button} href={invoiceUrl}>
              Download Invoice
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Password Reset

```typescript
// src/emails/password-reset.tsx
interface PasswordResetProps {
  name: string;
  resetLink: string;
  expiresIn: string;
}

export default function PasswordResetEmail({ name, resetLink, expiresIn }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your PropelKit password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.content}>
            <Heading style={styles.heading}>Reset Your Password</Heading>
            
            <Text style={styles.text}>Hi {name},</Text>
            
            <Text style={styles.text}>
              We received a request to reset your password. Click the button below to create a new one.
            </Text>

            <Button style={styles.button} href={resetLink}>
              Reset Password
            </Button>

            <Text style={styles.smallText}>
              This link expires in {expiresIn}. If you didn't request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## Sending Emails with Inngest

**File: `src/lib/inngest/functions/email-sequences.ts`**

```typescript
import { inngest } from '../client';
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/welcome';
import OnboardingDay3Email from '@/emails/onboarding-day3';
import OnboardingDay7Email from '@/emails/onboarding-day7';

export const sendWelcomeSeries = inngest.createFunction(
  { id: 'send-welcome-series' },
  { event: 'user/signed-up' },
  async ({ event, step }) => {
    const { email, name, licenseKey, planName } = event.data;

    // Day 0: Welcome email
    await step.run('send-welcome-email', async () => {
      await sendEmail({
        to: email,
        subject: '🎉 Welcome to PropelKit!',
        react: WelcomeEmail({ name, licenseKey, planName }),
      });
    });

    // Wait 3 days
    await step.sleep('wait-3-days', '3d');

    // Day 3: Tips email
    await step.run('send-day3-email', async () => {
      await sendEmail({
        to: email,
        subject: '3 tips to ship faster with PropelKit',
        react: OnboardingDay3Email({ name }),
      });
    });

    // Wait 4 more days
    await step.sleep('wait-4-days', '4d');

    // Day 7: Check-in email
    await step.run('send-day7-email', async () => {
      await sendEmail({
        to: email,
        subject: 'How\'s your PropelKit setup going?',
        react: OnboardingDay7Email({ name }),
      });
    });

    return { success: true };
  }
);
```

---

## Usage Examples

**User**: "Create email template for invoice receipt"

**Claude generates**: Complete invoice receipt email with GST details, styled for PropelKit branding.

**User**: "Create welcome email sequence"

**Claude generates**: Welcome email + Inngest function for 3-email drip campaign.
