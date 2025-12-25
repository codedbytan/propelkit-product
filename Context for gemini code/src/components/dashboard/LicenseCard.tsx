"use client";

import { Sparkles, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase-browser";

export function LicenseCard() {
    const [copied, setCopied] = useState(false);
    const [license, setLicense] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLicense = async () => {
            try {
                const supabase = createClient();
                // Get the current user first to ensure we are auth'd
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                // Fetch license
                const { data, error } = await supabase
                    .from("licenses")
                    .select("*")
                    .eq("user_id", user.id)
                    .order('created_at', { ascending: false }) // Get newest
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("Supabase Error:", error);
                    setError(error.message);
                } else if (!data) {
                    console.log("No license found in DB");
                } else {
                    setLicense(data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLicense();
    }, []);

    const handleCopy = () => {
        if (!license) return;
        navigator.clipboard.writeText(license.license_key);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />;

    // Dynamic Data
    const planName = license?.plan_key?.includes("agency") ? "Agency Plan" : "Starter Plan";
    const displayKey = license?.license_key || "No License Found";
    const isActive = !!license;

    return (
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black shadow-2xl">
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold opacity-70 uppercase tracking-wide">PropelKit License</p>
                        <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
                            {isActive ? planName : "No Active Plan"}
                        </h3>
                        {error && <p className="text-xs text-red-900 font-bold mt-1">Error: {error}</p>}
                    </div>
                    {isActive && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full border border-black/5">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-xs font-bold uppercase">Active</span>
                        </div>
                    )}
                </div>

                <div
                    onClick={isActive ? handleCopy : undefined}
                    className={`group relative flex items-center justify-between gap-3 p-4 bg-black/10 backdrop-blur-md rounded-xl border border-black/5 ${isActive ? 'cursor-pointer hover:bg-black/15' : 'cursor-not-allowed opacity-50'}`}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase opacity-60 mb-1">License Key</p>
                        <p className="font-mono text-lg font-bold tracking-widest truncate">{displayKey}</p>
                    </div>
                    {isActive && (
                        <div className="p-2 bg-black/10 rounded-lg group-hover:scale-110 transition-transform">
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}