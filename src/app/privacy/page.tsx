import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Information We Collect</h2>
                        <p>When you purchase Acme SaaS, we collect:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong className="text-foreground">Email address:</strong> Used for product delivery, updates, and support.</li>
                            <li><strong className="text-foreground">Payment information:</strong> Processed securely by Razorpay. We do not store card details.</li>
                            <li><strong className="text-foreground">Name:</strong> For invoice generation and communication.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">How We Use Your Data</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Deliver your purchased product</li>
                            <li>Send important product updates</li>
                            <li>Provide customer support</li>
                            <li>Generate GST invoices</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Third-Party Services</h2>
                        <p>We use <strong className="text-foreground">Razorpay</strong> for payment processing. Your payment data is handled according to Razorpay's privacy policy and PCI-DSS compliance standards.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Contact</h2>
                        <p>For privacy-related inquiries, contact us at <a href="mailto:support@yourdomain.com" className="text-primary hover:underline">support@yourdomain.com</a>.</p>
                    </section>
                    <p className="text-sm mt-8">Last updated: December 2024</p>
                </div>
            </div>
        </div>
    );
}
