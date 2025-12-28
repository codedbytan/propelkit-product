import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Shipping & Delivery Policy</h1>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Delivery Method</h2>
                        <p>Acme SaaS is a purely <strong className="text-foreground">digital product</strong> (software code). We do not ship any physical items to your address.</p>
                        <p className="mt-2">Upon successful payment, you will receive:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>An immediate confirmation email.</li>
                            <li>Instant access to your unique License Key.</li>
                            <li>A direct download link for the source code via your Dashboard.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Delivery Timeframes</h2>
                        <p><strong className="text-foreground">Instant Delivery:</strong> Since the product is digital, there is no waiting period. The files are available for download immediately after payment confirmation by our payment gateway (Razorpay).</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Issues with Delivery</h2>
                        <p>If you do not receive the confirmation email or cannot access the dashboard within 10 minutes of purchase, please check your spam folder. If the issue persists, contact our support team immediately.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">International Orders</h2>
                        <p>As a digital download, Acme SaaS is available globally. No customs duties or shipping fees apply.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">Contact</h2>
                        <p>For any delivery-related queries, please email us at <a href="mailto:support@yourdomain.com" className="text-primary hover:underline">support@yourdomain.com</a> or call us at <strong className="text-foreground">+91 XXXXX XXXXX</strong>.</p>
                    </section>

                    <p className="text-sm mt-8">Last updated: December 2024</p>
                </div>
            </div>
        </div>
    );
}
