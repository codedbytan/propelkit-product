"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 💡 CUSTOMIZE: Change these to YOUR pricing plans
const plans = [
  {
    key: "starter_lifetime",
    name: "Starter",
    description: "Perfect for individuals and small projects.",
    price: 2999,
    originalPrice: 4999,
    features: [
      "Full platform access",
      "Email support",
      "Basic analytics",
      "1 team member",
      "50 GB storage",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    key: "pro_lifetime",
    name: "Professional",
    description: "For growing businesses and teams.",
    price: 5999,
    originalPrice: 9999,
    features: [
      "Everything in Starter",
      "Priority support",
      "Advanced analytics",
      "Up to 10 team members",
      "500 GB storage",
      "Custom branding",
    ],
    cta: "Go Pro",
    popular: true,
  },
];

// Helper to load Razorpay Script
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

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey);

    try {
      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Network error. Please check your internet connection.");
        return;
      }

      // 2. Create Order via API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in to continue.");
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Could not initialize payment.");
      }

      // 3. Open Razorpay Payment Window
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Acme SaaS", // 💡 CUSTOMIZE: Your product name
        description: "Lifetime Access",
        order_id: data.orderId,

        handler: async function (response: any) {
          toast.loading("Payment successful! Setting up your account...");

          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCreationId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planKey: planKey,
              }),
            });

            if (verifyRes.ok) {
              toast.dismiss();
              toast.success("Welcome aboard! Redirecting...");
              window.location.href = "/dashboard";
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
          color: "#FACC15", // 💡 CUSTOMIZE: Your brand color
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
      toast.error("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            🔥 Limited Time: 40% OFF
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient">transparent pricing</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay once, use forever. No hidden fees, no monthly subscriptions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative p-8 border flex flex-col ${plan.popular
                  ? "border-primary shadow-glow bg-primary/5 scale-105 z-10"
                  : "border-border bg-card hover:border-primary/50 transition-colors"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                    ₹{plan.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">One-time payment + GST</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={() => handlePurchase(plan.key)}
                disabled={loading === plan.key}
                variant={plan.popular ? "default" : "outline"}
                className={`w-full ${plan.popular ? "gradient-primary shadow-glow font-bold" : ""}`}
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
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Secure payments powered by Razorpay. 7-day money-back guarantee.
        </p>
      </div>
    </section>
  );
}