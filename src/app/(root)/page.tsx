import { db } from "@/lib/db";
import { products, productVariants, productImages, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// Force dynamic rendering to avoid static build errors without DATABASE_URL
export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    // Fetch products with their first variant and category
    const allProducts = await db.select().from(products).where(eq(products.isPublished, true));

    // Get variants and images for each product
    const productsWithDetails = await Promise.all(
      allProducts.map(async (product) => {
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
        const images = await db.select().from(productImages).where(eq(productImages.productId, product.id));
        const category = product.categoryId
          ? await db.select().from(categories).where(eq(categories.id, product.categoryId)).then(r => r[0])
          : null;

        const firstVariant = variants[0];
        const primaryImage = images.find(img => img.isPrimary) || images[0];

        return {
          ...product,
          price: firstVariant?.price || "0",
          imageUrl: primaryImage?.url || "/shoes/shoe-1.jpg",
          categoryName: category?.name || "Shoes",
          colorCount: new Set(variants.map(v => v.colorId)).size || 1,
        };
      })
    );

    return productsWithDetails;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const allProducts = await getProducts();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col bg-light-100">
      {/* Navbar */}
      <Navbar cartCount={2} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-light-200 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-heading-1 font-heading-1 leading-heading-1 text-dark-900 md:text-heading-2">
            Just Do It
          </h1>
          <p className="mx-auto max-w-2xl text-lead font-lead leading-lead text-dark-700">
            Discover the latest Nike sneakers and gear. Premium quality,
            legendary style.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-heading-3 font-heading-3 leading-heading-3 text-dark-900">
              Featured Products
            </h2>
            <p className="mt-2 text-body font-body leading-body text-dark-700">
              {allProducts.length} products available
            </p>
          </div>
        </div>

        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-light-400 bg-light-100 py-20">
            <div className="mb-4 text-6xl">👟</div>
            <h3 className="mb-2 text-heading-3 font-heading-3 text-dark-900">
              No products yet
            </h3>
            <p className="max-w-sm text-center text-body font-body text-dark-700">
              Run the seed script to add Nike products:
              <code className="mt-2 block rounded bg-light-200 px-3 py-2 font-mono text-caption">
                npm run db:seed
              </code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProducts.map((product, index) => (
              <Card
                key={product.id}
                title={product.name}
                category={product.categoryName}
                price={parseFloat(product.price)}
                imageUrl={product.imageUrl}
                colorCount={product.colorCount}
                badge={index === 0 ? "Best Seller" : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

