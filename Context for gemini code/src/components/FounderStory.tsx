export function FounderStory() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                  alt="Tanishq - Founder of PropelKit"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-background shadow-card"
                />
                <div className="absolute -bottom-2 -right-2 text-2xl">👋</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Hi, I'm Tanishq.
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  I built <span className="text-foreground font-medium">PropelKit</span> because I was tired of setting up Razorpay, authentication, and email systems for every new project.
                </p>
                <p>
                  As an indie hacker in India, I faced the same problems over and over — dealing with GST compliance, integrating Indian payment gateways, and writing boilerplate code that took weeks instead of hours.
                </p>
                <p>
                  PropelKit is the boilerplate I wish I had when I started. It's built specifically for the Indian market, with all the integrations you need to go from idea to revenue in days, not months.
                </p>
                <p className="text-foreground font-medium">
                  Stop reinventing the wheel. Start shipping. 🚀
                </p>
              </div>

              {/* Signature */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-semibold text-foreground">Tanishq</p>
                <p className="text-sm text-muted-foreground">Founder, PropelKit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
