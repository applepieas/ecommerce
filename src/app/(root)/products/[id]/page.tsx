import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductReviews from "@/components/ProductReviews";
import { getProduct, getRelatedProducts, getProductReviews } from "@/lib/actions/product";

// ============================================
// Types
// ============================================

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// ============================================
// Loading Skeleton
// ============================================

function ProductSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gallery Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-light-200" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-16 animate-pulse rounded-md bg-light-200" />
          ))}
        </div>
      </div>

      {/* Details Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="h-12 w-3/4 animate-pulse rounded bg-light-200" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-light-200" />
        <div className="h-8 w-24 animate-pulse rounded bg-light-200" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-light-200" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-light-200" />
          ))}
        </div>
        <div className="h-14 w-full animate-pulse rounded-full bg-light-200" />
      </div>
    </div>
  );
}

// ============================================
// Not Found Component
// ============================================

function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-light-200">
        <svg
          className="h-12 w-12 text-dark-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <h1 className="text-heading-3 font-heading-3 text-dark-900">
          Product Not Found
        </h1>
        <p className="mt-2 text-body font-body text-dark-700">
          The product you're looking for doesn't exist or has been removed.
        </p>
      </div>
      <Link
        href="/products"
        className="rounded-full bg-dark-900 px-8 py-3 text-body font-body-medium text-light-100 transition-colors hover:bg-dark-700"
      >
        Browse All Products
      </Link>
    </div>
  );
}

// ============================================
// Breadcrumbs Component
// ============================================

interface BreadcrumbsProps {
  product: {
    name: string;
    category: { name: string; slug: string } | null;
    gender: { label: string; slug: string } | null;
  };
}

function Breadcrumbs({ product }: BreadcrumbsProps) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-caption font-caption text-dark-700">
      <Link href="/" className="hover:text-dark-900 hover:underline">
        Home
      </Link>
      <span>/</span>
      <Link href="/products" className="hover:text-dark-900 hover:underline">
        All Products
      </Link>
      {product.gender && (
        <>
          <span>/</span>
          <Link
            href={`/products?gender=${product.gender.slug}`}
            className="hover:text-dark-900 hover:underline"
          >
            {product.gender.label}
          </Link>
        </>
      )}
      {product.category && (
        <>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-dark-900 hover:underline"
          >
            {product.category.name}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-dark-900 line-clamp-1 max-w-[200px]">{product.name}</span>
    </nav>
  );
}

// ============================================
// Reviews Section (Wrapper for Suspense)
// ============================================

async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);
  return <ProductReviews reviews={reviews} />;
}

// ============================================
// You Might Also Like Component
// ============================================

interface YouMightAlsoLikeProps {
  productId: string;
  categoryId: string | null;
  genderId: string | null;
}

async function YouMightAlsoLike({ productId, categoryId, genderId }: YouMightAlsoLikeProps) {
  const relatedProducts = await getRelatedProducts(productId, categoryId, genderId, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-light-300 pt-12">
      <h2 className="mb-8 text-heading-3 font-heading-3 text-dark-900">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product, index) => {
          const discount = product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0;

          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col h-full">
              <Card
                title={product.name}
                category={product.categoryName}
                price={product.price}
                imageUrl={product.imageUrl}
                colorCount={product.colorCount}
                badge={index === 0 ? "Best Seller" : (discount > 0 ? `Extra ${discount}% off` : undefined)}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // We need to handle potential invalid UUIDs gracefully
  // getProduct checks DB but if ID is not UUID format it might throw at DB level
  // So standard practice is let it try, catch if needed, but getProduct handles it
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-light-100">
        <Navbar cartCount={0} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <ProductNotFound />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-light-100">
      <Navbar cartCount={0} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs product={product} />

        {/* Product Content */}
        <Suspense fallback={<ProductSkeleton />}>
          <ProductDetailClient product={product} />
        </Suspense>

        {/* Reviews */}
        <Suspense fallback={
          <div className="mt-16 border-t border-light-300 pt-12 animate-pulse">
            <div className="h-8 w-48 rounded bg-light-200 mb-8" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="h-40 rounded bg-light-200" />
              <div className="col-span-2 flex flex-col gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 rounded bg-light-200" />)}
              </div>
            </div>
          </div>
        }>
          <ReviewsSection productId={product.id} />
        </Suspense>

        {/* You Might Also Like */}
        <Suspense fallback={
          <div className="mt-16 border-t border-light-300 pt-12">
            <div className="h-8 w-48 animate-pulse rounded bg-light-200 mb-8" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-square animate-pulse rounded-lg bg-light-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-light-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-light-200" />
                </div>
              ))}
            </div>
          </div>
        }>
          <YouMightAlsoLike
            productId={product.id}
            categoryId={product.category?.id ?? null}
            genderId={product.gender?.id ?? null}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
