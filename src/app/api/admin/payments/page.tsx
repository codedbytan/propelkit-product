// src/app/admin/payments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, DollarSign, Calendar, CheckCircle,
    XCircle, ArrowLeft, RefreshCw, Download
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
import { BRAND_CONFIG, formatPrice } from "@/config/brand";

interface Payment {
    id: string;
    user_id: string;
    user_email: string;
    amount: number;
    status: string;
    plan_key: string;
    created_at: string;
    razorpay_payment_id?: string;
}

export default function PaymentsManagement() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingRefund, setProcessingRefund] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAdminAndFetchPayments();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = payments.filter(payment =>
                payment.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.id.includes(searchQuery) ||
                payment.razorpay_payment_id?.includes(searchQuery)
            );
            setFilteredPayments(filtered);
        } else {
            setFilteredPayments(payments);
        }
    }, [searchQuery, payments]);

    async function checkAdminAndFetchPayments() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/sign-in?redirect=/admin/payments";
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

            await fetchPayments();
        } catch (err) {
            console.error("Failed to check admin:", err);
            setLoading(false);
        }
    }

    async function fetchPayments() {
        try {
            // Fetch all licenses (payments)
            const { data: licenses } = await supabase
                .from("licenses")
                .select(`
                    id,
                    user_id,
                    amount,
                    status,
                    plan_key,
                    created_at,
                    razorpay_payment_id,
                    profiles:user_id (email)
                `)
                .order("created_at", { ascending: false });

            if (!licenses) {
                setLoading(false);
                return;
            }

            const paymentsData: Payment[] = licenses.map(license => ({
                id: license.id,
                user_id: license.user_id,
                user_email: (license.profiles as any)?.email || "Unknown",
                amount: license.amount || 0,
                status: license.status || "pending",
                plan_key: license.plan_key || "unknown",
                created_at: license.created_at,
                razorpay_payment_id: license.razorpay_payment_id,
            }));

            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
            setLoading(false);
        }
    }

    async function handleRefund(paymentId: string, razorpayPaymentId: string) {
        if (!confirm("Are you sure you want to issue a refund? This cannot be undone.")) {
            return;
        }

        setProcessingRefund(paymentId);

        try {
            const response = await fetch("/api/admin/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    licenseId: paymentId,
                    razorpayPaymentId
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to process refund");
            }

            alert("Refund processed successfully!");
            await fetchPayments(); // Refresh data
        } catch (error) {
            console.error("Refund failed:", error);
            alert("Failed to process refund. Check console for details.");
        } finally {
            setProcessingRefund(null);
        }
    }

    async function downloadInvoice(paymentId: string) {
        try {
            const response = await fetch(`/api/admin/invoice/${paymentId}`);
            if (!response.ok) throw new Error("Failed to download invoice");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download invoice");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0) / 100;
    const successfulPayments = payments.filter(p => p.status === 'active').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Payment Management</h1>
                            <p className="text-sm text-muted-foreground">
                                View transactions, issue refunds, and manage payments
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
                {/* Search */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email, payment ID, or Razorpay ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">
                                        ₹{totalRevenue.toLocaleString('en-IN')}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{successfulPayments}</div>
                                    <p className="text-sm text-muted-foreground">Successful</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{failedPayments}</div>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Transactions ({filteredPayments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {new Date(payment.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{payment.user_email}</div>
                                                {payment.razorpay_payment_id && (
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {payment.razorpay_payment_id.slice(0, 20)}...
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {payment.plan_key.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.status === 'active' ? (
                                                    <Badge variant="default" className="bg-green-500">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Success
                                                    </Badge>
                                                ) : payment.status === 'failed' ? (
                                                    <Badge variant="destructive">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Failed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        {payment.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatPrice(payment.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => downloadInvoice(payment.id)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    {payment.status === 'active' && payment.razorpay_payment_id && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRefund(payment.id, payment.razorpay_payment_id!)}
                                                            disabled={processingRefund === payment.id}
                                                        >
                                                            {processingRefund === payment.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <RefreshCw className="w-4 h-4 mr-1" />
                                                                    Refund
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredPayments.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No payments found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}