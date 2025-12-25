import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });

// 👇 UPDATED: Professional SEO & Social Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://propelkit.com"), // Change this if your domain is different
  title: {
    default: "PropelKit - The Next.js SaaS Boilerplate for India",
    template: "%s | PropelKit",
  },
  description: "Ship your SaaS in days, not weeks. The only boilerplate with pre-built Razorpay, GST Invoicing, and Supabase Auth.",
  keywords: ["Next.js", "SaaS Boilerplate", "Razorpay", "GST Invoicing", "India SaaS", "Supabase"],
  authors: [{ name: "PropelKit Team" }],
  openGraph: {
    title: "PropelKit - The Next.js SaaS Boilerplate for India",
    description: "Ship your SaaS in days, not weeks. Includes Razorpay, GST Invoicing, and Supabase.",
    url: "https://propelkit.com",
    siteName: "PropelKit",
    images: [
      {
        url: "/og.png", // Make sure to add this image to your public folder!
        width: 1200,
        height: 630,
        alt: "PropelKit - Ship Fast",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropelKit - The Next.js SaaS Boilerplate for India",
    description: "Ship your SaaS in days, not weeks. Includes Razorpay, GST Invoicing, and Supabase.",
    images: ["/og.png"], // Same image works for Twitter
    creator: "@yourhandle", // Optional: Add your Twitter handle here
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Default to dark mode
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}