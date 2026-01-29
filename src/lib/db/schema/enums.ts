import { pgEnum } from "drizzle-orm/pg-core";

// Address type enum
export const addressTypeEnum = pgEnum("address_type", ["billing", "shipping"]);

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "paypal",
  "cod",
]);

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "initiated",
  "completed",
  "failed",
]);

// Discount type enum
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);
