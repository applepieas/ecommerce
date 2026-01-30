"use client";

import { useCart } from "./CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer() {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateItemQuantity,
    removeItem,
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="relative z-[100]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-light-100 shadow-xl transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-light-300 px-6 py-4">
          <h2 className="text-heading-3 font-heading-3 text-dark-900">Your Bag</h2>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-dark-900 transition-colors hover:bg-light-200"
            aria-label="Close cart"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-200">
                <ShoppingBag className="h-8 w-8 text-dark-500" />
              </div>
              <p className="text-body-medium font-body-medium text-dark-900">
                Your bag is empty
              </p>
              <button
                onClick={closeDrawer}
                className="text-body font-body text-dark-700 underline hover:text-dark-900"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-8">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-light-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-4">
                        <h3 className="line-clamp-2 text-body-medium font-body-medium text-dark-900">
                          {item.productName}
                        </h3>
                        <p className="flex-shrink-0 text-body-medium font-body-medium text-dark-900">
                          ${(item.salePrice ?? item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-caption font-caption text-dark-500">
                        {item.variantName}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 rounded-full border border-light-300 bg-light-100 p-1">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateItemQuantity(item.id, item.quantity - 1);
                            } else {
                              removeItem(item.id);
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-dark-900 transition-colors hover:bg-light-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-caption font-caption text-dark-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-dark-900 transition-colors hover:bg-light-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-dark-500 transition-colors hover:text-red"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-light-300 bg-light-100 p-6">
            <div className="mb-4 flex items-center justify-between text-body-medium font-body-medium text-dark-900">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <p className="mb-6 text-caption font-caption text-dark-500">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="flex w-full items-center justify-center rounded-full bg-dark-900 py-4 text-body font-body-medium text-white transition-colors hover:bg-dark-700"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
