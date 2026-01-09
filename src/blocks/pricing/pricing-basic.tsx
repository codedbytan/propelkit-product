'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  cta: string;
}

interface PricingBasicProps {
  tiers?: PricingTier[];
  onSelectPlan?: (tier: PricingTier, billing: 'monthly' | 'yearly') => void;
}

const defaultTiers: PricingTier[] = [
  {
    name: 'Starter',
    description: 'Perfect for side projects',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    features: [
      'Up to 5 projects',
      'Basic support',
      'Email notifications',
      'Dashboard access',
    ],
    notIncluded: ['Priority support', 'Custom domain'],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    description: 'For growing businesses',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    features: [
      'Unlimited projects',
      'Priority support',
      'Email notifications',
      'Dashboard access',
      'Custom domain',
      'Advanced analytics',
    ],
    popular: true,
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 29999,
    yearlyPrice: 299990,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
      'Team training',
    ],
    cta: 'Contact Sales',
  },
];

export function PricingBasic({
  tiers = defaultTiers,
  onSelectPlan
}: PricingBasicProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: brand.pricing.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your needs. Always know what you'll pay.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-6 py-2 rounded-md text-sm font-medium transition-colors',
                billing === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                billing === 'yearly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <Badge variant="secondary" className="text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                'relative flex flex-col',
                tier.popular && 'border-primary shadow-lg scale-105'
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(billing === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice)}
                  </span>
                  <span className="text-muted-foreground">
                    /{billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded?.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                      <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => onSelectPlan?.(tier, billing)}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include 14-day money-back guarantee</p>
        </div>
      </div>
    </section>
  );
}

PricingBasic.displayName = 'PricingBasic';
PricingBasic.category = 'pricing';
PricingBasic.tags = ['pricing', 'plans', 'billing'];
