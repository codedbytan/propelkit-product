"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import confetti from "canvas-confetti"; // 👈 Make sure to install this
import { toast } from "sonner";

export default function PaymentSuccess() {
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // 1. Trigger Confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // 2. Poll for License (The "Wait" Logic)
        const checkLicense = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let attempts = 0;
            const maxAttempts = 30; // Wait up to 60 seconds

            const poll = setInterval(async () => {
                attempts++;
                // Check if license exists in DB
                const { data: license } = await supabase
                    .from("licenses")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .maybeSingle();

                if (license) {
                    clearInterval(poll);
                    setVerifying(false); // ✅ Stop loading, show success UI
                    toast.success("License Activated Successfully!");
                } else if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setVerifying(false);
                    toast.error("Taking longer than expected. Please check your Dashboard.");
                }
            }, 2000); // Check every 2 seconds

            return () => clearInterval(poll);
        };

        checkLicense();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Glass Card */}
            <div className="w-full max-w-lg relative z-10">
                <div className="backdrop-blur-xl bg-background/60 border border-primary/20 rounded-2xl p-8 md:p-12 shadow-2xl text-center">

                    {/* Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                                {verifying ? (
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                ) : (
                                    <CheckCircle className="h-10 w-10 text-primary" />
                                )}
                            </div>
                            {!verifying && (
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                        {verifying ? "Finalizing Setup..." : "Payment Successful!"}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        {verifying
                            ? "Please wait while we securely generate your license key..."
                            : "Welcome to PropelKit. You now have lifetime access."}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            asChild
                            disabled={verifying}
                            className="w-full h-12 text-base font-semibold gradient-primary"
                        >
                            <Link href="/dashboard">
                                {verifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Payment...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" /> Go to Dashboard
                                    </>
                                )}
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="w-full h-12">
                            <Link href="/">Back to Home <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}