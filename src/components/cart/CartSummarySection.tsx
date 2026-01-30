"use client";

import { useCart } from "@/components/cart/CartContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface CartSummarySectionProps {
  subtotal: number;
  totalQuantity: number;
}

export default function CartSummarySection({
  subtotal: initialSubtotal,
  totalQuantity: initialTotalQuantity,
}: CartSummarySectionProps) {
  const { cart } = useCart();

  // Prefer optimistic cart data if available (which it should be via CartProvider)
  const currentSubtotal = cart?.subtotal ?? initialSubtotal;
  // const currentQuantity = cart?.totalQuantity ?? initialTotalQuantity;

  // Mock estimated shipping/handling
  // If subtotal > 0, we charge shipping? Or free > X?
  // Design has "Estimated Delivery & Handling $2.00"
  // Let's keep it static $2.00 for now as per plan, or $0 if empty (but empty is handled by page).
  const estimatedShipping = 0.0; // Wait, design says $2.00. I'll verify if I should hardcode.
  // Plan: "Static (e.g., 2.00) for now."
  const shippingCost = 2.0;

  const total = currentSubtotal + shippingCost;

  return (
    <div className="rounded-lg bg-light-100 p-6 md:p-8">
      <h2 className="mb-6 text-xl font-medium text-dark-900">Summary</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-light-300 pb-4">
          <span className="text-dark-700">Subtotal</span>
          <span className="font-medium text-dark-900">
            {formatPrice(currentSubtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-light-300 pb-4">
          <span className="text-dark-700">Estimated Delivery & Handling</span>
          <span className="font-medium text-dark-900">
            {formatPrice(shippingCost)}
          </span>
        </div>

        <div className="flex items-center justify-between pb-6 pt-2">
          <span className="text-lg font-medium text-dark-900">Total</span>
          <span className="text-lg font-bold text-dark-900">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center rounded bg-dark-900 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-500 focus:ring-offset-2"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
