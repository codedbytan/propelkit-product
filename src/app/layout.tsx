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
  metadataBase: new URL("https://yourdomain.com"), // Change this if your domain is different
  title: {
    default: "Acme SaaS - The Next.js SaaS Boilerplate for India",
    template: "%s | Acme SaaS",
  },
  description: "Ship your SaaS in days, not weeks. Modern SaaS boilerplate, GST Invoicing, and Supabase Auth.",
  keywords: ["Next.js", "SaaS Boilerplate", "Razorpay", "GST Invoicing", "India SaaS", "Supabase"],
  authors: [{ name: "Acme SaaS Team" }],
  openGraph: {
    title: "Acme SaaS - The Next.js SaaS Boilerplate for India",
    description: "Ship your SaaS in days, not weeks. Includes Razorpay, GST Invoicing, and Supabase.",
    url: "https://yourdomain.com",
    siteName: "Acme SaaS",
    images: [
      {
        url: "/og.png", // Make sure to add this image to your public folder!
        width: 1200,
        height: 630,
        alt: "Acme SaaS - Ship Fast",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acme SaaS - The Next.js SaaS Boilerplate for India",
    description: "Ship your SaaS in days, not weeks. Includes Razorpay, GST Invoicing, and Supabase.",
    images: ["/og.png"], // Same image works for Twitter
    creator: "@yourhandle", // Optional: Add your Twitter handle here
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 🔥 DEBUG: Log which env vars are missing
  if (typeof window === 'undefined') {
    console.log('🔍 Environment Check:');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
    console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
    console.log('Razorpay Key:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅' : '❌');
  }

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
