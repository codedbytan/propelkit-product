import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 text-foreground">Contact Us</h1>
                <div className="space-y-6 text-lg">
                    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                        <Mail className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Support Email</p>
                            <p className="text-muted-foreground">support@propelkit.dev</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                        <Phone className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Phone</p>
                            <p className="text-muted-foreground">+91 63764 23215</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                        <MapPin className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Registered Address</p>
                            <p className="text-muted-foreground">Jaipur, Rajasthan, India</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                        <Clock className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Operating Hours</p>
                            <p className="text-muted-foreground">Mon-Fri, 10 AM - 6 PM IST</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}