import { getCart } from "@/lib/actions/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutFlow from "@/components/checkout/checkout-flow";
import CheckoutSummary from "@/components/checkout/checkout-summary";

export default async function CheckoutPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const session = await auth.api.getSession({
    headers: await headers() // Ensure headers is awaited
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-black">Checkout</h1>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* Left Column: Flow (Login / Form) */}
        <div className="lg:col-span-7">
          <CheckoutFlow user={session?.user || null} />
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  );
}
