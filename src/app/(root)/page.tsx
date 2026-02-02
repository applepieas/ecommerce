import { getFeaturedProducts } from "@/lib/actions/product";
import HomeHero from "@/components/home/HomeHero";
import HomeTrending from "@/components/home/HomeTrending";
import HomeBestOfAirMax from "@/components/home/HomeBestOfAirMax";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Force dynamic rendering since we rely on DB data
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch featured products for the "Best of Air Max" section
  // In a real app we would might query specifically for "Air Max" collection or similar
  const featuredProducts = await getFeaturedProducts(6);

  return (
    <div className="flex min-h-screen flex-col bg-light-100">
      {/* Hero Section */}
      <HomeHero />

      {/* Best of Air Max */}
      <HomeBestOfAirMax products={featuredProducts} />


      {/* Trending Now */}
      <HomeTrending />

    </div>
  );
}
