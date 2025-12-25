import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">1. License Grant</h2>
                        <p>Upon purchase, PropelKit grants you a non-exclusive, non-transferable license to use the software.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong className="text-foreground">Starter License:</strong> Personal use only. You may use the code for your own projects but may not resell or redistribute the source code.</li>
                            <li><strong className="text-foreground">Agency License:</strong> Commercial use permitted. You may use PropelKit for unlimited client projects. You may not resell or redistribute the source code as a standalone product.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">2. Restrictions</h2>
                        <p>You may not redistribute, resell, or share the source code. Creating derivative products for sale as boilerplates is prohibited.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">3. Updates</h2>
                        <p>Your purchase includes lifetime access to all future updates at no additional cost.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">4. Support</h2>
                        <p>Support is provided via email and Discord. Agency license holders receive priority support with faster response times.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">5. Disclaimer</h2>
                        <p>PropelKit is provided "as is" without warranties. We are not liable for any damages arising from use of the software.</p>
                    </section>
                    <p className="text-sm mt-8">Last updated: December 2024</p>
                </div>
            </div>
        </div>
    );
}