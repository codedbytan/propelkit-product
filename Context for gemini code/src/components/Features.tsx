import {
  Database,
  ShieldCheck,
  CreditCard,
  Mail,
  Smartphone,
  Zap,
  LayoutDashboard,
  Code2
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Supabase Auth",
    description: "Secure authentication with Magic Links, Google Login, and Protected Routes pre-configured.",
    color: "text-green-500",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Razorpay Payments",
    description: "Accept subscriptions and one-time payments. Webhooks and GST invoicing included.",
    color: "text-blue-500",
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "PostgreSQL Database",
    description: "Scalable database schema with Prisma ORM. Ready for thousands of users.",
    color: "text-emerald-500",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Transactional Emails",
    description: "Send welcome emails and magic links using Resend. Beautiful HTML templates included.",
    color: "text-purple-500",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "User Dashboard",
    description: "A complete customer portal where users can manage their subscription and invoices.",
    color: "text-indigo-500",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile Responsive",
    description: "Looks perfect on every device. Built with Tailwind CSS and shadcn/ui components.",
    color: "text-pink-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-gradient">ship fast</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PropelKit comes with the essential features every SaaS needs, so you can focus on your unique business logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${feature.color} bg-opacity-10`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Text */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
            <Code2 className="w-4 h-4" />
            <span>Plus 20+ UI Components from shadcn/ui pre-installed</span>
          </div>
        </div>
      </div>
    </section>
  );
}