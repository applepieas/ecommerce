import { pgTable, text, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sizes = pgTable("sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "S", "M", "L", "42"
  slug: text("slug").notNull().unique(), // e.g., "s", "m", "l", "42"
  sortOrder: integer("sort_order").notNull().default(0), // For ordering: S < M < L
});

// Relations will be connected to product variants
export const sizesRelations = relations(sizes, ({ many }) => ({
  variants: many(sizes), // Placeholder, will connect to variants
}));

// Zod schemas
export const insertSizeSchema = createInsertSchema(sizes);
export const selectSizeSchema = createSelectSchema(sizes);

// Type exports
export type Size = typeof sizes.$inferSelect;
export type NewSize = typeof sizes.$inferInsert;
