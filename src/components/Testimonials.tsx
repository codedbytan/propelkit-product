"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Arjun Verma",
    role: "Indie Hacker",
    content: "PropelKit saved me at least 3 weeks of dev time. The Razorpay integration just worked out of the box. Highly recommended!",
    avatar: "AV",
  },
  {
    name: "Sarah Jenkins",
    role: "Frontend Dev",
    content: "The code quality is insane. I usually hate boilerplates because they are messy, but this one is structured perfectly.",
    avatar: "SJ",
  },
  {
    name: "Rahul Gupta",
    role: "SaaS Founder",
    content: "Finally a boilerplate that understands the Indian market. GST invoicing was my biggest headache, and this solved it instantly.",
    avatar: "RG",
  },
  {
    name: "Mike Chen",
    role: "Fullstack Dev",
    content: "The Supabase auth setup is flawless. I deployed my app in 4 hours. Best investment I've made this year.",
    avatar: "MC",
  },
  {
    name: "Priya Sharma",
    role: "Product Manager",
    content: "I'm not a backend expert, so having the database and API routes pre-configured was a lifesaver.",
    avatar: "PS",
  },
  {
    name: "David Miller",
    role: "CTO",
    content: "We used this for our internal tools and it scales beautifully. The UI components are top-notch.",
    avatar: "DM",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Loved by <span className="text-gradient">builders</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 500+ developers who are shipping faster with PropelKit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 border-border/50 bg-background/50 hover:bg-background transition-all hover:shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} />
                  <AvatarFallback>{t.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}