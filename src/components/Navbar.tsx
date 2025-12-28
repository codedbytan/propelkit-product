"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { UserNav } from "@/components/UserNav";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // 1. Handle Scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);

    // 2. Check Auth State
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // 3. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className="fixed left-0 right-0 z-50 flex justify-center top-4 transition-all duration-300 ease-in-out">
      <div
        className={`flex items-center justify-between transition-all duration-300 ease-in-out border rounded-full shadow-lg ${isScrolled
            ? "w-[95%] max-w-4xl bg-background/80 backdrop-blur-md border-border/50 py-2 px-6"
            : "w-[95%] max-w-6xl bg-background/40 backdrop-blur-sm border-border/30 py-3 px-6"
          }`}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8">
            <img
              src="/placeholder.png"
              alt="Acme SaaS Logo"
              className="w-full h-full object-contain brightness-0 invert sepia saturate-[5000%] hue-rotate-[5deg] group-hover:scale-110 transition-transform duration-300"
              style={{
                filter: "brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(6654%) hue-rotate(357deg) brightness(103%) contrast(104%)",
              }}
            />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">Acme SaaS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            // ✅ FIX: Pass the 'user' prop to UserNav
            <UserNav user={user} />
          ) : (
            // ❌ IF LOGGED OUT: Show Login + CTA
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button
                  size={isScrolled ? "sm" : "default"}
                  className="gradient-primary shadow-glow hover:opacity-90 transition-all rounded-full"
                >
                  Get Acme SaaS
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full mt-2 w-[95%] bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-2 md:hidden animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors text-center"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-border/50 my-2" />

          {user ? (
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full gradient-primary rounded-xl">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full rounded-xl">
                  Login
                </Button>
              </Link>
              <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full gradient-primary rounded-xl">Get Acme SaaS</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
