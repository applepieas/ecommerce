"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItemDTO } from "@/lib/actions/cart";
import { useCart } from "@/components/cart/CartContext";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItemDTO;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateItemQuantity, removeItem, cart } = useCart();

  // Optimistic find: look for this item in the cart context to get the instant/optimistic quantity
  // If not found (rare), fallback to prop item
  // Note: optimistically added items might have ID like "temp-..."
  // real backend items have uuid.
  // We match by ID.
  const optimisticItem = cart?.items.find((i) => i.id === item.id) || item;

  const handleQuantityDec = () => {
    if (optimisticItem.quantity > 1) {
      updateItemQuantity(item.id, optimisticItem.quantity - 1);
    } else {
      // Logic for 1 -> 0? usually remove, but let's just keep at 1 or explicit remove
      // Plan said: "If quantity becomes 0, item is removed"
      // updateItemQuantity handles delete if q <= 0?
      // "Lines 277-279: if (quantity <= 0) await db.delete..."
      // So yes, we can pass 0.
      // But purely from UX, often - button stops at 1 and trash is for remove.
      // Let's allow it to go to remove if the plan implied it, but the plan said:
      // "If quantity becomes 0, item is removed (server action handles this)"
      // So I will allow it.
      // Actually, UX usually prefers a distinct action or modal for removal via minus.
      // I'll stick to: - button goes to 1, if 1 -> remove? Or just stop at 1?
      // Plan: "Calls updateCartItemQuantity({ cartItemId, quantity: current - 1 }). If quantity becomes 0, item is removed"
      // So I will call with q-1.
      updateItemQuantity(item.id, optimisticItem.quantity - 1);
    }
  };

  const handleQuantityInc = () => {
    updateItemQuantity(item.id, optimisticItem.quantity + 1);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  // Delivery Date Mock
  // The design shows "Estimated arrival [date]" or "Delivered on [date]"
  // We'll mock a date based on today + 3 days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryDateStr = deliveryDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col border-b border-light-300 py-6 last:border-0 md:flex-row md:items-start md:gap-6">
      {/* Image */}
      <div className="relative mb-4 aspect-square w-full shrink-0 overflow-hidden rounded bg-light-200 md:mb-0 md:w-40 lg:w-48">
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col justify-between sm:flex-row sm:items-start">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-orange-600">
              Estimated arrival {deliveryDateStr}
            </p>
            <h3 className="text-lg font-medium text-dark-900">
              {item.productName}
            </h3>
            <p className="text-dark-500">{item.variantName}</p>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-dark-500">
              {item.sizeName && <span>Size {item.sizeName}</span>}
              <div className="flex items-center gap-2">
                <span>Quantity</span>
                <div className="flex items-center gap-3 rounded-full md:gap-2">
                  {/* Design shows simple - # + controls usually */}
                  {/* Replicating the "Quantity - 2 +" look from screenshot inline? 
                     Screenshot: "Size 10  Quantity - 2 +"
                  */}
                  <button
                    onClick={handleQuantityDec}
                    aria-label="Decrease quantity"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-dark-500 transition-colors hover:bg-light-300 hover:text-dark-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[1ch] text-center font-medium text-dark-900">
                    {optimisticItem.quantity}
                  </span>
                  <button
                    onClick={handleQuantityInc}
                    aria-label="Increase quantity"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-dark-500 transition-colors hover:bg-light-300 hover:text-dark-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Remove (Desktop lists price on right, trash below or near) */}
          <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2 mt-4 sm:mt-0">
            <p className="text-lg font-medium text-dark-900">
              {formatPrice(item.price * optimisticItem.quantity)}
            </p>
            <button
              onClick={handleRemove}
              aria-label="Remove item"
              className="text-dark-500 transition-colors hover:text-red-600 mt-2"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
