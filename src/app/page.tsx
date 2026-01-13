export default function PlaceholderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Setup Required</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to PropelKit Boilerplate
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <p className="text-muted-foreground">
            Run the setup wizard to configure your project and select a blueprint:
          </p>
          <code className="block bg-muted px-6 py-4 rounded-lg text-sm font-mono">
            node scripts/setup-blueprint.js
          </code>
        </div>

        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">Available Blueprints:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Marketplace
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              SaaS Tool
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Blank
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
