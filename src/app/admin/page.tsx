// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DollarSign, Users, CreditCard, AlertCircle,
    TrendingUp, Activity, ArrowLeft, Search,
    UserCheck, Shield
} from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { brand } from "@/config/brand";  // ✅ FIXED

interface DashboardStats {
    totalRevenue: number;
    totalUsers: number;
    activeLicenses: number;
    failedPayments: number;
    revenueGrowth: number;
    userGrowth: number;
    revenueByDay: Array<{ date: string; revenue: number }>;
    usersByDay: Array<{ date: string; users: number }>;
}

export default function AdminDashboard() {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    async function checkAdminAccess() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/sign-in?redirect=/admin";
                return;
            }

            // Check if user is admin
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_super_admin, is_admin")
                .eq("id", user.id)
                .single();

            if (!profile?.is_super_admin && !profile?.is_admin) {
                setError("Access denied - Super admin privileges required");
                setLoading(false);
                return;
            }

            setAuthorized(true);
            await fetchDashboardStats();
        } catch (err) {
            console.error("Admin check failed:", err);
            setError("Failed to verify admin access");
            setLoading(false);
        }
    }

    async function fetchDashboardStats() {
        try {
            // Fetch all data in parallel
            const [
                { data: licenses },
                { data: users },
                { data: recentLicenses }
            ] = await Promise.all([
                supabase.from("licenses").select("amount, created_at, status"),
                supabase.from("profiles").select("id, created_at"),
                supabase
                    .from("licenses")
                    .select("amount, created_at")
                    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                    .order("created_at", { ascending: true })
            ]);

            // Calculate total revenue
            const totalRevenue = (licenses || []).reduce((sum, l) => sum + (l.amount || 0), 0) / 100;

            // Calculate growth (last 30 days vs previous 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

            const recentRevenue = (licenses || [])
                .filter(l => new Date(l.created_at) > thirtyDaysAgo)
                .reduce((sum, l) => sum + (l.amount || 0), 0) / 100;

            const previousRevenue = (licenses || [])
                .filter(l => {
                    const date = new Date(l.created_at);
                    return date > sixtyDaysAgo && date <= thirtyDaysAgo;
                })
                .reduce((sum, l) => sum + (l.amount || 0), 0) / 100;

            const revenueGrowth = previousRevenue > 0
                ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

            // User growth
            const recentUsers = (users || []).filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
            const previousUsers = (users || []).filter(u => {
                const date = new Date(u.created_at);
                return date > sixtyDaysAgo && date <= thirtyDaysAgo;
            }).length;

            const userGrowth = previousUsers > 0
                ? ((recentUsers - previousUsers) / previousUsers) * 100
                : 0;

            // Revenue by day (last 30 days)
            const revenueByDay = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                const dayRevenue = (recentLicenses || [])
                    .filter(l => l.created_at.startsWith(dateStr))
                    .reduce((sum, l) => sum + (l.amount || 0), 0) / 100;

                return {
                    date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                    revenue: dayRevenue
                };
            });

            // Users by day (last 30 days)
            const usersByDay = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                const dayUsers = (users || [])
                    .filter(u => u.created_at.startsWith(dateStr))
                    .length;

                return {
                    date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                    users: dayUsers
                };
            });

            setStats({
                totalRevenue,
                totalUsers: users?.length || 0,
                activeLicenses: (licenses || []).filter(l => l.status === 'active').length,
                failedPayments: 0,
                revenueGrowth,
                userGrowth,
                revenueByDay,
                usersByDay
            });

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            setError("Failed to load dashboard data");
            setLoading(false);
        }
    }

    if (!authorized && !loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-500 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <p className="text-sm text-muted-foreground">
                            You need super admin privileges to access this page.
                        </p>
                        <Button asChild className="w-full mt-4">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </CardContent>
                </Card>
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                {brand.product.name} Platform Management
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/admin/users">
                                <Button variant="outline" size="sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    Users
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Site
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{stats?.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className={stats && stats.revenueGrowth > 0 ? "text-green-500" : "text-red-500"}>
                                    {stats && stats.revenueGrowth > 0 ? "+" : ""}
                                    {stats?.revenueGrowth.toFixed(1)}%
                                </span>
                                {" "}from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className={stats && stats.userGrowth > 0 ? "text-green-500" : "text-red-500"}>
                                    {stats && stats.userGrowth > 0 ? "+" : ""}
                                    {stats?.userGrowth.toFixed(1)}%
                                </span>
                                {" "}from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeLicenses}</div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime purchases
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats ? ((stats.activeLicenses / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Users to customers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={stats?.revenueByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '6px'
                                        }}
                                        formatter={(value: number | undefined) =>
                                            value !== undefined ? `₹${value.toLocaleString('en-IN')}` : '₹0'
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#FACC15"
                                        strokeWidth={2}
                                        dot={{ fill: '#FACC15', r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Users Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">New Users (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats?.usersByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '6px'
                                        }}
                                        formatter={(value: number | undefined) =>
                                            value !== undefined ? value.toString() : '0'
                                        }
                                    />

                                    <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Link href="/admin/users">
                        <Card className="hover:border-yellow-500 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    User Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View all users, search, and impersonate for debugging
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/payments">
                        <Card className="hover:border-yellow-500 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View transactions, issue refunds, manual activations
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/audit">
                        <Card className="hover:border-yellow-500 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Audit Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Track all platform activities and user actions
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}