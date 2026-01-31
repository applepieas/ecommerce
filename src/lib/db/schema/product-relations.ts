import { relations } from "drizzle-orm";
import { products } from "./products";
import { productImages } from "./product-images";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./brands";
import { productVariants } from "./variants";

// Moved from products.ts to avoid circular dependency (products <-> productImages)
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
}));
