import { brand } from "@/config/brand";
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero";
import { CategoryGrid } from "@/components/marketplace/category-grid";
import { FeaturedListings } from "@/components/marketplace/featured-listings";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { MarketplaceCTA } from "@/components/marketplace/marketplace-cta";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function MarketplaceLanding() {
  return (
    <>
      <Navbar />
      <main>
        <MarketplaceHero />
        <CategoryGrid />
        <FeaturedListings />
        <HowItWorks />
        <MarketplaceCTA />
      </main>
      <Footer />
    </>
  );
}
