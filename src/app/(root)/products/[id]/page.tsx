import { notFound } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProduct, getRelatedProducts } from "@/lib/actions/product";
import Link from "next/link";

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
    <nav className="mb-6 flex items-center gap-2 text-caption font-caption text-dark-700">
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
      <span className="text-dark-900">{product.name}</span>
    </nav>
  );
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
            <Link key={product.id} href={`/products/${product.id}`} className="flex flex-col h-full">
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

  const product = await getProduct(id);

  if (!product) {
    notFound();
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
