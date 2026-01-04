"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const plans = [
  {
    key: "starter_monthly",
    name: "Starter",
    description: "Perfect for individuals and small projects.",
    price: 999,
    billingCycle: "/month",
    originalPrice: 1499,
    features: [
      "Full platform access",
      "Email support",
      "Basic analytics",
      "1 team member",
      "50 GB storage",
      "Cancel anytime",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    key: "pro_yearly",
    name: "Professional",
    description: "For growing businesses and teams.",
    price: 29999,
    billingCycle: "/year",
    originalPrice: 49999,
    yearlyEquivalent: "₹2,499/month when billed yearly",
    features: [
      "Everything in Starter",
      "Priority support",
      "Advanced analytics",
      "Up to 10 team members",
      "500 GB storage",
      "Custom branding",
      "2 months free",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
];

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey);

    try {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store intended plan in localStorage
        localStorage.setItem('pendingPurchase', planKey);
        toast.info("Please log in to continue");
        router.push('/login');
        return;
      }

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Network error. Please check your internet connection.");
        setLoading(null);
        return;
      }

      // 3. Create Subscription via API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not initialize payment.");
      }

      // 4. Open Razorpay Subscription Window
      const options = {
        key: data.key,
        subscription_id: data.subscriptionId, // For recurring subscriptions
        name: "Acme SaaS",
        description: planKey.includes('monthly') ? "Monthly Subscription" : "Yearly Subscription",

        handler: async function (response: any) {
          toast.loading("Payment successful! Setting up your subscription...");

          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCreationId: data.subscriptionId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                planKey: planKey,
              }),
            });

            if (verifyRes.ok) {
              toast.dismiss();
              toast.success("Welcome aboard! Redirecting...");
              setTimeout(() => {
                window.location.href = "/payment/success";
              }, 1000);
            } else {
              toast.dismiss();
              toast.error("Payment received, but verification failed. Please contact support.");
            }
          } catch (err) {
            toast.dismiss();
            toast.error("Network error. Please check your dashboard.");
            router.push("/dashboard");
          }
        },
        theme: {
          color: "#FACC15",
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            🎉 Launch Special: 40% OFF
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient">transparent pricing</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when ready. Cancel anytime, no questions asked.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative p-8 transition-all duration-300 hover:scale-105 ${plan.popular
                  ? "border-primary shadow-2xl shadow-primary/20"
                  : "border-border hover:border-primary/50"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white border-0 px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {plan.originalPrice && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ₹{plan.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-4xl font-bold">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-muted-foreground">{plan.billingCycle}</span>
                </div>
                {plan.yearlyEquivalent && (
                  <p className="text-sm text-primary mt-2">{plan.yearlyEquivalent}</p>
                )}
              </div>

              <Button
                onClick={() => handlePurchase(plan.key)}
                disabled={loading !== null}
                className={`w-full mb-6 h-12 text-base font-semibold transition-all ${plan.popular
                    ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white border-0"
                    : ""
                  }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {loading === plan.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include 14-day free trial • No credit card required to start
          </p>
          <p className="text-xs text-muted-foreground">
            Prices in INR (₹). GST additional as applicable.
          </p>
        </div>
      </div>
    </section>
  );
}