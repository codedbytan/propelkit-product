// src/app/admin/audit/page.tsx
// FIXED VERSION - No profiles join (handles RLS better)

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Activity, Calendar,
    ArrowLeft, Filter, Download
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AuditLog {
    id: string;
    user_id: string;
    user_email: string;
    action: string;
    details: any;
    created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    'user_signup': { label: 'User Signup', color: 'bg-green-500' },
    'user_login': { label: 'User Login', color: 'bg-blue-500' },
    'license_purchased': { label: 'License Purchased', color: 'bg-yellow-500' },
    'admin_impersonate_user': { label: 'Admin Impersonation', color: 'bg-red-500' },
    'payment_refund': { label: 'Payment Refund', color: 'bg-orange-500' },
    'organization_created': { label: 'Organization Created', color: 'bg-purple-500' },
    'member_invited': { label: 'Member Invited', color: 'bg-cyan-500' },
    'test_action': { label: 'Test Action', color: 'bg-gray-500' },
    'admin_dashboard_accessed': { label: 'Dashboard Access', color: 'bg-blue-500' },
};

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAdminAndFetchLogs();
    }, []);

    useEffect(() => {
        let filtered = logs;

        // Filter by action type
        if (filterAction !== "all") {
            filtered = filtered.filter(log => log.action === filterAction);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredLogs(filtered);
    }, [searchQuery, filterAction, logs]);

    async function checkAdminAndFetchLogs() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/sign-in?redirect=/admin/audit";
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

            await fetchLogs();
        } catch (err) {
            console.error("Failed to check admin:", err);
            setError("Failed to verify admin access");
            setLoading(false);
        }
    }

    async function fetchLogs() {
        try {
            // ✅ Fetch audit logs WITHOUT the profiles join
            const { data: auditLogs, error: fetchError } = await supabase
                .from("audit_logs")
                .select("id, user_id, action, details, created_at")
                .order("created_at", { ascending: false })
                .limit(500);

            if (fetchError) {
                console.error("Fetch error:", fetchError);
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            if (!auditLogs || auditLogs.length === 0) {
                setLogs([]);
                setFilteredLogs([]);
                setLoading(false);
                return;
            }

            // ✅ Fetch user emails separately (batch query)
            const userIds = [...new Set(auditLogs.map(log => log.user_id))];
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, email")
                .in("id", userIds);

            // Create a map of user_id to email
            const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

            // Combine data
            const logsData: AuditLog[] = auditLogs.map(log => ({
                id: log.id,
                user_id: log.user_id,
                user_email: emailMap.get(log.user_id) || "Unknown User",
                action: log.action,
                details: log.details,
                created_at: log.created_at,
            }));

            setLogs(logsData);
            setFilteredLogs(logsData);
            setLoading(false);
        } catch (error: any) {
            console.error("Failed to fetch logs:", error);
            setError(error.message || "Failed to load audit logs");
            setLoading(false);
        }
    }

    async function exportLogs() {
        try {
            const csvContent = [
                ['Date', 'User', 'Action', 'Details'].join(','),
                ...filteredLogs.map(log =>
                    [
                        new Date(log.created_at).toISOString(),
                        log.user_email,
                        log.action,
                        JSON.stringify(log.details).replace(/,/g, ';')
                    ].join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export logs");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error Loading Audit Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Audit Logs</h1>
                            <p className="text-sm text-muted-foreground">
                                Track all platform activities and user actions
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
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs by user, action, or details..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Select value={filterAction} onValueChange={setFilterAction}>
                                    <SelectTrigger className="w-[200px]">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Filter by action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        {uniqueActions.map(action => (
                                            <SelectItem key={action} value={action}>
                                                {ACTION_LABELS[action]?.label || action}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={exportLogs}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{logs.length}</div>
                            <p className="text-sm text-muted-foreground">Total Events</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {logs.filter(l => l.created_at > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).length}
                            </div>
                            <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {new Set(logs.map(l => l.user_id)).size}
                            </div>
                            <p className="text-sm text-muted-foreground">Unique Users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {uniqueActions.length}
                            </div>
                            <p className="text-sm text-muted-foreground">Action Types</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Activity Log ({filteredLogs.length} events)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => {
                                        const actionInfo = ACTION_LABELS[log.action];
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        {new Date(log.created_at).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-semibold text-xs">
                                                            {log.user_email[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="text-sm">
                                                            {log.user_email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={actionInfo ? `${actionInfo.color} text-white` : ''}
                                                    >
                                                        {actionInfo?.label || log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <pre className="text-xs text-muted-foreground max-w-md overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredLogs.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No audit logs found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}