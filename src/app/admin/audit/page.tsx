// src/app/admin/audit/page.tsx
// SIMPLIFIED VERSION - Use this to test if basic query works

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuditLogsSimplified() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Starting audit logs fetch...');

            // Step 1: Check if user is admin
            const { data: { user } } = await supabase.auth.getUser();
            console.log('👤 Current user:', user?.email);

            if (!user) {
                throw new Error('Not authenticated');
            }

            // Step 2: Check admin status
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_super_admin, is_admin, email")
                .eq("id", user.id)
                .single();

            console.log('👮 Admin status:', profile);

            // Step 3: Try to fetch audit logs
            const { data: auditLogs, error: fetchError } = await supabase
                .from("audit_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            console.log('📊 Fetch result:', {
                success: !fetchError,
                count: auditLogs?.length || 0,
                error: fetchError
            });

            if (fetchError) {
                throw fetchError;
            }

            setLogs(auditLogs || []);
            setDebugInfo({
                userEmail: user.email,
                isAdmin: profile?.is_admin,
                isSuperAdmin: profile?.is_super_admin,
                logCount: auditLogs?.length || 0,
                timestamp: new Date().toISOString()
            });

            setLoading(false);
        } catch (err: any) {
            console.error('❌ Error fetching logs:', err);
            setError(err.message);
            setDebugInfo({
                error: err.message,
                code: err.code,
                details: err.details,
                hint: err.hint
            });
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Loading audit logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Audit Logs (Debug Mode)</h1>
                        <p className="text-sm text-muted-foreground">
                            Simplified view for testing
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={fetchLogs} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Debug Info */}
                {debugInfo && (
                    <Card className="mb-6 border-blue-500">
                        <CardHeader>
                            <CardTitle className="text-base">Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Error Display */}
                {error && (
                    <Card className="mb-6 border-red-500">
                        <CardHeader>
                            <CardTitle className="text-base text-red-500">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-500 mb-4">{error}</p>
                            <div className="bg-red-50 dark:bg-red-950 p-4 rounded text-sm">
                                <p className="font-semibold mb-2">Common Fixes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Check RLS policies in Supabase</li>
                                    <li>Verify audit_logs table exists</li>
                                    <li>Ensure you're marked as super_admin</li>
                                    <li>Check browser console (F12) for details</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Logs Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Audit Logs ({logs.length} total)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {logs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="mb-4">No audit logs found</p>
                                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded text-sm inline-block">
                                    <p className="font-semibold mb-2">This could mean:</p>
                                    <ul className="list-disc list-inside text-left space-y-1">
                                        <li>The table is empty (no events logged yet)</li>
                                        <li>RLS policies are blocking the query</li>
                                        <li>You're not authorized to view logs</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log, index) => (
                                    <div
                                        key={log.id || index}
                                        className="border border-border rounded-lg p-4 bg-card"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-mono text-sm font-semibold">
                                                {log.action}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            User ID: {log.user_id}
                                        </div>
                                        <details className="text-xs">
                                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                View Details
                                            </summary>
                                            <pre className="mt-2 bg-muted p-2 rounded overflow-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="mt-6 border-blue-500">
                    <CardHeader>
                        <CardTitle className="text-base">Troubleshooting Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>1. Check Supabase SQL Editor:</strong></p>
                        <pre className="bg-muted p-2 rounded text-xs">
                            SELECT COUNT(*) FROM audit_logs;
                        </pre>

                        <p className="pt-4"><strong>2. Verify RLS Policies:</strong></p>
                        <pre className="bg-muted p-2 rounded text-xs">
                            SELECT * FROM pg_policies WHERE tablename = 'audit_logs';
                        </pre>

                        <p className="pt-4"><strong>3. Check Your Admin Status:</strong></p>
                        <pre className="bg-muted p-2 rounded text-xs">
                            SELECT email, is_super_admin FROM profiles WHERE is_super_admin = true;
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}