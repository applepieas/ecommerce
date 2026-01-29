import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Nike", "Adidas"
  slug: text("slug").notNull().unique(), // e.g., "nike", "adidas"
  logoUrl: text("logo_url"), // Optional brand logo
});

// Relations will be connected to products
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(brands), // Placeholder, will connect to products
}));

// Zod schemas
export const insertBrandSchema = createInsertSchema(brands);
export const selectBrandSchema = createSelectSchema(brands);

// Type exports
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
