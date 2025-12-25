"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const DEMO_INVOICES = [
    { id: "INV-001", date: "Today", amount: "₹9,999.00", status: "paid", plan: "Agency Lifetime" },
    { id: "INV-002", date: "Yesterday", amount: "₹3,999.00", status: "paid", plan: "Starter Lifetime" },
    { id: "INV-003", date: "Dec 20, 2024", amount: "₹9,999.00", status: "paid", plan: "Agency Lifetime" },
];

export function DemoInvoicesTable() {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Recent Transactions (Demo Data)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead>Invoice</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Download</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {DEMO_INVOICES.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-muted/30 border-border/50 transition-colors">
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                <TableCell>{invoice.plan}</TableCell>
                                <TableCell className="font-mono text-foreground">{invoice.amount}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 uppercase text-[10px] tracking-wider">
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                        <Download className="h-4 w-4" />
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