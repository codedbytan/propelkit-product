"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Settings, Database, CreditCard, Rocket } from "lucide-react";

interface DocsSidebarProps {
    activeSection: string;
    onSectionClick: (section: string) => void;
}

export const sections = [
    { id: "getting-started", label: "Getting Started", icon: BookOpen },
    { id: "configuration", label: "Configuration (.env)", icon: Settings },
    { id: "database", label: "Database Setup (SQL)", icon: Database },
    { id: "razorpay", label: "Going Live (Razorpay)", icon: CreditCard },
    { id: "deployment", label: "Deployment", icon: Rocket },
];

const DocsSidebar = ({ activeSection, onSectionClick }: DocsSidebarProps) => {
    return (
        <nav className="space-y-1">
            {sections.map((section) => (
                <button
                    key={section.id}
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        activeSection === section.id
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                </button>
            ))}
        </nav>
    );
};

export default DocsSidebar;
