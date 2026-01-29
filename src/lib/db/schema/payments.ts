import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { orders } from "./orders";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(), // 'stripe', 'paypal', 'cod'
  status: paymentStatusEnum("status").notNull().default("initiated"), // 'initiated', 'completed', 'failed'
  paidAt: timestamp("paid_at"),
  transactionId: text("transaction_id"), // External payment provider transaction ID
});

// Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// Zod schemas
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

// Type exports
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
