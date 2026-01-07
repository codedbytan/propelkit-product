// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, UserCheck, Mail, Calendar, Shield,
    ArrowLeft, Eye, Ban, CheckCircle
} from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    email: string;
    created_at: string;
    is_super_admin: boolean;
    is_admin: boolean;
    full_name?: string;
    avatar_url?: string;
    license_count: number;
    total_spent: number;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAdminAndFetchUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search query
        if (searchQuery) {
            const filtered = users.filter(user =>
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.includes(searchQuery)
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    async function checkAdminAndFetchUsers() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/sign-in?redirect=/admin/users";
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_super_admin, is_admin")
                .eq("id", user.id)
                .single();

            if (!profile?.is_super_admin && !profile?.is_admin) {
                window.location.href = "/admin";
                return;
            }

            await fetchUsers();
        } catch (err) {
            console.error("Failed to check admin:", err);
            setLoading(false);
        }
    }

    async function fetchUsers() {
        try {
            // Fetch all profiles
            const { data: profiles } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (!profiles) {
                setLoading(false);
                return;
            }

            // For each user, get their license count and total spent
            const usersWithStats = await Promise.all(
                profiles.map(async (profile) => {
                    const { data: licenses } = await supabase
                        .from("licenses")
                        .select("amount")
                        .eq("user_id", profile.id);

                    const licenseCount = licenses?.length || 0;
                    const totalSpent = licenses?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0;

                    return {
                        id: profile.id,
                        email: profile.email,
                        created_at: profile.created_at,
                        is_super_admin: profile.is_super_admin || false,
                        is_admin: profile.is_admin || false,
                        full_name: profile.full_name,
                        avatar_url: profile.avatar_url,
                        license_count: licenseCount,
                        total_spent: totalSpent / 100, // Convert from paise
                    };
                })
            );

            setUsers(usersWithStats);
            setFilteredUsers(usersWithStats);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setLoading(false);
        }
    }

    async function handleImpersonate(userId: string, email: string) {
        if (!confirm(`Impersonate user ${email}? You'll be logged in as this user.`)) {
            return;
        }

        setImpersonating(userId);

        try {
            // Call API route to create impersonation session
            const response = await fetch("/api/admin/impersonate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error("Failed to impersonate user");
            }

            // Redirect to dashboard as impersonated user
            window.location.href = "/dashboard?impersonated=true";
        } catch (error) {
            console.error("Impersonation failed:", error);
            alert("Failed to impersonate user. Check console for details.");
            setImpersonating(null);
        }
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
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-sm text-muted-foreground">
                                View, search, and manage all platform users
                            </p>
                        </div>
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by email, name, or user ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Email All ({filteredUsers.length})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{users.length}</div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {users.filter(u => u.license_count > 0).length}
                            </div>
                            <p className="text-sm text-muted-foreground">Paying Customers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                ₹{users.reduce((sum, u) => sum + u.total_spent, 0).toLocaleString('en-IN')}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                ₹{users.length > 0
                                    ? Math.round(users.reduce((sum, u) => sum + u.total_spent, 0) / users.length)
                                    : 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Avg. Revenue/User</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Users ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Licenses</TableHead>
                                        <TableHead className="text-right">Total Spent</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-semibold text-sm">
                                                        {user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.email}</div>
                                                        {user.full_name && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {user.full_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.is_super_admin ? (
                                                    <Badge variant="destructive">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        Super Admin
                                                    </Badge>
                                                ) : user.is_admin ? (
                                                    <Badge variant="secondary">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        Admin
                                                    </Badge>
                                                ) : user.license_count > 0 ? (
                                                    <Badge variant="default">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Customer
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Free User</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline">
                                                    {user.license_count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{user.total_spent.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleImpersonate(user.id, user.email)}
                                                    disabled={impersonating === user.id}
                                                >
                                                    {impersonating === user.id ? (
                                                        <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Impersonate
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No users found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}