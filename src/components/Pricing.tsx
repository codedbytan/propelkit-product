"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";

// Define Plans
const PLANS = {
  monthly: {
    key: 'pro_monthly',
    name: 'Pro Monthly',
    price: '₹2,999',
    period: '/month',
    description: 'Perfect for early-stage startups',
    features: ['All Pro features', 'Unlimited projects', 'Priority support', 'Cancel anytime'],
    popular: false,
  },
  yearly: {
    key: 'pro_yearly',
    name: 'Pro Yearly',
    price: '₹29,999',
    period: '/year',
    description: 'Best value for serious agencies',
    features: ['All Pro features', 'Unlimited projects', 'Priority support', '2 months free'],
    popular: true,
  },
  lifetime: {
    key: 'pro_lifetime',
    name: 'Lifetime Deal',
    price: '₹5,999',
    period: 'one-time',
    description: 'Pay once, own it forever',
    features: ['All Pro features', 'Unlimited projects', 'Community access', 'Lifetime updates'],
    popular: false,
  }
};

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in to purchase.");
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Payment initialization failed");
      }

      const options = {
        key: data.key,
        name: "Acme SaaS",
        description: `Plan: ${planKey}`,
        // Handle BOTH Subscriptions and Orders
        subscription_id: data.subscriptionId,
        order_id: data.orderId,

        handler: function (response: any) {
          toast.success("Payment successful!");
          router.push("/dashboard");
        },
        theme: { color: "#FACC15" },
        modal: {
          ondismiss: () => setLoading(null)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">Limited Time Offer</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing.</h2>

          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center bg-secondary/50 p-1 rounded-full border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                Yearly <span className="text-xs text-green-600 ml-1 font-bold">-16%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard plan={PLANS[billingCycle]} loading={loading} onPurchase={handlePurchase} />
          <PricingCard plan={PLANS.lifetime} loading={loading} onPurchase={handlePurchase} />
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, loading, onPurchase }: any) {
  return (
    <Card className={`relative p-8 border flex flex-col ${plan.popular ? "border-primary shadow-lg" : "border-border"}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground text-sm">{plan.period}</span>
        </div>
      </div>
      <Button
        onClick={() => onPurchase(plan.key)}
        disabled={loading === plan.key}
        className="w-full mb-8"
        variant={plan.popular ? "default" : "outline"}
      >
        {loading === plan.key ? <Loader2 className="animate-spin" /> : "Get Started"}
      </Button>
      <ul className="space-y-4 flex-1">
        {plan.features.map((feature: string) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-green-500 shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}