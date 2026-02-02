import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/lib/actions/product";

interface HomeBestOfAirMaxProps {
  products: ProductCardData[];
}

export default function HomeBestOfAirMax({ products }: HomeBestOfAirMaxProps) {
  // If no products, fallback to empty array or loading state, but page.tsx handles loading
  // The layout requires specific badge logic per item index to match design if purely mimicking
  // but we can use real data + calculated badges as done in actions.

  return (
    <section className="w-full px-14 pb-24 text-dark-900 mt-36">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-dark-900 tracking-tight">
          Best of Air Max
        </h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group cursor-pointer block"
          >
            {/* Image Container */}
            <div className="relative bg-white aspect-square w-full mb-5 overflow-hidden rounded-sm">
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm bg-white ${product.badge === "Best Seller"
                      ? "text-orange-600"
                      : product.badge.includes("20%")
                        ? "text-green-700"
                        : "text-green-700" // Default for discounts
                      }`}
                  >
                    {product.badge}
                  </span>
                </div>
              )}
              {/* Product Image */}
              <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover mix-blend-multiply"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-dark-900 leading-tight">
                  {product.name}
                </h3>
                <span className="text-lg font-medium text-dark-900">
                  ${product.salePrice ?? product.price}
                </span>
              </div>
              <p className="text-base text-dark-500 font-normal">
                {product.categoryName || "Shoes"}
              </p>
              <p className="text-base text-dark-400 font-normal">
                {product.colorCount} Colour{product.colorCount !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
