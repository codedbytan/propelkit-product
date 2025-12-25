"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    // ✅ Added About Us (Razorpay Trust Signal)
    { label: "About Us", href: "/about" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
    // ✅ Added Shipping Policy (Mandatory for Razorpay)
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="relative flex items-center justify-center w-8 h-8">
                <img
                  src="/placeholder.png"
                  alt="PropelKit Logo"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(6654%) hue-rotate(357deg) brightness(103%) contrast(104%)"
                  }}
                />
              </div>
              <span className="font-bold text-xl text-foreground">PropelKit</span>
            </Link>

            <p className="text-muted-foreground max-w-sm mb-4">
              The ultimate Next.js boilerplate for Indian SaaS. Ship faster with pre-built Razorpay, GST invoicing, and Supabase Auth.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ in India
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PropelKit. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Secure payments by Razorpay 🛡️
          </p>
        </div>
      </div>
    </footer>
  );
}