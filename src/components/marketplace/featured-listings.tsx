import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";

// Mock data - in real app, fetch from database
const featuredListings = [
  {
    id: 1,
    title: "Professional Web Development",
    provider: "John Doe",
    avatar: null,
    rating: 4.9,
    reviews: 127,
    price: 5000,
    category: "Development",
  },
  {
    id: 2,
    title: "Logo & Brand Identity Design",
    provider: "Jane Smith",
    avatar: null,
    rating: 5.0,
    reviews: 89,
    price: 3000,
    category: "Design",
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    provider: "Mike Johnson",
    avatar: null,
    rating: 4.8,
    reviews: 56,
    price: 8000,
    category: "Marketing",
  },
  {
    id: 4,
    title: "Content Writing & SEO",
    provider: "Sarah Williams",
    avatar: null,
    rating: 4.9,
    reviews: 103,
    price: 2500,
    category: "Writing",
  },
];

export function FeaturedListings() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Services
          </h2>
          <p className="text-muted-foreground text-lg">
            Top-rated services from our best providers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {featuredListings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                {/* Thumbnail placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5" />

                <div className="p-5 space-y-3">
                  {/* Provider */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={listing.avatar || undefined} />
                      <AvatarFallback>{listing.provider[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {listing.provider}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Category badge */}
                  <Badge variant="secondary">{listing.category}</Badge>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{listing.rating}</span>
                      <span className="text-muted-foreground">
                        ({listing.reviews})
                      </span>
                    </div>
                    <div className="font-semibold">
                      ₹{listing.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
