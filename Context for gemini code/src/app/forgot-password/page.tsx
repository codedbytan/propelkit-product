"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Check your email for the password reset link.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email to receive a reset link
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleReset}>
                    <div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="relative block w-full rounded-md border border-input bg-background px-3 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</div>}
                    {message && <div className="text-green-500 text-sm text-center bg-green-500/10 p-2 rounded">{message}</div>}

                    <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-semibold gradient-primary text-primary-foreground">
                        {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                    </Button>
                </form>
            </div>
        </div>
    );
}