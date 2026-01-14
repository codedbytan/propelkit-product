import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Code,
  Palette,
  Megaphone,
  Video,
  Music,
  FileText,
  BookOpen,
  Briefcase,
} from "lucide-react";

const categories = [
  { name: "Development", icon: Code, count: 234 },
  { name: "Design", icon: Palette, count: 189 },
  { name: "Marketing", icon: Megaphone, count: 156 },
  { name: "Video & Animation", icon: Video, count: 98 },
  { name: "Music & Audio", icon: Music, count: 67 },
  { name: "Writing", icon: FileText, count: 145 },
  { name: "Consulting", icon: BookOpen, count: 112 },
  { name: "Business", icon: Briefcase, count: 203 },
];

export function CategoryGrid() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Find the perfect service for your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.name} href={`/listings?category=${category.name.toLowerCase()}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} services
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/categories">View All Categories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
