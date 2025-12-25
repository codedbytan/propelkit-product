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

// 💡 CUSTOMIZE: Replace these with YOUR product's features
const features = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Secure Authentication",
    description: "Built-in user authentication with email, magic links, and social login support.",
    color: "text-green-500",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Payment Processing",
    description: "Accept payments seamlessly with integrated payment gateway and automated invoicing.",
    color: "text-blue-500",
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Scalable Database",
    description: "PostgreSQL database with real-time capabilities and automatic backups.",
    color: "text-emerald-500",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Notifications",
    description: "Transactional emails for signups, receipts, and important user notifications.",
    color: "text-purple-500",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Admin Dashboard",
    description: "Powerful admin panel to manage users, payments, and monitor your business.",
    color: "text-indigo-500",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile Responsive",
    description: "Beautiful design that works perfectly on every device, from phones to desktops.",
    color: "text-pink-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-gradient">succeed</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All the tools and features you need to launch and grow your business, right out of the box.
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
            <span>Built with Next.js 14, TypeScript, and Tailwind CSS</span>
          </div>
        </div>
      </div>
    </section>
  );
}