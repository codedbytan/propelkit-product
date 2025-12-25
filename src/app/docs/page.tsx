"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import DocsSidebar, { sections } from "@/components/docs/DocsSidebar";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";

export default function Docs() {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 40;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map((s) => ({
                id: s.id,
                element: document.getElementById(s.id),
            }));

            for (const section of sectionElements.reverse()) {
                if (section.element) {
                    const rect = section.element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Content Constants
    const sqlCode = `-- Users are handled by Supabase Auth

-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text
);

-- 2. Create Licenses Table
create table public.licenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  license_key text unique not null,
  plan_key text not null,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Invoices Table
create table public.invoices (
  id text primary key,
  user_id uuid references auth.users not null,
  amount integer not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);`;

    const envCode = `# ================================
# SUPABASE (Required)
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# RAZORPAY (Required for payments)
# ================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# ================================
# EMAIL (Resend)
# ================================
RESEND_API_KEY=re_...`;

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">

            <main className="container max-w-7xl mx-auto px-6 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Mobile Header / Sidebar Trigger */}
                    <div className="lg:hidden flex items-center justify-between mb-6 pb-6 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                                PK
                            </div>
                            <span className="font-bold tracking-tight">Docs</span>
                        </div>
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Menu className="h-4 w-4 mr-2" />
                                    Menu
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0 pt-10">
                                <div className="px-6 space-y-6">
                                    <Link
                                        href="/"
                                        className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Website</span>
                                    </Link>
                                    <div className="h-px bg-border/50" />
                                    <DocsSidebar activeSection={activeSection} onSectionClick={handleSectionClick} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Sidebar (Sticky) */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        {/* Added margin-top to align visually with the content below the 'Back' button */}
                        <div className="sticky top-12 space-y-8 mt-12">
                            <div className="pb-4 border-b border-border/50">
                                <h4 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-glow">
                                        PK
                                    </div>
                                    Documentation
                                </h4>
                            </div>
                            <DocsSidebar activeSection={activeSection} onSectionClick={handleSectionClick} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">

                        {/* ✅ Back Button: Placed exactly as in Terms of Service */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>

                        <div className="max-w-3xl space-y-16">

                            {/* Header */}
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                                    Documentation
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Everything you need to configure, deploy, and ship your SaaS in minutes.
                                </p>
                            </div>

                            {/* 1. Getting Started */}
                            <section id="getting-started" className="space-y-6 scroll-mt-20">
                                <div className="pb-2 border-b border-border/50">
                                    <h2 className="text-2xl font-bold text-foreground">Getting Started</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    Follow these steps to get PropelKit running on your local machine.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">1. Clone the repository</h3>
                                        <CodeBlock language="bash" code="git clone https://github.com/yourusername/propelkit.git" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">2. Install dependencies</h3>
                                        <CodeBlock language="bash" code="npm install" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">3. Run the dev server</h3>
                                        <CodeBlock language="bash" code="npm run dev" />
                                    </div>
                                </div>

                                <Callout type="tip" title="Pro Tip">
                                    Ensure you have Node.js 18+ installed. We recommend using <code className="bg-muted px-1 rounded">pnpm</code> for faster installs.
                                </Callout>
                            </section>

                            {/* 2. Configuration */}
                            <section id="configuration" className="space-y-6 scroll-mt-20">
                                <div className="pb-2 border-b border-border/50">
                                    <h2 className="text-2xl font-bold text-foreground">Configuration</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    Create a <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono">.env.local</code> file in your root directory.
                                </p>

                                <CodeBlock language="env" code={envCode} filename=".env.local" />

                                <Callout type="warning" title="Security Alert">
                                    Never commit your <code className="font-mono">.env.local</code> file. It contains secret keys that can compromise your app.
                                </Callout>
                            </section>

                            {/* 3. Database */}
                            <section id="database" className="space-y-6 scroll-mt-20">
                                <div className="pb-2 border-b border-border/50">
                                    <h2 className="text-2xl font-bold text-foreground">Database Setup</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    PropelKit uses Supabase. Run this SQL in your <strong>Supabase SQL Editor</strong> to create the required tables.
                                </p>

                                <CodeBlock language="sql" code={sqlCode} filename="schema.sql" />

                                <Callout type="info" title="Auth Tables">
                                    The <code className="font-mono">auth.users</code> table is managed automatically by Supabase Auth. You do not need to create it manually.
                                </Callout>
                            </section>

                            {/* 4. Going Live */}
                            <section id="razorpay" className="space-y-6 scroll-mt-20">
                                <div className="pb-2 border-b border-border/50">
                                    <h2 className="text-2xl font-bold text-foreground">Going Live</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    Ready to accept payments? Here is how to switch to Production Mode.
                                </p>

                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li>Log in to Razorpay and switch the toggle to <strong>Live Mode</strong>.</li>
                                    <li>Generate new <strong>API Keys</strong> in Settings.</li>
                                    <li>Update your Vercel Environment Variables with these new keys.</li>
                                    <li>
                                        <strong>Critical:</strong> Add a new Webhook in Razorpay Live Settings pointing to:
                                        <br />
                                        <code className="bg-muted px-2 py-1 rounded text-sm mt-2 inline-block">https://your-domain.com/api/webhooks/razorpay</code>
                                    </li>
                                </ul>

                                <Callout type="warning" title="Webhooks are Mandatory">
                                    If you forget to add the Live Webhook, users will be charged but won't receive their license keys!
                                </Callout>
                            </section>

                            {/* 5. Deployment */}
                            <section id="deployment" className="space-y-6 scroll-mt-20">
                                <div className="pb-2 border-b border-border/50">
                                    <h2 className="text-2xl font-bold text-foreground">Deployment</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    We recommend Vercel for the easiest deployment.
                                </p>
                                <CodeBlock language="bash" code="npx vercel" />
                            </section>

                            {/* Footer for Docs */}
                            <footer className="pt-12 mt-12 border-t border-border/50 text-sm text-muted-foreground flex justify-between">
                                <p>&copy; {new Date().getFullYear()} PropelKit</p>
                                <a href="mailto:support@propelkit.com" className="hover:text-primary transition-colors">Contact Support</a>
                            </footer>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}