# Payments Handler Skill (Razorpay)

## Trigger
When user says: "Add payment for [product]" or "Integrate Razorpay" or "Create checkout flow"

## What This Skill Does
Generates complete Razorpay payment integration:
1. Order creation API
2. Payment verification
3. Webhook handler
4. Frontend checkout component
5. License/subscription activation

## PropelKit uses Razorpay (NOT Stripe!)

Razorpay is India's leading payment gateway. All amounts are in **paise** (₹100 = 10000 paise).

---

## Template: Create Order API

**File: `src/app/api/payments/create-order/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { BRAND_CONFIG } from '@/config/brand';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const createOrderSchema = z.object({
  planKey: z.enum(['starter', 'agency']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const { planKey } = parsed.data;
    const plan = BRAND_CONFIG.pricing.plans[planKey];
    
    // Check if user already has this license
    const { data: existingLicense } = await supabase
      .from('licenses')
      .select('id')
      .eq('user_id', user.id)
      .eq('plan_type', planKey)
      .eq('status', 'active')
      .single();

    if (existingLicense) {
      return NextResponse.json(
        { error: 'You already have an active license for this plan' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.priceInPaise,
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        plan_key: planKey,
        plan_name: plan.name,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

---

## Template: Verify Payment API

**File: `src/app/api/payments/verify/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';
import { z } from 'zod';
import { inngest } from '@/lib/inngest/client';

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planKey: z.enum(['starter', 'agency']),
});

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-'); // e.g., "ABCD-1234-EFGH-5678"
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planKey } = parsed.data;

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Use service client for creating license (bypasses RLS)
    const adminSupabase = createServiceClient();

    // Generate license key
    const licenseKey = generateLicenseKey();

    // Create license record
    const { data: license, error: licenseError } = await adminSupabase
      .from('licenses')
      .insert({
        user_id: user.id,
        license_key: licenseKey,
        plan_type: planKey,
        status: 'active',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
      })
      .select()
      .single();

    if (licenseError) {
      console.error('License creation error:', licenseError);
      return NextResponse.json(
        { error: 'Failed to create license' },
        { status: 500 }
      );
    }

    // Trigger post-purchase events via Inngest
    await inngest.send({
      name: 'payment/completed',
      data: {
        userId: user.id,
        email: user.email,
        licenseKey,
        planKey,
        paymentId: razorpay_payment_id,
      },
    });

    return NextResponse.json({
      success: true,
      licenseKey,
      message: 'Payment verified and license activated!',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
```

---

## Template: Razorpay Webhook Handler

**File: `src/app/api/webhooks/razorpay/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';
import { inngest } from '@/lib/inngest/client';

export const dynamic = 'force-dynamic';

function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    const supabase = createServiceClient();

    // Check for duplicate webhook
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', payload.event_id || paymentEntity?.id)
      .single();

    if (existingEvent) {
      console.log('Duplicate webhook, skipping');
      return NextResponse.json({ received: true });
    }

    // Log webhook event
    await supabase.from('webhook_events').insert({
      event_id: payload.event_id || paymentEntity?.id,
      event_type: event,
      payload: payload,
    });

    // Handle different events
    switch (event) {
      case 'payment.captured':
        console.log('Payment captured:', paymentEntity?.id);
        // Payment already handled in verify endpoint
        // This is for backup/reconciliation
        break;

      case 'payment.failed':
        console.log('Payment failed:', paymentEntity?.id);
        // Trigger failed payment notification
        await inngest.send({
          name: 'payment/failed',
          data: {
            paymentId: paymentEntity?.id,
            email: paymentEntity?.email,
            error: paymentEntity?.error_description,
          },
        });
        break;

      case 'refund.created':
        const refundEntity = payload.payload?.refund?.entity;
        console.log('Refund created:', refundEntity?.id);
        
        // Update license status
        await supabase
          .from('licenses')
          .update({ status: 'refunded' })
          .eq('razorpay_payment_id', refundEntity?.payment_id);
        break;

      case 'subscription.charged':
        // Handle recurring payment
        const subscriptionEntity = payload.payload?.subscription?.entity;
        console.log('Subscription charged:', subscriptionEntity?.id);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

---

## Template: Checkout Component

**File: `src/components/payments/checkout-button.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  planKey: 'starter' | 'agency';
  planName: string;
  price: number;
  children?: React.ReactNode;
}

export function CheckoutButton({ 
  planKey, 
  planName, 
  price, 
  children 
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // 2. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'PropelKit',
        description: planName,
        order_id: orderId,
        handler: async (response: any) => {
          // 3. Verify payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planKey,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            const { licenseKey } = await verifyRes.json();

            toast({
              title: '🎉 Payment Successful!',
              description: `Your license key: ${licenseKey}`,
            });

            router.push('/dashboard?payment=success');
            router.refresh();
          } catch (error) {
            toast({
              title: 'Verification Failed',
              description: 'Please contact support if charged.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          email: '', // Can be prefilled from user data
        },
        theme: {
          color: '#fbbf24', // PropelKit yellow
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Buy ${planName} - ₹${price.toLocaleString('en-IN')}`
      )}
    </Button>
  );
}
```

---

## Template: Razorpay Script Loader

**File: `src/components/payments/razorpay-provider.tsx`**

```typescript
'use client';

import Script from 'next/script';

export function RazorpayProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}
```

Add to your layout:
```typescript
// src/app/layout.tsx
import { RazorpayProvider } from '@/components/payments/razorpay-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RazorpayProvider>
          {children}
        </RazorpayProvider>
      </body>
    </html>
  );
}
```

---

## Subscription Payments (Recurring)

**File: `src/app/api/subscriptions/create/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Pre-created plans in Razorpay dashboard
const PLAN_IDS = {
  pro_monthly: 'plan_xxxxxxxxxxxxx',
  pro_yearly: 'plan_yyyyyyyyyyyyy',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planKey } = await request.json();
    const planId = PLAN_IDS[planKey as keyof typeof PLAN_IDS];

    if (!planId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles (or 0 for infinite)
      notes: {
        user_id: user.id,
        user_email: user.email,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Usage Examples

**User**: "Add payment for starter plan"
**Claude generates**: Complete checkout flow with order creation, verification, and license activation.

**User**: "Add subscription payments"
**Claude generates**: Recurring payment flow with subscription creation and webhook handling.
