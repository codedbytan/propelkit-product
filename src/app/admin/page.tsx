"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Users,
    Activity,
    XCircle,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
    totalRevenue: number;
    totalUsers: number;
    activeLicenses: number;
    failedPayments: number;
    recentPayments: any[];
    systemHealth: {
        supabase: string;
        razorpay: string;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            console.log("🔍 Checking authentication...");

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            console.log("User:", user?.email);

            if (authError) {
                console.error("Auth error:", authError);
                setError("Authentication error: " + authError.message);
                router.push("/login");
                return;
            }

            if (!user) {
                console.log("❌ No user found, redirecting to login");
                setError("Not logged in");
                router.push("/login");
                return;
            }

            console.log("✅ User authenticated:", user.email);
            console.log("User ID:", user.id);

            // Check profile with detailed logging
            console.log("🔍 Checking profile...");
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id, email, is_super_admin, is_admin, full_name")
                .eq("id", user.id)
                .single();

            console.log("Profile query error:", profileError);
            console.log("Profile data:", profile);

            if (profileError) {
                console.error("❌ Profile error:", profileError);
                setError(`Profile not found: ${profileError.message}`);
                setDebugInfo({
                    userId: user.id,
                    email: user.email,
                    profileError: profileError.message,
                    hint: "Profile might not exist. Run quick_fix_admin.sql"
                });
                setLoading(false);
                return;
            }

            if (!profile) {
                console.error("❌ Profile not found");
                setError("Profile not found in database");
                setDebugInfo({
                    userId: user.id,
                    email: user.email,
                    hint: "Profile doesn't exist. Run quick_fix_admin.sql"
                });
                setLoading(false);
                return;
            }

            console.log("Profile found:", {
                email: profile.email,
                is_super_admin: profile.is_super_admin,
                is_admin: profile.is_admin
            });

            // Check admin status
            if (!profile.is_super_admin && !profile.is_admin) {
                console.error("❌ User is not an admin");
                setError("Access denied - Admin privileges required");
                setDebugInfo({
                    email: profile.email,
                    is_super_admin: profile.is_super_admin,
                    is_admin: profile.is_admin,
                    hint: "Run: UPDATE profiles SET is_super_admin = TRUE WHERE email = '" + user.email + "';"
                });
                setLoading(false);
                // Don't redirect immediately - show debug info
                return;
            }

            console.log("✅ Admin access granted!");
            fetchStats();

        } catch (error: any) {
            console.error("Unexpected error:", error);
            setError("Unexpected error: " + error.message);
            setDebugInfo({ error: error.message });
            setLoading(false);
        }
    }

    async function fetchStats() {
        try {
            console.log("📊 Fetching stats...");

            // Fetch revenue
            const { data: invoices, error: invoicesError } = await supabase
                .from("invoices")
                .select("amount")
                .eq("status", "paid");

            if (invoicesError) {
                console.error("Invoices error:", invoicesError);
            }

            const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

            // Fetch users count
            const { count: totalUsers, error: usersError } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            if (usersError) {
                console.error("Users count error:", usersError);
            }

            // Fetch licenses
            const { count: activeLicenses, error: licensesError } = await supabase
                .from("licenses")
                .select("*", { count: "exact", head: true })
                .eq("status", "active");

            if (licensesError) {
                console.error("Licenses error:", licensesError);
            }

            // Fetch recent payments
            const { data: recentPayments, error: paymentsError } = await supabase
                .from("invoices")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (paymentsError) {
                console.error("Recent payments error:", paymentsError);
            }

            console.log("✅ Stats fetched successfully");

            setStats({
                totalRevenue: totalRevenue / 100,
                totalUsers: totalUsers || 0,
                activeLicenses: activeLicenses || 0,
                failedPayments: 0,
                recentPayments: recentPayments || [],
                systemHealth: {
                    supabase: "healthy",
                    razorpay: "healthy",
                },
            });

            setLoading(false);

        } catch (error: any) {
            console.error("Failed to fetch stats:", error);
            setError("Failed to load dashboard data");
            setLoading(false);
        }
    }

    // Show error state with debug info
    if (error && debugInfo) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                Admin Access Denied
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                                <p className="font-semibold text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>

                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Debug Information:</h3>
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                                    🔧 How to Fix:
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    <li>Open Supabase Dashboard → SQL Editor</li>
                                    <li>Run the <code className="bg-muted px-2 py-1 rounded">quick_fix_admin.sql</code> script</li>
                                    <li>Refresh this page</li>
                                </ol>

                                <div className="mt-4 p-3 bg-white dark:bg-black rounded border">
                                    <p className="text-xs font-mono">
                                        {debugInfo.hint || "UPDATE profiles SET is_super_admin = TRUE WHERE id = 'your-user-id';"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    href="/"
                                    className="px-4 py-2 border rounded hover:bg-muted"
                                >
                                    ← Back to Home
                                </Link>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                >
                                    🔄 Retry
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                        <p className="text-muted-foreground">Real-time metrics and system health</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-yellow-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Site
                    </Link>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{stats?.totalRevenue.toLocaleString('en-IN') || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalUsers || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Licenses
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.activeLicenses || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                System Health
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                                ✓ Healthy
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                            <div className="space-y-2">
                                {stats.recentPayments.map((payment: any) => (
                                    <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{payment.id}</span>
                                        <span className="font-semibold">₹{(payment.amount / 100).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No recent payments</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}