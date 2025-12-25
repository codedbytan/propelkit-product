"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { PainCalculator } from "@/components/PainCalculator";
import { FAQ } from "@/components/FAQ";
import { FounderStory } from "@/components/FounderStory";
import { Footer } from "@/components/Footer";
import Script from "next/script";

export default function Home() {
  return (
    // 👇 CHANGED: Removed "bg-white text-slate-900"
    // Now it uses "min-h-screen" only, allowing globals.css to control the colors
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Navbar />
      <Hero />
      <PainCalculator />
      <Features />
      <Testimonials />
      <Pricing />
      <FounderStory />
      <FAQ />
      <Footer />
    </div>
  );
}