"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link"; // 👈 Import this

export function InvoicesTable() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchInvoices = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("invoices")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) setInvoices(data);
            setLoading(false);
        };
        fetchInvoices();
    }, [supabase]);

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (invoices.length === 0) {
        return (
            <Card className="border-dashed border-border p-8 text-center bg-muted/20">
                <p className="text-muted-foreground">No invoices found.</p>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Recent Invoices
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-muted/30 border-border/50 transition-colors">
                                <TableCell className="font-medium text-xs font-mono">{invoice.id.slice(-8).toUpperCase()}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium">
                                    ₹{(invoice.amount / 100).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase">
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* ✅ FIX: Link to the invoice page */}
                                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Link href={`/invoice/${invoice.id}`} target="_blank">
                                            <Download className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
