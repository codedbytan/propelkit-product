import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const features = [
  "Advanced Analytics Dashboard",
  "Team Collaboration Tools",
  "API Access & Integrations",
  "Priority Support",
  "Custom Branding",
  "Export & Reporting",
];

const pricingPlans = [
  {
    name: "Starter",
    price: 999,
    features: ["Up to 5 projects", "Basic analytics", "Email support", "5 team members"],
  },
  {
    name: "Pro",
    price: 2499,
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "20 team members", "API access"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 9999,
    features: ["Everything in Pro", "Custom integrations", "Dedicated support", "Unlimited team members", "SLA guarantee"],
  },
];

export default function SaaSLanding() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up">
                {brand.tagline}
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-up stagger-1">
                The all-in-one platform to manage, analyze, and grow your business
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-2">
                <Button size="lg" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything you need to succeed
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <Card key={feature} className="p-6">
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`p-8 ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="text-sm font-medium text-primary mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to get started?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of teams already using {brand.name}
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">Start your free trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
