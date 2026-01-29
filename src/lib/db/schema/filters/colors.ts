import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const colors = pgTable("colors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Red", "Blue"
  slug: text("slug").notNull().unique(), // e.g., "red", "blue"
  hexCode: text("hex_code").notNull(), // e.g., "#FF0000"
});

// Relations will be connected to product variants
export const colorsRelations = relations(colors, ({ many }) => ({
  variants: many(colors), // Placeholder, will connect to variants
}));

// Zod schemas
export const insertColorSchema = createInsertSchema(colors);
export const selectColorSchema = createSelectSchema(colors);

// Type exports
export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
