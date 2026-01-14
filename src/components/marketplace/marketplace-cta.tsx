import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MarketplaceCTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join {brand.name} today and connect with thousands of professionals or start offering your services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup?role=buyer">Find Services</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup?role=provider">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
