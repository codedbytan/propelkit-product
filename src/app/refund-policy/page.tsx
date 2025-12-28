import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Refund Policy</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        Acme SaaS offers non-tangible, irrevocable digital goods. Therefore, <strong className="text-foreground">we do not provide refunds</strong> after the product is purchased, which you acknowledge prior to purchasing any product on the website. Please make sure that you've carefully read the service description before making a purchase.
                    </p>
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">Exception</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        If you are unable to download the product due to a technical error on our end, please contact support for assistance at <a href="mailto:support@yourdomain.com" className="text-primary hover:underline">support@yourdomain.com</a>.
                    </p>
                    <p className="text-sm text-muted-foreground mt-8">Last updated: December 2024</p>
                </div>
            </div>
        </div>
    );
}
