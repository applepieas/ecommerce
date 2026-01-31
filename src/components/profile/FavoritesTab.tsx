import Link from "next/link";
import Card from "@/components/Card";
import WishlistButton from "../wishlist/WishlistButton";

interface FavoritesTabProps {
  wishlist: any[]; // Using any to avoid complex type reconstruction for now
  userId: string;
}

export default function FavoritesTab({ wishlist, userId }: FavoritesTabProps) {
  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-6xl">❤️</div>
        <h3 className="mb-2 text-heading-3 font-heading-3 text-dark-900">
          No favorites yet
        </h3>
        <p className="max-w-sm text-body font-body text-dark-700">
          Save items to your wishlist to see them here.
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-full bg-dark-900 px-8 py-3 text-body font-body-medium text-light-100 transition-colors hover:bg-dark-700"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {wishlist.map((item) => {
        // Use variant details if available, otherwise fallback to product details
        const price = item.variant
          ? Number(item.variant.salePrice ?? item.variant.price)
          : Number(item.product.variants?.[0]?.salePrice ?? item.product.variants?.[0]?.price ?? 0);

        const imageUrl = item.product.images?.[0]?.url || "/placeholder.jpg";

        // Construct a display title - if variant is selected, maybe show it?
        // For card we just show product name usually.

        return (
          <Link
            key={item.id}
            href={`/products/${item.product.id}`}
            className="flex flex-col h-full relative group"
          >
            <Card
              title={item.product.name}
              category="Shoes" // We didn't fetch category relation in getWishlist yet, defaulting.
              price={price}
              imageUrl={imageUrl}
              colorCount={1}
              productId={item.product.id}
              variantId={item.variantId}
              userId={userId}
              initialIsLiked={true}
            />
          </Link>
        );
      })}
    </div>
  );
}
