"use client";

import { Button } from "@/components/ui/button";
import { Star, Play, Sparkles } from "lucide-react";

const avatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
];

export function Hero() {
  return (
    // 👇 FIXED: Reduced padding to "pt-32" (128px) - The Sweet Spot
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">New: Razorpay + GST Integration</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up stagger-1">
            Ship your Indian SaaS
            <br />
            <span className="text-gradient">in 24 Hours.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up stagger-2">
            The only Next.js boilerplate with pre-built Razorpay, GST Invoicing, and Supabase Auth.
            Stop wasting weeks on setup — start shipping today.
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-up stagger-3">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`User ${i + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground font-medium">
                Trusted by <span className="text-foreground">500+</span> developers
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-4">
            <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 py-6 hover:opacity-90 transition-opacity">
              Get the Boilerplate
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Demo
            </Button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 md:mt-24 relative animate-fade-up stagger-5">
          <div className="relative max-w-5xl mx-auto">
            {/* Code Editor Mockup */}
            <div className="relative transform -rotate-2 hover-lift">
              <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                {/* Window Bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-4 text-sm text-muted-foreground">app/api/razorpay/route.ts</span>
                </div>
                {/* Code Content */}
                <div className="p-6 font-mono text-sm">
                  <pre className="text-muted-foreground">
                    <code>
                      <span className="text-primary">import</span> {`{ `}
                      <span className="text-green-500">RazorpayClient</span>
                      {` }`} <span className="text-primary">from</span>{" "}
                      <span className="text-yellow-500">"propelkit/razorpay"</span>;{"\n\n"}
                      <span className="text-primary">export async function</span>{" "}
                      <span className="text-blue-400">POST</span>(req: Request) {`{`}
                      {"\n"}
                      {"  "}<span className="text-primary">const</span> order ={" "}
                      <span className="text-primary">await</span> RazorpayClient.
                      <span className="text-green-500">createOrder</span>({`{`}
                      {"\n"}
                      {"    "}amount: <span className="text-yellow-500">9999</span>,{"\n"}
                      {"    "}currency: <span className="text-yellow-500">"INR"</span>,{"\n"}
                      {"    "}gstInvoice: <span className="text-primary">true</span>{"\n"}
                      {"  "}{`}`});{"\n"}
                      {"  "}<span className="text-primary">return</span>{" "}
                      Response.<span className="text-green-500">json</span>(order);{"\n"}
                      {`}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Razorpay Success Card - Floating */}
            <div className="absolute -bottom-8 -right-4 md:right-12 transform rotate-3 animate-float">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card w-64">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Payment Success!</p>
                    <p className="text-sm text-muted-foreground">Order #RZP123</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">₹3,999</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  GST Invoice Generated ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}