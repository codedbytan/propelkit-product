"use client";

import { brand } from "@/config/brand";
import { SearchBar } from "./search-bar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4 animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {brand.tagline}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover talented professionals or offer your services to thousands of customers
            </p>
          </div>

          {/* Search Bar */}
          <div className="animate-fade-up stagger-1">
            <SearchBar />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-2">
            <Button size="lg" asChild>
              <Link href="/listings">Browse Services</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/become-provider">Become a Provider</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 justify-center text-sm text-muted-foreground animate-fade-up stagger-3">
            <div>
              <span className="font-semibold text-foreground">1000+</span> Active Providers
            </div>
            <div>
              <span className="font-semibold text-foreground">5000+</span> Happy Customers
            </div>
            <div>
              <span className="font-semibold text-foreground">4.9/5</span> Average Rating
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
