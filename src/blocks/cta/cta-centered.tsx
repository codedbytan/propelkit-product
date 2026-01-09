'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/config/brand';

interface CTACenteredProps {
  title?: string;
  description?: string;
  primaryCTA?: string;
  onPrimaryClick?: () => void;
}

export function CTACentered({
  title = `Ready to get started with ${brand.name}?`,
  description = 'Join thousands of developers building amazing products.',
  primaryCTA = 'Start Free Trial',
  onPrimaryClick,
}: CTACenteredProps) {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
          <Button size="lg" onClick={onPrimaryClick} className="group">
            {primaryCTA}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
