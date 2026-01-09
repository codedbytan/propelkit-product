# Payments Handler Skill (Razorpay Integration)

---
## 🎯 CRITICAL: Read Project Context First

**Before generating ANY code:**
1. ✅ Read `.claude/PROJECT_CONTEXT.md` for master rules
2. ✅ Check `src/config/brand.ts` for pricing and currency config
3. ✅ This project uses **Razorpay** (NOT Stripe)
4. ✅ All amounts in **paise** (₹100 = 10000 paise)

---

## Trigger
When user says: "Add payment integration" or "Create checkout for [product]" or "Add Razorpay"

## What This Skill Does
Generates complete Razorpay payment flow:
1. Order creation API endpoint
2. Frontend checkout component
3. Payment verification
4. Webhook handler
5. Invoice generation
6. Database updates

---

## 🇮🇳 India-Specific: Razorpay

This boilerplate uses **Razorpay**, India's leading payment gateway.

**Key Concepts:**
- Amounts in **paise** (₹299.99 = 29999 paise)
- Currency: **INR** only
- GST: 18% (split as CGST/SGST or IGST)
- Supports: Cards, UPI, Netbanking, Wallets

---

## Step 1: Order Creation API

**File: `src/app/api/checkout/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { brand } from '@/config/brand';
import Razorpay from 'razorpay';
import { z } from 'zod';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'agency']),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error },
        { status: 400 }
      );
    }

    const { plan, couponCode } = parsed.data;

    // Get plan price from brand config
    const planPrice = brand.pricing.plans[plan].priceInPaise;

    // Apply coupon if provided
    let finalAmount = planPrice;
    let discountAmount = 0;
    
    if (couponCode) {
      // Validate coupon
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (coupon && coupon.expires_at && new Date(coupon.expires_at) > new Date()) {
        discountAmount = coupon.type === 'percentage'
          ? Math.floor((planPrice * coupon.value) / 100)
          : coupon.value;
        finalAmount = planPrice - discountAmount;
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan: plan,
        coupon_code: couponCode || '',
      },
    });

    // Store order in database
    await supabase.from('orders').insert({
      id: order.id,
      user_id: user.id,
      amount: finalAmount,
      original_amount: planPrice,
      discount_amount: discountAmount,
      currency: 'INR',
      status: 'created',
      plan: plan,
      coupon_code: couponCode,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: finalAmount,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

---

## Step 2: Frontend Checkout Component

**File: `src/components/checkout/razorpay-checkout.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { brand } from '@/config/brand';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  plan: 'starter' | 'agency';
  onSuccess?: () => void;
}

export function RazorpayCheckout({ plan, onSuccess }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Create order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) throw new Error('Failed to create order');

      const { order_id, amount, currency, key } = await res.json();

      // Razorpay checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: brand.name,
        description: brand.pricing.plans[plan].name,
        image: '/logo.png', // Your logo
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            toast({
              title: 'Payment Successful!',
              description: `Welcome to ${brand.name} ${brand.pricing.plans[plan].name}`,
            });
            onSuccess?.();
          } else {
            throw new Error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#fed60b', // Your brand color
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        toast({
          title: 'Payment Failed',
          description: response.error.description,
          variant: 'destructive',
        });
      });

      razorpay.open();

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: 'Failed to initiate checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full">
      {loading ? 'Processing...' : `Purchase ${brand.pricing.plans[plan].name}`}
    </Button>
  );
}
```

---

## Step 3: Payment Verification API

**File: `src/app/api/verify-payment/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { brand } from '@/config/brand';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update order status
    const { data: order } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_id: razorpay_payment_id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', razorpay_order_id)
      .select()
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create license
    const licenseKey = generateLicenseKey();
    await supabase.from('licenses').insert({
      key: licenseKey,
      user_id: user.id,
      plan: order.plan,
      order_id: razorpay_order_id,
      status: 'active',
    });

    // Generate invoice (trigger background job)
    // await inngest.send({ ... })

    // Send email (trigger background job)
    // await inngest.send({ ... })

    return NextResponse.json({ 
      success: true,
      license_key: licenseKey,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

function generateLicenseKey(): string {
  return `${brand.name.toUpperCase().slice(0, 3)}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}
```

---

## Step 4: Webhook Handler

**File: `src/app/api/webhooks/razorpay/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = createServiceClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', payload.event)
      .single();

    if (existing) {
      return NextResponse.json({ received: true });
    }

    // Log event
    await supabase.from('webhook_events').insert({
      event_id: payload.event,
      event_type: payload.event,
      payload: payload,
    });

    // Handle different events
    switch (payload.event) {
      case 'payment.captured':
        // Payment successful
        break;
      case 'payment.failed':
        // Payment failed
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', payload.payload.payment.entity.order_id);
        break;
      default:
        console.log('Unhandled event:', payload.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

---

## Step 5: Load Razorpay Script

**Add to `src/app/layout.tsx`:**

```tsx
<Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="lazyOnload"
/>
```

---

## Testing

### Test Mode
Use test keys from Razorpay dashboard:
- `rzp_test_xxxxx` for Key ID
- Test card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV

### Production
Switch to live keys:
- `rzp_live_xxxxx` for Key ID
- Update webhook URL to production

---

## Security Checklist

- ✅ Server-side signature verification
- ✅ Webhook signature verification
- ✅ Amount validation on server
- ✅ Order duplication check
- ✅ User authentication
- ✅ No secrets in frontend code

---

## Usage Examples

**User:** "Add subscription payments"

**Claude generates:** Recurring payment flow with subscription creation and webhook handling.

**User:** "Add one-time purchase for premium plan"

**Claude generates:** Complete checkout flow for one-time payment with the specific plan pricing from `brand.pricing`.

---

## Important Reminders

1. **Amounts in Paise**: ₹100 = 10000 paise
2. **Currency**: Always INR
3. **Signature Verification**: Required for security
4. **Webhook Setup**: Configure in Razorpay dashboard
5. **Dynamic Pricing**: Use `brand.pricing` config

---

**Remember:** Payment code adapts to project pricing from `brand.ts`! 💳
