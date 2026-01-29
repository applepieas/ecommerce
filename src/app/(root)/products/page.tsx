import { Suspense } from "react";
import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productImages,
  categories,
  genders,
  colors,
  sizes,
} from "@/lib/db/schema";
import { eq, inArray, and, gte, lte, desc, asc } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import Link from "next/link";
import {
  parseQueryFilters,
  PRICE_RANGES,
  type ProductFilters,
} from "@/lib/utils/query";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// ============================================
// Data Fetching Types
// ============================================

interface ProductWithDetails {
  id: string;
  name: string;
  description: string | null;
  price: string;
  salePrice: string | null;
  imageUrl: string;
  categoryName: string;
  genderSlug: string | null;
  colorCount: number;
  createdAt: Date;
}

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
// Fetch Products with Filters
// ============================================

async function getProducts(
  filters: ProductFilters
): Promise<ProductWithDetails[]> {
  try {
    // Fetch all published products with their details
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.isPublished, true));

    // Fetch related data for each product
    const productsWithDetails = await Promise.all(
      allProducts.map(async (product) => {
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id));
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id));
        const category = product.categoryId
          ? await db
            .select()
            .from(categories)
            .where(eq(categories.id, product.categoryId))
            .then((r) => r[0])
          : null;
        const gender = product.genderId
          ? await db
            .select()
            .from(genders)
            .where(eq(genders.id, product.genderId))
            .then((r) => r[0])
          : null;

        // Get variant color IDs for filtering
        const variantColorIds = variants.map((v) => v.colorId).filter(Boolean);
        const variantSizeIds = variants.map((v) => v.sizeId).filter(Boolean);

        // Get color and size slugs
        const variantColors =
          variantColorIds.length > 0
            ? await db
              .select()
              .from(colors)
              .where(
                inArray(
                  colors.id,
                  variantColorIds as string[]
                )
              )
            : [];

        const variantSizes =
          variantSizeIds.length > 0
            ? await db
              .select()
              .from(sizes)
              .where(
                inArray(
                  sizes.id,
                  variantSizeIds as string[]
                )
              )
            : [];

        const firstVariant = variants[0];
        const primaryImage = images.find((img) => img.isPrimary) || images[0];

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: firstVariant?.price || "0",
          salePrice: firstVariant?.salePrice || null,
          imageUrl: primaryImage?.url || "/shoes/shoe-1.jpg",
          categoryName: category?.name || "Shoes",
          genderSlug: gender?.slug || null,
          colorSlugs: variantColors.map((c) => c.slug),
          sizeSlugs: variantSizes.map((s) => s.slug),
          colorCount: new Set(variants.map((v) => v.colorId)).size || 1,
          createdAt: product.createdAt,
        };
      })
    );

    // Apply filters
    let filtered = productsWithDetails;

    // Gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter(
        (p) => p.genderSlug && filters.gender.includes(p.genderSlug)
      );
    }

    // Color filter
    if (filters.color.length > 0) {
      filtered = filtered.filter((p) =>
        p.colorSlugs.some((c: string) => filters.color.includes(c))
      );
    }

    // Size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizeSlugs.some((s: string) => filters.size.includes(s))
      );
    }

    // Price range filter
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.price);
        return filters.priceRange.some((range) => {
          const priceRange = PRICE_RANGES.find((pr) => pr.value === range);
          if (!priceRange) return false;
          return price >= priceRange.min && price <= priceRange.max;
        });
      });
    }

    // Apply sorting
    switch (filters.sort) {
      case "newest":
        filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        break;
      case "price_asc":
        filtered.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case "price_desc":
        filtered.sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case "featured":
      default:
        // Keep original order (or implement featured logic)
        break;
    }

    return filtered;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
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

  // Price range badges
  filters.priceRange.forEach((p) => {
    const range = PRICE_RANGES.find((pr) => pr.value === p);
    if (range) {
      badges.push({ key: "priceRange", value: p, label: range.label });
    }
  });

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
  products: ProductWithDetails[];
}

function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card
            title={product.name}
            category={product.categoryName}
            price={parseFloat(product.price)}
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

  // Convert searchParams to query string
  const queryString = Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=${value.join(",")}`;
      }
      return value ? `${key}=${value}` : "";
    })
    .filter(Boolean)
    .join("&");

  // Parse filters from URL
  const filters = parseQueryFilters(queryString);

  // Fetch data
  const [filterOptions, productList] = await Promise.all([
    getFilterOptions(),
    getProducts(filters),
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
            {productList.length} product{productList.length !== 1 ? "s" : ""}
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
          <div className="hidden lg:block">
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
            <ProductsGrid products={productList} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
