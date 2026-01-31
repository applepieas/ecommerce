"use server";

import { db } from "@/lib/db";
import { wishlists, products, productImages, productVariants } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/utils";
import { revalidatePath } from "next/cache";

export async function addToWishlist({
  productId,
  variantId
}: {
  productId: string;
  variantId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to add items to your wishlist." };
  }

  try {
    // Check if already in wishlist
    const whereClause = variantId
      ? and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId),
        eq(wishlists.variantId, variantId)
      )
      : and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId)
      );

    const existing = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(whereClause)
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: "Already in wishlist" };
    }

    await db.insert(wishlists).values({
      userId: user.id,
      productId,
      variantId,
    });

    revalidatePath("/profile");
    revalidatePath("/products/[id]"); // Revalidate product pages

    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { error: "Failed to add item to wishlist." };
  }
}

export async function removeFromWishlist({
  productId,
  variantId
}: {
  productId: string;
  variantId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const whereClause = variantId
      ? and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId),
        eq(wishlists.variantId, variantId)
      )
      : and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId)
      );

    await db.delete(wishlists).where(whereClause);
    console.log(`[removeFromWishlist] Deleted item for user ${user.id}`);

    revalidatePath("/profile");
    revalidatePath("/", "layout"); // Revalidate everything to be safe
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { error: "Failed to remove item from wishlist." };
  }
}

export async function getWishlist(userId: string) {
  try {
    // Use type casting to avoid TypeScript inference issues with deep relations
    // The runtime behavior is correct as verified
    const items = await (db.query as any).wishlists.findMany({
      where: eq(wishlists.userId, userId),
      with: {
        product: {
          with: {
            images: {
              limit: 1,
              orderBy: (images: any, { asc }: any) => [asc(images.sortOrder)],
            },
            variants: {
              limit: 1,
            },
          },
        },
        variant: {
          with: {
            color: true,
            size: true
          }
        }
      },
      orderBy: [desc(wishlists.addedAt)],
    });

    console.log(`[getWishlist] Fetched ${items.length} items for user ${userId}`);
    return items;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function getWishlistCount(userId: string) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    return Number(result[0]?.count || 0);
  } catch (error) {
    return 0;
  }
}

export async function isInWishlist({
  productId,
  variantId,
  userId
}: {
  productId: string;
  variantId?: string;
  userId?: string;
}) {
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return false;
    userId = user.id;
  }

  try {
    const whereClause = variantId
      ? and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId),
        eq(wishlists.variantId, variantId)
      )
      : and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      );

    const item = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(whereClause)
      .limit(1);

    return item.length > 0;
  } catch (error) {
    return false;
  }
}
