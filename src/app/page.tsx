import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

export default function PlaceholderHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to {brand.name}
        </h1>
        <p className="text-xl text-muted-foreground">
          {brand.tagline}
        </p>
        <div className="pt-8">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">🚀 Quick Start</h2>
            <p className="text-muted-foreground mb-6">
              Run the setup wizard to configure your project and choose a blueprint:
            </p>
            <code className="block bg-muted px-4 py-3 rounded-md font-mono text-sm">
              npm run setup
            </code>
          </div>
        </div>
        <div className="pt-4 text-sm text-muted-foreground">
          <p>This placeholder will be replaced with your selected blueprint.</p>
        </div>
      </div>
    </div>
  );
}
