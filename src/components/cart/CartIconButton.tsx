"use client";

import { useCart } from "./CartContext";
import { ShoppingBag } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function CartIconButton() {
  const { openDrawer, cart } = useCart();
  const count = cart?.totalQuantity || 0;

  return (
    <>
      <button
        onClick={openDrawer}
        className="relative flex items-center gap-2 text-body font-body text-dark-900 transition-colors hover:text-dark-700"
        aria-label={`Cart with ${count} items`}
      >
        <div className="relative">
          <ShoppingBag className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-dark-900 text-[10px] font-bold text-light-100">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
      </button>
      <CartDrawer />
    </>
  );
}
