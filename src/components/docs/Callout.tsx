import { AlertCircle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
    type?: "warning" | "info" | "tip";
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const Callout = ({ type = "warning", title, children, className }: CalloutProps) => {
    const getIcon = () => {
        switch (type) {
            case "warning":
                return <AlertCircle className="h-5 w-5 text-primary" />;
            case "info":
                return <Info className="h-5 w-5 text-blue-400" />;
            case "tip":
                return <Lightbulb className="h-5 w-5 text-emerald-400" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case "warning":
                return "border-l-primary";
            case "info":
                return "border-l-blue-400";
            case "tip":
                return "border-l-emerald-400";
        }
    };

    return (
        <div
            className={cn(
                "relative p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 border-l-4",
                getBorderColor(),
                className
            )}
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
                <div className="space-y-1">
                    {title && (
                        <p className="font-semibold text-foreground">{title}</p>
                    )}
                    <div className="text-muted-foreground text-sm leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Callout;