import { z } from "zod";

export const deliveryAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export const createOrderSchema = z.object({
  deliveryAddress: deliveryAddressSchema,
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.string().min(1, "Payment method is required"),
  guestEmail: z.string().email().optional(),
  createAccount: z.boolean().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
