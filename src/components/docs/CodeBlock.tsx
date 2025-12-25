"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodeBlockProps {
    code: string;
    language: "bash" | "sql" | "env" | "typescript";
    filename?: string;
}

const CodeBlock = ({ code, language, filename }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getLanguageLabel = () => {
        switch (language) {
            case "bash":
                return "Terminal";
            case "sql":
                return "SQL";
            case "env":
                return ".env";
            case "typescript":
                return "TypeScript";
            default:
                return language;
        }
    };

    const highlightSyntax = (code: string, lang: string) => {
        if (lang === "sql") {
            return code
                .split("\n")
                .map((line) => {
                    // Comments
                    if (line.trim().startsWith("--")) {
                        return `<span class="text-muted-foreground italic">${line}</span>`;
                    }
                    // Keywords
                    let highlighted = line
                        .replace(
                            /\b(create|table|public|uuid|references|not|null|primary|key|text|default|unique|timestamp|with|time|zone|timezone|integer|on|delete|cascade)\b/gi,
                            '<span class="text-primary">$1</span>'
                        )
                        .replace(
                            /\b(auth\.users|uuid_generate_v4)\b/g,
                            '<span class="text-blue-400">$1</span>'
                        )
                        .replace(/'([^']*)'/g, '<span class="text-emerald-400">\'$1\'</span>');
                    return highlighted;
                })
                .join("\n");
        }

        if (lang === "bash") {
            return code
                .split("\n")
                .map((line) => {
                    if (line.startsWith("#")) {
                        return `<span class="text-muted-foreground">${line}</span>`;
                    }
                    return line
                        .replace(/^(git|npm|cd|npx)\b/, '<span class="text-primary">$1</span>')
                        .replace(/(clone|install|run|dev|build)\b/, '<span class="text-blue-400">$1</span>');
                })
                .join("\n");
        }

        if (lang === "env") {
            return code
                .split("\n")
                .map((line) => {
                    if (line.startsWith("#")) {
                        return `<span class="text-muted-foreground italic">${line}</span>`;
                    }
                    const [key, ...valueParts] = line.split("=");
                    if (valueParts.length > 0) {
                        return `<span class="text-primary">${key}</span>=<span class="text-emerald-400">${valueParts.join("=")}</span>`;
                    }
                    return line;
                })
                .join("\n");
        }

        return code;
    };

    return (
        <div className="relative group rounded-lg overflow-hidden border border-white/10 bg-background/50 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    {filename && (
                        <span className="text-xs text-muted-foreground ml-2">{filename}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-medium">
                        {getLanguageLabel()}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Code Content */}
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                <code
                    dangerouslySetInnerHTML={{ __html: highlightSyntax(code, language) }}
                />
            </pre>
        </div>
    );
};

export default CodeBlock;