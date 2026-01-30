"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useOptimistic,
  useCallback,
  useTransition,
} from "react";
import {
  CartDTO,
  CartItemDTO,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/actions/cart";

// ============================================
// Types
// ============================================

interface CartContextType {
  cart: CartDTO | null;
  isLoading: boolean;
  addItem: (
    productId: string,
    variantId: string,
    quantity: number,
    optDetails: {
      price: number;
      productName: string;
      imageUrl: string;
      salePrice?: number | null;
      variantName?: string;
    }
  ) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  isDrawerOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function CartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: CartDTO | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // We need to import useState

  // Optimistic Cart State
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    initialCart || { id: "", items: [], subtotal: 0, totalQuantity: 0 },
    (state, action: CartAction) => {
      switch (action.type) {
        case "ADD_ITEM": {
          const existingItemIndex = state.items.findIndex(
            (item) => item.variantId === action.payload.variantId
          );

          let newItems = [...state.items];

          if (existingItemIndex > -1) {
            // Update existing
            const item = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
              ...item,
              quantity: item.quantity + action.payload.quantity,
            };
          } else {
            // Add new
            newItems.unshift({
              ...action.payload.details,
              id: "temp-" + crypto.randomUUID(), // Temp ID
              productId: action.payload.productId,
              variantId: action.payload.variantId,
              quantity: action.payload.quantity,
              maxStock: 99, // Unknown in optimistic
              colorName: null,
              sizeName: null,
              variantName: action.payload.details.variantName || "Item",
            } as CartItemDTO);
          }

          // Recalculate totals
          const totalQuantity = newItems.reduce((acc, item) => acc + item.quantity, 0);
          const subtotal = newItems.reduce(
            (acc, item) =>
              acc + (item.salePrice ?? item.price) * item.quantity,
            0
          );

          return { ...state, items: newItems, totalQuantity, subtotal };
        }
        case "UPDATE_QUANTITY": {
          const newItems = state.items
            .map((item) =>
              item.id === action.payload.itemId
                ? { ...item, quantity: action.payload.quantity }
                : item
            )
            .filter((item) => item.quantity > 0);

          const totalQuantity = newItems.reduce((acc, item) => acc + item.quantity, 0);
          const subtotal = newItems.reduce(
            (acc, item) =>
              acc + (item.salePrice ?? item.price) * item.quantity,
            0
          );

          return { ...state, items: newItems, totalQuantity, subtotal };
        }
        case "REMOVE_ITEM": {
          const newItems = state.items.filter(
            (item) => item.id !== action.payload.itemId
          );

          const totalQuantity = newItems.reduce((acc, item) => acc + item.quantity, 0);
          const subtotal = newItems.reduce(
            (acc, item) =>
              acc + (item.salePrice ?? item.price) * item.quantity,
            0
          );

          return { ...state, items: newItems, totalQuantity, subtotal };
        }
        default:
          return state;
      }
    }
  );

  const addItem = useCallback(
    async (
      productId: string,
      variantId: string,
      quantity: number,
      optDetails: {
        price: number;
        productName: string;
        imageUrl: string;
        salePrice?: number | null;
        variantName?: string;
      }
    ) => {
      startTransition(async () => {
        setOptimisticCart({
          type: "ADD_ITEM",
          payload: { productId, variantId, quantity, details: optDetails },
        });
        await addToCart({ productId, variantId, quantity });
        setIsDrawerOpen(true); // Open drawer on add
      });
    },
    [setOptimisticCart]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      startTransition(async () => {
        setOptimisticCart({
          type: "UPDATE_QUANTITY",
          payload: { itemId, quantity },
        });
        await updateCartItemQuantity({ cartItemId: itemId, quantity });
      });
    },
    [setOptimisticCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      startTransition(async () => {
        setOptimisticCart({
          type: "REMOVE_ITEM",
          payload: { itemId },
        });
        await removeFromCart({ cartItemId: itemId });
      });
    },
    [setOptimisticCart]
  );

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isLoading: isPending,
        addItem,
        updateItemQuantity,
        removeItem,
        openDrawer,
        closeDrawer,
        isDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================
// Actions Type Definitions
// ============================================

type CartAction =
  | {
    type: "ADD_ITEM";
    payload: {
      productId: string;
      variantId: string;
      quantity: number;
      details: {
        price: number;
        productName: string;
        imageUrl: string;
        salePrice?: number | null;
        variantName?: string;
      };
    };
  }
  | {
    type: "UPDATE_QUANTITY";
    payload: { itemId: string; quantity: number };
  }
  | {
    type: "REMOVE_ITEM";
    payload: { itemId: string };
  };

// ============================================
// Hook
// ============================================

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Need to import useState at top
import { useState } from "react";
