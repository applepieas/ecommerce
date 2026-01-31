"use server";

import { db } from "@/lib/db";
import { orders, orderItems, user, productVariants } from "@/lib/db/schema";
import { getCart, clearCart } from "@/lib/actions/cart";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Assuming auth is exported from here
import { headers } from "next/headers";

// ============================================
// Types & Schemas
// ============================================

import { createOrderSchema, CreateOrderInput } from "@/lib/validations/order";

// Delivery costs (hardcoded for now)
const DELIVERY_COSTS = {
  standard: 500, // $5.00 in cents if using cents, but schema uses numeric(10, 2)
  express: 1500, // $15.00
};

// ============================================
// Actions
// ============================================

export async function createOrder(data: CreateOrderInput) {
  try {
    // 1. Validation
    const validated = createOrderSchema.parse(data);

    // 2. Get Cart
    const cart = await getCart();
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // 3. Get User (if logged in)
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;

    if (!userId && !validated.guestEmail) {
      return { success: false, error: "Email is required for guest checkout" };
    }

    // 4. Calculate Totals
    // Note: cart.subtotal is already calculated in getCart (assuming it returns number)
    // If it returns float from DB, ensure we handle it correctly.
    // Let's assume cart.subtotal is a number.

    // Fix: Delivery costs should be consistent with DB numeric type (strings or numbers)
    // The schema uses numeric(10,2), so we treat them as typical floats/decimals.
    const shippingPrice = validated.deliveryMethod === "express" ? 15.00 : 5.00;
    const subtotal = cart.subtotal;
    const totalAmount = subtotal + shippingPrice;

    // 5. Handle Account Creation (Optional - Future)
    // If validated.createAccount is true, we would check if user exists or create one.
    // For now, we'll stick to basic order creation.
    // If we were creating a user, we'd do it here and update userId.

    // 6. Create Order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: userId || null, // Ensure explicit null if undefined
        guestEmail: userId ? null : validated.guestEmail, // Only store guest email if no user
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        subtotal: subtotal.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        deliveryMethod: validated.deliveryMethod,
        paymentMethod: validated.paymentMethod,
        deliveryAddress: validated.deliveryAddress,
        // We'll leave shipping/billing IDs null for now as we use the JSON snapshot
      })
      .returning({ id: orders.id });

    // 7. Create Order Items
    const orderItemsValues = cart.items.map((item) => ({
      orderId: newOrder.id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toFixed(2), // Snapshot price
    }));

    await db.insert(orderItems).values(orderItemsValues);

    // 8. Clear Cart
    await clearCart();

    // Return success (client will redirect)
    return { success: true, orderId: newOrder.id };

  } catch (error) {
    console.error("Create Order Error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data", details: error.issues };
    }
    return { success: false, error: "Failed to place order" };
  }
}

export async function getOrder(orderId: string) {
  try {
    const order = await (db as any).query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: {
                  with: {
                    images: true
                  }
                },
                color: true,
                size: true
              }
            }
          }
        }
      }
    });

    if (!order) return null;

    return order;
  } catch (error) {
    console.error("Get Order Error:", error);
    return null;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const userOrders = await (db as any).query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: {
                  with: {
                    images: true
                  }
                },
                color: true,
                size: true
              }
            }
          }
        }
      },
      orderBy: (orders: any, { desc }: any) => [desc(orders.createdAt)],
    });

    return userOrders;
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return [];
  }
}
