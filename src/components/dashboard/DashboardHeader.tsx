"use client";

import Link from "next/link";
import { UserNav } from "@/components/UserNav";
import { ArrowLeft } from "lucide-react";

// ✅ Accept 'user' as a prop
export function DashboardHeader({ user }: { user: any }) {
    return (
        <header className="sticky top-0 z-30 h-16 border-b border-border/10 bg-background/80 backdrop-blur-md">
            <div className="container max-w-6xl mx-auto h-full flex items-center justify-between px-6">

                {/* Left: Brand & Back Link */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                            PK
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block">PropelKit</span>
                    </div>

                    <div className="h-6 w-px bg-border/20 hidden sm:block" />

                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to Website</span>
                    </Link>
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    {/* ✅ Pass the user to UserNav */}
                    <UserNav user={user} />
                </div>
            </div>
        </header>
    );
}