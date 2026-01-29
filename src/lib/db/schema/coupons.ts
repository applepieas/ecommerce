import { pgTable, text, uuid, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { discountTypeEnum } from "./enums";

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // Unique coupon code
  discountType: discountTypeEnum("discount_type").notNull(), // 'percentage' or 'fixed'
  discountValue: numeric("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  expiresAt: timestamp("expires_at"),
  maxUsage: integer("max_usage"), // Maximum times coupon can be used
  usedCount: integer("used_count").notNull().default(0), // Current usage count
});

// Zod schemas
export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);

// Type exports
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
