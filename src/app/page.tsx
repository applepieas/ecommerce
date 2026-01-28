import { db } from "@/db";
import { products } from "@/db/schema";
import Image from "next/image";

// Force dynamic rendering to avoid static build errors without DATABASE_URL
export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    return await db.select().from(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Nike Store
          </h1>
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Shop
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              About
            </a>
            <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              Cart (0)
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
            Just Do It
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">
            Discover the latest Nike sneakers and gear. Premium quality,
            legendary style.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Featured Products
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {allProducts.length} products available
            </p>
          </div>
        </div>

        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-20 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 text-6xl">👟</div>
            <h4 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
              No products yet
            </h4>
            <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
              Run the seed script to add Nike products:
              <code className="mt-2 block rounded bg-zinc-100 px-3 py-2 font-mono text-sm dark:bg-zinc-800">
                npx tsx src/db/seed.ts
              </code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-8xl">
                      👟
                    </div>
                  )}
                  {product.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      ${product.price}
                    </span>
                    <button className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 hover:shadow-lg active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2026 Nike Store Demo. Built with Next.js, Drizzle ORM, and Neon
            PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}
