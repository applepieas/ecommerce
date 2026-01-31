"use client";

import { CartDTO } from "@/lib/actions/cart";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

interface CheckoutSummaryProps {
  cart: CartDTO;
}

export default function CheckoutSummary({ cart }: CheckoutSummaryProps) {
  // We'll use a hardcoded shipping estimate here for the summary view
  // or simple logic. The actual calculation happens in server action.
  // Ideally, this should be reactive to the selected delivery method in the form,
  // but for Phase 1/2 we can just show "Calculated at next step" or a default.
  // For the prompt requirements, let's show "Calculated based on selection" or default Standard ($5).

  const defaultShipping = 5.00;
  const total = cart.subtotal + defaultShipping; // This is purely visual for now

  return (
    <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-black flex items-center gap-2">
        <Package className="h-5 w-5" />
        Order Summary
      </h2>

      <div className="mb-6 max-h-96 overflow-y-auto pr-2 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
              <Image
                src={item.imageUrl}
                alt={item.productName}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <h3 className="text-sm font-medium text-black">{item.productName}</h3>
                <p className="text-xs text-gray-500">{item.variantName}</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Qty {item.quantity}</span>
                <span className="font-medium text-black">${item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping (Est.)</span>
          <span>${defaultShipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/cart"
          className="block text-center text-sm font-medium text-gray-500 hover:text-black underline underline-offset-4"
        >
          Edit Cart
        </Link>
      </div>
    </div>
  );
}
