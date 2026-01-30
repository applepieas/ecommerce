"use server";

import { db } from "@/lib/db";
import {
  carts,
  cartItems,
  productVariants,
  products,
  productImages,
  colors,
  sizes,
  guest,
} from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ============================================
// Types
// ============================================

export interface CartItemDTO {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string; // e.g. "Space Grey / M"
  price: number;
  salePrice: number | null;
  imageUrl: string;
  quantity: number;
  maxStock: number;
  colorName: string | null;
  sizeName: string | null;
}

export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  subtotal: number;
  totalQuantity: number;
}

// ============================================
// Helpers
// ============================================

const COOKIE_CART_ID = "cart_id";
const SCRIPT_COOKIE_CART_ID = "cart_id"; // Same for now

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_CART_ID)?.value;
}

async function createGuestCart(): Promise<string> {
  // Check if we already have a guest entry or just create a cart with guestId?
  // The schema has guestId FK to guest table.
  // For simplicity relative to the plan, if we don't have a guest system ensuring
  // valid guest IDs for every anonymous user, we might need a workaround or
  // ensure we create a guest record first.

  // Let's assume for this plan we use the 'carts' table which allows nullable userId.
  // But wait, the schema says:
  // userId: uuid("user_id").references(() => user.id)
  // guestId: uuid("guest_id").references(() => guest.id)
  // We need a valid guest record if we use guestId.

  // Actually, checking the schema again:
  // export const guest = pgTable("guest", { ... })
  // We should create a guest record first.

  // 1. Create Guest Record
  // We'll generate a random session token for the guest
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const [newGuest] = await db
    .insert(guest)
    .values({
      sessionToken,
      expiresAt,
    })
    .returning({ id: guest.id });

  // 2. Create Cart linked to Guest
  const [newCart] = await db
    .insert(carts)
    .values({
      guestId: newGuest.id,
    })
    .returning({ id: carts.id });

  // 3. Set Cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CART_ID, newCart.id, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return newCart.id;
}

// ============================================
// Actions
// ============================================

export async function getCart(): Promise<CartDTO | null> {
  try {
    const cartId = await getCartId();
    if (!cartId) return null;

    // Fetch cart to verify existence
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    if (!cart) return null;

    // Fetch Items with Product & Variant details
    // We need: Product Name, Price, Variant Info (Color/Size), Image
    // Join: cartItems -> productVariants -> products
    //       productVariants -> colors, sizes
    //       products -> productImages (primary)

    // Note: This is a complex join. Drizzle's query builder is nice here.
    const itemsData = await db
      .select({
        id: cartItems.id,
        productId: productVariants.productId,
        variantId: cartItems.productVariantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
        inStock: productVariants.inStock,
        productName: products.name,
        colorName: colors.name,
        sizeName: sizes.name,
        imageUrl: sql<string>`(
          SELECT url FROM ${productImages} 
          WHERE ${productImages.productId} = ${products.id} 
          AND (${productImages.variantId} = ${productVariants.id} OR ${productImages.variantId} IS NULL)
          ORDER BY ${productImages.isPrimary} DESC, ${productImages.sortOrder} ASC
          LIMIT 1
        )`,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(colors, eq(productVariants.colorId, colors.id))
      .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .where(eq(cartItems.cartId, cartId))
      .orderBy(desc(cartItems.id)); // Newest added first? Or consistent order? id desc is fine.

    // Transform to DTO
    let subtotal = 0;
    let totalQuantity = 0;

    const items: CartItemDTO[] = itemsData.map((item) => {
      const price = parseFloat(item.price);
      const salePrice = item.salePrice ? parseFloat(item.salePrice) : null;
      const effectivePrice = salePrice ?? price;

      subtotal += effectivePrice * item.quantity;
      totalQuantity += item.quantity;

      // Construct variant name
      const parts = [];
      if (item.colorName) parts.push(item.colorName);
      if (item.sizeName) parts.push(item.sizeName);
      const variantName = parts.join(" / ") || "Standard";

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName,
        price,
        salePrice,
        imageUrl: item.imageUrl || "/placeholder.jpg",
        quantity: item.quantity,
        maxStock: item.inStock,
        colorName: item.colorName,
        sizeName: item.sizeName,
      };
    });

    return {
      id: cart.id,
      items,
      subtotal,
      totalQuantity,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function addToCart({
  productId,
  variantId,
  quantity,
}: {
  productId: string;
  variantId: string;
  quantity: number;
}): Promise<void> {
  try {
    let cartId = await getCartId();

    if (!cartId) {
      cartId = await createGuestCart();
    }

    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productVariantId, variantId)
        )
      )
      .limit(1);

    if (existingItem) {
      await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId,
        productVariantId: variantId,
        quantity,
      });
    }

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
}

export async function updateCartItemQuantity({
  cartItemId,
  quantity,
}: {
  cartItemId: string;
  quantity: number;
}): Promise<void> {
  try {
    const cartId = await getCartId();
    if (!cartId) return;

    // Ensure user owns this cart item (by checking cartId linkage)
    // Implicitly handled by finding item in cart?
    // Safer:
    const [item] = await db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)))
      .limit(1);

    if (!item) return;

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, cartItemId));
    }

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error("Failed to update cart item");
  }
}

export async function removeFromCart({
  cartItemId,
}: {
  cartItemId: string;
}): Promise<void> {
  try {
    const cartId = await getCartId();
    if (!cartId) return;

    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error("Failed to remove item from cart");
  }
}

export async function clearCart(): Promise<void> {
  try {
    const cartId = await getCartId();
    if (!cartId) return;

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}
