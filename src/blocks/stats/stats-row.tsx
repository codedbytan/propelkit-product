'use client';

interface Stat {
  label: string;
  value: string;
}

interface StatsRowProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Countries', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Support Rating', value: '4.9/5' },
];

export function StatsRow({ stats = defaultStats }: StatsRowProps) {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
