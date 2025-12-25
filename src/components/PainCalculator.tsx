"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Zap, CheckCircle, XCircle, Sparkles, IndianRupee } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// 🇮🇳 INDIAN CONTEXT: Focus on GST and Razorpay which are huge pain points here
const tasks = [
  { name: "Auth & Database Schema", hours: 8 },
  { name: "Razorpay & Webhooks", hours: 12 }, // Increased because Razorpay webhooks are tricky
  { name: "GST Invoices & PDF Gen", hours: 10 }, // GST logic takes time
  { name: "Email System (Resend)", hours: 4 },
  { name: "Responsive Dashboard", hours: 6 },
];

// Price in INR (Matches your ₹4,999 pricing)
const PROPELKIT_PRICE = 4999;
const TOTAL_HOURS = tasks.reduce((acc, task) => acc + task.hours, 0);

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const duration = 800; // Slightly slower for dramatic effect
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  // 🇮🇳 FORMAT: Indian Rupee formatting (e.g., 1,50,000)
  return (
    <span className={className}>
      {new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(displayValue)}
    </span>
  );
}

export function PainCalculator() {
  // 🇮🇳 DEFAULT: ₹1,500/hr is a reasonable mid-level freelance rate in India
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const traditionalCost = TOTAL_HOURS * hourlyRate;
  const savings = traditionalCost - PROPELKIT_PRICE;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Opportunity Cost Calculator</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            The Cost of <span className="text-gradient">"I'll Build It Myself"</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't waste weeks reinventing the wheel. Your time is worth more than debugging Razorpay webhooks.
          </p>
        </div>

        <div
          ref={ref}
          className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8"
        >
          {/* Left Column - Input & Breakdown */}
          <div className="space-y-6">
            {/* Slider Input */}
            <div className="glass-card-gold rounded-2xl p-6 md:p-8">
              <label className="block text-sm font-medium text-muted-foreground mb-4">
                Your Hourly Rate (Estimate)
              </label>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-foreground flex items-center">
                  ₹{hourlyRate.toLocaleString('en-IN')}
                </span>
                <span className="text-muted-foreground">/hour</span>
              </div>

              {/* 🇮🇳 SLIDER: Range adapted for Indian Freelancers (₹500 - ₹10,000) */}
              <Slider
                value={[hourlyRate]}
                onValueChange={(value) => setHourlyRate(value[0])}
                min={500}
                max={10000}
                step={100}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>₹500</span>
                <span>₹10,000+</span>
              </div>
            </div>

            {/* Traditional Way Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border-destructive/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Building from Scratch</h3>
                  <p className="text-sm text-muted-foreground">~{TOTAL_HOURS} hours of boilerplate work</p>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.map((task, i) => (
                  <div
                    key={task.name}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `all 0.5s ease-out ${i * 100}ms`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4 text-destructive/60 shrink-0" />
                      <span className="text-sm text-muted-foreground">{task.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{task.hours}h</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-destructive/20">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Development Cost</span>
                  <AnimatedNumber
                    value={traditionalCost}
                    className="text-3xl font-bold text-destructive"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - PropelKit & Savings */}
          <div className="space-y-6">
            {/* PropelKit Way Card */}
            <div className="glass-card-gold rounded-2xl p-6 md:p-8 border-2 border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-bl-xl">
                PropelKit Way
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Using PropelKit</h3>
                  <p className="text-sm text-muted-foreground">Production ready in 5 minutes</p>
                </div>
              </div>

              <div className="space-y-3">
                {['Razorpay & GST Pre-configured', 'Supabase Auth Ready', 'Email Workflows Setup', 'Admin Dashboard Included', 'Lifetime Updates'].map((feature, i) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 py-2"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                      transition: `all 0.5s ease-out ${i * 100 + 200}ms`
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fixed Price</span>
                  <span className="text-3xl font-bold text-primary">₹{PROPELKIT_PRICE.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Big Savings Card */}
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden bg-card"
              style={{
                border: '1px solid hsl(var(--primary) / 0.3)'
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)'
                }}
              />

              <div className="relative z-10">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Net Savings
                </p>
                <div
                  className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                  style={{
                    color: 'hsl(var(--primary))',
                    textShadow: '0 0 30px hsl(var(--primary) / 0.3)'
                  }}
                >
                  <AnimatedNumber value={Math.max(0, savings)} />
                </div>

                <Button
                  onClick={scrollToPricing}
                  size="lg"
                  className="gradient-primary text-primary-foreground font-semibold px-8 py-6 text-lg shadow-glow hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Stop Coding, Start Selling
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                  *Based on {TOTAL_HOURS} hours of dev time vs. one-time license.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}