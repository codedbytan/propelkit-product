import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-4 animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {brand.name}
          </h1>
          <p className="text-2xl text-muted-foreground">
            {brand.tagline}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-1">
          <Button size="lg" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground animate-fade-up stagger-2">
          Built with PropelKit - Start building amazing things
        </p>
      </div>
    </div>
  );
}
