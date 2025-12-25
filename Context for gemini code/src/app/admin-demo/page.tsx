"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DownloadSection } from "@/components/dashboard/DownloadSection";
import { DemoInvoicesTable } from "@/components/demo/DemoInvoicesTable"; // 👈 Import our new demo table
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminDemo() {
    // Fake User for the Header
    const demoUser = {
        email: "demo@propelkit.com",
        user_metadata: { avatar_url: null }
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Header with Fake User */}
            <DashboardHeader user={demoUser} />

            <div className="bg-primary/10 border-b border-primary/20 p-2 text-center text-sm font-medium text-primary">
                👀 You are viewing a Live Demo. The data below is for display purposes only.
            </div>

            <main className="container max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Welcome Text */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                        <Badge variant="secondary" className="text-xs border-primary/20 bg-primary/10 text-primary">Demo Mode</Badge>
                    </div>
                    <p className="text-muted-foreground">Manage your license, download source code, and view invoices.</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Fake License Card */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your License</h2>
                        <Card className="relative overflow-hidden border-primary/50 bg-gradient-to-br from-card to-primary/5 shadow-2xl">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-primary uppercase tracking-wider">License Type</p>
                                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                            Agency Lifetime
                                            <Badge className="bg-primary text-primary-foreground hover:bg-primary shadow-none">Active</Badge>
                                        </CardTitle>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">License Key</p>
                                    <div className="font-mono text-sm bg-background/50 border border-border/50 p-2 rounded-md flex items-center justify-between">
                                        <span className="text-foreground">PK-AGENCY-2024-DEMO</span>
                                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Download Section (Intercepted) */}
                    <div className="space-y-4 relative group">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Source Code</h2>
                        {/* We use a div to intercept clicks */}
                        <div onClick={() => toast.success("This is just a demo! Buy the kit to get the real code. 🚀")} className="cursor-pointer">
                            <div className="pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                                <DownloadSection />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Demo Invoices */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment History</h2>
                    <DemoInvoicesTable />
                </div>
            </main>
        </div>
    );
}