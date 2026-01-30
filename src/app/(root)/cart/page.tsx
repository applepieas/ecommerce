import { getCart } from "@/lib/actions/cart";
import Link from "next/link";
import CartItemsSection from "@/components/cart/CartItemsSection";
import CartSummarySection from "@/components/cart/CartSummarySection";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h1 className="text-3xl font-heading font-medium tracking-tight text-dark-900 md:text-3xl mb-8">
          Cart
        </h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-light-300 bg-light-100 py-16 text-center">
          <p className="mb-6 text-lg text-dark-700">
            There are no items in your bag.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-dark-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Use a default estimation for shipping for now, or calculate it.
  // The plan mentioned passing subtotal and total.
  // We can pass the whole cart object to sections if needed, or specific props.
  // Let's pass the cart to both sections so they can handle their respective parts.
  // Summary needs subtotal.

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-12 lg:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        {/* Left Column: Cart Items */}
        <div>
          <h1 className="mb-6 text-2xl font-heading font-medium text-dark-900 md:mb-8 md:text-3xl">
            Cart
          </h1>
          <CartItemsSection initialItems={cart.items} />
        </div>

        {/* Right Column: Summary */}
        <div className="relative">
          <CartSummarySection
            subtotal={cart.subtotal}
            totalQuantity={cart.totalQuantity}
          />
        </div>
      </div>
    </div>
  );
}
