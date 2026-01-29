import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const genders = pgTable("genders", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(), // e.g., "Men", "Women", "Unisex"
  slug: text("slug").notNull().unique(), // e.g., "men", "women", "unisex"
});

// Relations will be defined after products import to avoid circular deps
export const gendersRelations = relations(genders, ({ many }) => ({
  products: many(genders), // Placeholder, will connect to products
}));

// Zod schemas
export const insertGenderSchema = createInsertSchema(genders);
export const selectGenderSchema = createSelectSchema(genders);

// Type exports
export type Gender = typeof genders.$inferSelect;
export type NewGender = typeof genders.$inferInsert;
