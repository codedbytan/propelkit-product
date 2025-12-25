"use client";

import { useState } from "react";
import { Download, Github, FileCode, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function DownloadSection() {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/download", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Download failed");

            // Trigger Download
            const link = document.createElement("a");
            link.href = data.url;
            link.setAttribute("download", "propelkit-starter.zip");
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success("Download started!");
        } catch (error: any) {
            toast.error(error.message || "Could not download file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        Download Code
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-3 w-3 mr-1" />
                        v1.0.2
                    </Badge>
                </div>
                <CardDescription>
                    Get the production-ready source code.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        size="lg"
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex-1 gap-2 gradient-primary text-primary-foreground font-semibold"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                        Download Zip
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1 gap-2 border-border/50 hover:bg-secondary/50">
                        <Github className="h-5 w-5" />
                        Clone Repo
                    </Button>
                </div>

                <div className="rounded-lg bg-muted/30 p-4 space-y-3 border border-border/50">
                    <p className="text-sm font-medium text-foreground">Stack Includes:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {['Next.js 14 App Router', 'Supabase Auth', 'Razorpay + GST', 'Resend Emails'].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}