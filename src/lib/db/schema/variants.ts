import {
  pgTable,
  text,
  uuid,
  numeric,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "./products";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

// Dimensions type for JSONB column
export type VariantDimensions = {
  length: number;
  width: number;
  height: number;
};

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  colorId: uuid("color_id").references(() => colors.id, {
    onDelete: "set null",
  }),
  sizeId: uuid("size_id").references(() => sizes.id, {
    onDelete: "set null",
  }),
  inStock: integer("in_stock").notNull().default(0),
  weight: real("weight"), // Weight in kg
  dimensions: jsonb("dimensions").$type<VariantDimensions>(), // { length, width, height }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    color: one(colors, {
      fields: [productVariants.colorId],
      references: [colors.id],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeId],
      references: [sizes.id],
    }),
  })
);

// Zod schemas
export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);

// Type exports
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
