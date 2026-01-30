import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import Link from "next/link";
import {
  parseFilterParams,
  getActiveFilterCount,
  type ProductFilters,
} from "@/lib/utils/query";
import { getAllProducts } from "@/lib/actions/product";
import { db } from "@/lib/db";
import { genders, colors, sizes } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// ============================================
// Fetch Filter Options
// ============================================

async function getFilterOptions() {
  const [allGenders, allSizes, allColors] = await Promise.all([
    db.select().from(genders),
    db.select().from(sizes).orderBy(asc(sizes.sortOrder)),
    db.select().from(colors),
  ]);

  return {
    genders: allGenders.map((g) => ({ slug: g.slug, label: g.label })),
    sizes: allSizes.map((s) => ({ slug: s.slug, name: s.name })),
    colors: allColors.map((c) => ({
      slug: c.slug,
      name: c.name,
      hexCode: c.hexCode,
    })),
  };
}

// ============================================
// Active Filter Badges Component
// ============================================

interface ActiveFiltersProps {
  filters: ProductFilters;
  filterOptions: Awaited<ReturnType<typeof getFilterOptions>>;
}

function ActiveFilters({ filters, filterOptions }: ActiveFiltersProps) {
  const badges: { key: string; value: string; label: string }[] = [];

  // Gender badges
  filters.gender.forEach((g) => {
    const gender = filterOptions.genders.find((opt) => opt.slug === g);
    if (gender) {
      badges.push({ key: "gender", value: g, label: gender.label });
    }
  });

  // Size badges
  filters.size.forEach((s) => {
    const size = filterOptions.sizes.find((opt) => opt.slug === s);
    if (size) {
      badges.push({ key: "size", value: s, label: `Size: ${size.name}` });
    }
  });

  // Color badges
  filters.color.forEach((c) => {
    const color = filterOptions.colors.find((opt) => opt.slug === c);
    if (color) {
      badges.push({ key: "color", value: c, label: color.name });
    }
  });

  // Search badge
  if (filters.search) {
    badges.push({ key: "search", value: filters.search, label: `Search: "${filters.search}"` });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={`${badge.key}-${badge.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-light-400 bg-light-200 px-3 py-1 text-caption font-caption text-dark-700"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-light-400 bg-light-100 py-20">
      <div className="mb-4 text-6xl">👟</div>
      <h3 className="mb-2 text-heading-3 font-heading-3 text-dark-900">
        No products found
      </h3>
      <p className="max-w-sm text-center text-body font-body text-dark-700">
        Try adjusting your filters or{" "}
        <Link href="/products" className="underline hover:text-dark-900">
          clear all filters
        </Link>{" "}
        to see more products.
      </p>
    </div>
  );
}

// ============================================
// Products Grid Component
// ============================================

interface ProductsGridProps {
  products: Awaited<ReturnType<typeof getAllProducts>>["products"];
}

function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <Link key={product.id} href={`/products/${product.id}`} className="flex flex-col h-full">
          <Card
            title={product.name}
            category={product.categoryName}
            price={product.price}
            imageUrl={product.imageUrl}
            colorCount={product.colorCount}
            badge={index === 0 ? "Best Seller" : undefined}
          />
        </Link>
      ))}
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;

  // Parse filters from searchParams using the new helper
  const filters = parseFilterParams(params);

  // Fetch data in parallel
  const [filterOptions, { products, totalCount, totalPages }] = await Promise.all([
    getFilterOptions(),
    getAllProducts(filters),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-light-100">
      <Navbar cartCount={0} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-heading-2 font-heading-2 leading-heading-2 text-dark-900">
            All Products
          </h1>
          <p className="mt-1 text-body font-body text-dark-700">
            {totalCount} product{totalCount !== 1 ? "s" : ""}
            {totalPages > 1 && ` · Page ${filters.page} of ${totalPages}`}
          </p>
        </div>

        {/* Subheader Toolbar: Mobile Filters + Active Badges + Sort */}
        <div className="mb-6 flex items-center justify-between border-b border-light-300 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Button - only visible on mobile */}
            <div className="lg:hidden">
              <Suspense fallback={<div className="h-10 w-24 animate-pulse rounded-full bg-light-300" />}>
                <Filters
                  genders={filterOptions.genders}
                  sizes={filterOptions.sizes}
                  colors={filterOptions.colors}
                  mode="mobile"
                />
              </Suspense>
            </div>
            {/* Active Filter Badges */}
            <ActiveFilters filters={filters} filterOptions={filterOptions} />
          </div>

          {/* Sort Dropdown */}
          <Suspense fallback={<div className="h-6 w-20 animate-pulse rounded bg-light-300" />}>
            <Sort />
          </Suspense>
        </div>

        {/* Main Content: Desktop Sidebar + Products Grid */}
        <div className="flex gap-8">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden lg:block sticky top-24 h-fit self-start shrink-0">
            <Suspense fallback={<div className="h-96 w-64 animate-pulse rounded-lg bg-light-200" />}>
              <Filters
                genders={filterOptions.genders}
                sizes={filterOptions.sizes}
                colors={filterOptions.colors}
                mode="sidebar"
              />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductsGrid products={products} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
