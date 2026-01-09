'use client';

import { LucideIcon, Zap, Shield, Code2, Palette, Database, Rocket } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Next.js 15 for optimal performance',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Row Level Security and auth built-in',
  },
  {
    icon: Code2,
    title: 'TypeScript First',
    description: 'Fully typed for better developer experience',
  },
  {
    icon: Palette,
    title: 'Beautiful UI',
    description: 'shadcn/ui components pre-installed',
  },
  {
    icon: Database,
    title: 'Supabase Powered',
    description: 'PostgreSQL database with realtime',
  },
  {
    icon: Rocket,
    title: 'Deploy Anywhere',
    description: 'Vercel, Railway, or any platform',
  },
];

export function FeaturesGrid({ features = defaultFeatures }: FeaturesGridProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground">
            All the features to build and scale your SaaS
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
