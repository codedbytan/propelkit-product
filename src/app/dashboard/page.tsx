"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LicenseCard } from "@/components/dashboard/LicenseCard";
import { DownloadSection } from "@/components/dashboard/DownloadSection";
import { InvoicesTable } from "@/components/dashboard/InvoicesTable";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [hasLicense, setHasLicense] = useState(false);
    const [user, setUser] = useState<any>(null); // 👈 Added User State
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkLicense = async () => {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user); // 👈 Store the user

            // 2. Check for Active License
            const { data: license } = await supabase
                .from("licenses")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .maybeSingle();

            if (license) {
                setHasLicense(true);
            }

            setLoading(false);
        };

        checkLicense();
    }, [supabase, router]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* ✅ Pass user to the Header */}
            <DashboardHeader user={user} />

            <main className="container max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Welcome Text */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground">Manage your license, download source code, and view invoices.</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: License Card */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your License</h2>
                        <LicenseCard />
                    </div>

                    {/* Right: Download Section */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Source Code</h2>

                        {hasLicense ? (
                            <DownloadSection />
                        ) : (
                            <div className="h-full border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20">
                                <div className="p-3 bg-muted rounded-full">
                                    <Lock className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">Source Code Locked</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                        You need an active license to download the PropelKit source code.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.push("/#pricing")}
                                    className="gradient-primary shadow-glow"
                                >
                                    Get Access Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom: Invoices */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment History</h2>
                    <InvoicesTable />
                </div>
            </main>
        </div>
    );
}