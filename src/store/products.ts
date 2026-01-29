import { create } from "zustand";
import type { Product } from "@/lib/db/schema";

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  isLoading: false,
  setProducts: (products) => set({ products }),
  setLoading: (isLoading) => set({ isLoading }),
}));
