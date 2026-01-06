"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InvoicePage() {
    // FIX: Safely access params to handle potential null values or strict type checks
    const params = useParams();
    const id = params?.id as string;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // FIX: Ensure id exists before attempting to fetch
        if (!id) return;

        const fetchInvoice = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("invoices").select("*").eq("id", id).single();
            setInvoice(data);
            setLoading(false);
        };
        fetchInvoice();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
    if (!invoice) return <div className="p-10 text-center">Invoice not found</div>;

    return (
        <div className="max-w-2xl mx-auto p-10 bg-white text-black font-sans min-h-screen">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-2xl font-bold">INVOICE</h1>
                    <p className="text-sm text-gray-500">#{invoice.id}</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl">Acme SaaS</h2>
                    <p className="text-sm text-gray-500">Your City, State</p>
                </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex justify-between mb-2">
                    <span>Description</span>
                    <span>Amount</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Lifetime License</span>
                    <span>₹{(invoice.amount / 100).toLocaleString("en-IN")}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mt-10">
                <div className="text-sm text-gray-500">Paid via Razorpay</div>
                <button onClick={() => window.print()} className="bg-black text-white px-4 py-2 rounded print:hidden">
                    Print / Save as PDF
                </button>
            </div>
        </div>
    );
}