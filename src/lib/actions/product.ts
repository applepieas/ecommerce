"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productImages,
  categories,
  genders,
  colors,
  sizes,
  brands,
} from "@/lib/db/schema";
import { eq, and, inArray, or, ilike, sql, desc, asc, SQL, gte, lte } from "drizzle-orm";
import type { ProductFilters } from "@/lib/utils/query";
import { PRICE_RANGES, ITEMS_PER_PAGE } from "@/lib/utils/query";

// ============================================
// Types
// ============================================

export interface ProductCardData {
  id: string;
  name: string;
  categoryName: string;
  brandName: string | null;
  price: number; // minPrice from variants
  salePrice: number | null;
  imageUrl: string;
  colorCount: number;
  badge?: string;
}

export interface GetAllProductsResult {
  products: ProductCardData[];
  totalCount: number;
  totalPages: number;
}

export interface ProductDetailData {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
  gender: { id: string; slug: string; label: string } | null;
  variants: Array<{
    id: string;
    sku: string;
    price: string;
    salePrice: string | null;
    inStock: number;
    color: { id: string; slug: string; name: string; hexCode: string } | null;
    size: { id: string; slug: string; name: string } | null;
  }>;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
    variantId: string | null;
  }>;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build WHERE conditions for product filtering
 */
function buildWhereConditions(filters: ProductFilters): SQL[] {
  const conditions: SQL[] = [];

  // Always filter for published products
  conditions.push(eq(products.isPublished, true));

  // Search filter
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(products.name, searchTerm),
        ilike(products.description, searchTerm)
      )!
    );
  }

  // Gender filter
  if (filters.gender.length > 0) {
    const genderConditions = db
      .select({ id: genders.id })
      .from(genders)
      .where(inArray(genders.slug, filters.gender));

    conditions.push(
      inArray(products.genderId, genderConditions)
    );
  }

  // Brand filter
  if (filters.brand.length > 0) {
    const brandConditions = db
      .select({ id: brands.id })
      .from(brands)
      .where(inArray(brands.slug, filters.brand));

    conditions.push(
      inArray(products.brandId, brandConditions)
    );
  }

  // Category filter
  if (filters.category.length > 0) {
    const categoryConditions = db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.slug, filters.category));

    conditions.push(
      inArray(products.categoryId, categoryConditions)
    );
  }

  // Color filter - products must have variants with specified colors
  if (filters.color.length > 0) {
    const colorIds = db
      .select({ id: colors.id })
      .from(colors)
      .where(inArray(colors.slug, filters.color));

    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
        AND ${productVariants.colorId} IN ${colorIds}
      )`
    );
  }

  // Size filter - products must have variants with specified sizes
  if (filters.size.length > 0) {
    const sizeIds = db
      .select({ id: sizes.id })
      .from(sizes)
      .where(inArray(sizes.slug, filters.size));

    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
        AND ${productVariants.sizeId} IN ${sizeIds}
      )`
    );
  }

  return conditions;
}

/**
 * Build ORDER BY clause based on sort option
 */
function buildOrderBy(sortBy: string): SQL {
  switch (sortBy) {
    case "price_asc":
      return sql`MIN(CAST(COALESCE(${productVariants.salePrice}, ${productVariants.price}) AS DECIMAL)) ASC`;
    case "price_desc":
      return sql`MIN(CAST(COALESCE(${productVariants.salePrice}, ${productVariants.price}) AS DECIMAL)) DESC`;
    case "newest":
      return desc(products.createdAt);
    case "featured":
    default:
      // Featured: could be based on sales, ratings, etc. For now, newest first
      return desc(products.createdAt);
  }
}

/**
 * Get image URL for a product (color-specific or generic)
 */
async function getProductImage(productId: string, colorFilter?: string[]): Promise<string> {
  if (colorFilter && colorFilter.length > 0) {
    // Get color-specific image for the first filtered color
    const colorIds = await db
      .select({ id: colors.id })
      .from(colors)
      .where(inArray(colors.slug, colorFilter))
      .limit(1);

    if (colorIds.length > 0) {
      const colorId = colorIds[0].id;

      // Get variant IDs for this product with the specified color
      const variantIds = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, productId),
            eq(productVariants.colorId, colorId)
          )
        );

      if (variantIds.length > 0) {
        const image = await db
          .select({ url: productImages.url })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, productId),
              inArray(productImages.variantId, variantIds.map(v => v.id))
            )
          )
          .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
          .limit(1);

        if (image.length > 0) return image[0].url;
      }
    }
  }

  // Fallback: get generic image (variantId is NULL)
  const genericImage = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(
      and(
        eq(productImages.productId, productId),
        sql`${productImages.variantId} IS NULL`
      )
    )
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
    .limit(1);

  if (genericImage.length > 0) return genericImage[0].url;

  // Last fallback: any image for this product
  const anyImage = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
    .limit(1);

  return anyImage.length > 0 ? anyImage[0].url : "/shoes/shoe-1.jpg";
}

// ============================================
// Main Functions
// ============================================

/**
 * Get all products with filtering, sorting, and pagination
 */
export async function getAllProducts(
  filters: ProductFilters
): Promise<GetAllProductsResult> {
  try {
    const whereConditions = buildWhereConditions(filters);
    const limit = filters.limit || ITEMS_PER_PAGE;
    const offset = (filters.page - 1) * limit;

    // Main query with aggregations
    const productsQuery = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        brandId: products.brandId,
        genderId: products.genderId,
        createdAt: products.createdAt,
        categoryName: categories.name,
        brandName: brands.name,
        genderLabel: genders.label,
        minPrice: sql<string>`MIN(CAST(${productVariants.price} AS DECIMAL))`,
        maxPrice: sql<string>`MAX(CAST(${productVariants.price} AS DECIMAL))`,
        hasSalePrice: sql<boolean>`MAX(CASE WHEN ${productVariants.salePrice} IS NOT NULL THEN 1 ELSE 0 END) = 1`,
        minSalePrice: sql<string>`MIN(CAST(${productVariants.salePrice} AS DECIMAL))`,
        minEffectivePrice: sql<string>`MIN(CAST(COALESCE(${productVariants.salePrice}, ${productVariants.price}) AS DECIMAL))`,
        colorCount: sql<number>`COUNT(DISTINCT ${productVariants.colorId})`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(genders, eq(products.genderId, genders.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...whereConditions))
      .groupBy(
        products.id,
        products.name,
        products.description,
        products.categoryId,
        products.brandId,
        products.genderId,
        products.createdAt,
        categories.name,
        brands.name,
        genders.label
      )
      .orderBy(buildOrderBy(filters.sort))
      .limit(limit)
      .offset(offset);

    // Price range filter (applied after aggregation)
    if (filters.priceRange.length > 0) {
      const priceConditions: SQL[] = [];

      for (const rangeValue of filters.priceRange) {
        const range = PRICE_RANGES.find((r) => r.value === rangeValue);
        if (range) {
          if (range.max === Infinity) {
            priceConditions.push(
              sql`MIN(CAST(${productVariants.price} AS DECIMAL)) >= ${range.min}`
            );
          } else {
            priceConditions.push(
              sql`MIN(CAST(${productVariants.price} AS DECIMAL)) >= ${range.min} AND MIN(CAST(${productVariants.price} AS DECIMAL)) <= ${range.max}`
            );
          }
        }
      }

      if (priceConditions.length > 0) {
        // Need to wrap in a HAVING clause - this is a limitation, we'll filter in JS instead
        // For now, we'll fetch all and filter
      }
    }

    const productResults = await productsQuery;

    // Apply price range filtering in JavaScript
    let filteredResults = productResults;
    if (filters.priceRange.length > 0) {
      filteredResults = productResults.filter((p) => {
        const price = parseFloat(p.minEffectivePrice);
        return filters.priceRange.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return price >= range.min && price <= range.max;
        });
      });
    }

    // Get total count (without pagination)
    const countQuery = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...whereConditions));

    let totalCount = countQuery[0]?.count || 0;

    // Adjust count if price filtering was applied
    if (filters.priceRange.length > 0) {
      totalCount = filteredResults.length;
    }

    // Fetch images for all products
    const productsWithImages: ProductCardData[] = await Promise.all(
      filteredResults.map(async (product) => {
        const imageUrl = await getProductImage(product.id, filters.color);

        // Determine price (use salePrice if available)
        const price = parseFloat(product.minEffectivePrice);

        const salePrice = product.hasSalePrice && product.minSalePrice
          ? parseFloat(product.minSalePrice)
          : null;

        return {
          id: product.id,
          name: product.name,
          categoryName: product.categoryName || "Shoes",
          brandName: product.brandName,
          price,
          salePrice,
          imageUrl,
          colorCount: product.colorCount || 1,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products: productsWithImages,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      totalCount: 0,
      totalPages: 0,
    };
  }
}

/**
 * Get a single product with full details
 */
export async function getProduct(productId: string): Promise<ProductDetailData | null> {
  try {
    // Fetch product with category, brand, and gender using joins
    const productResult = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isPublished: products.isPublished,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        brandId: products.brandId,
        genderId: products.genderId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        brandName: brands.name,
        brandSlug: brands.slug,
        brandLogoUrl: brands.logoUrl,
        genderSlug: genders.slug,
        genderLabel: genders.label,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(genders, eq(products.genderId, genders.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (productResult.length === 0) return null;
    const product = productResult[0];

    // Fetch variants with their relations
    const variantsData = await db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
        inStock: productVariants.inStock,
        colorId: productVariants.colorId,
        sizeId: productVariants.sizeId,
        colorSlug: colors.slug,
        colorName: colors.name,
        colorHexCode: colors.hexCode,
        sizeSlug: sizes.slug,
        sizeName: sizes.name,
      })
      .from(productVariants)
      .leftJoin(colors, eq(productVariants.colorId, colors.id))
      .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .where(eq(productVariants.productId, productId));

    // Fetch all images
    const imagesData = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    // Transform variants
    const variants = variantsData.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      inStock: v.inStock,
      color: v.colorId
        ? {
          id: v.colorId,
          slug: v.colorSlug!,
          name: v.colorName!,
          hexCode: v.colorHexCode!,
        }
        : null,
      size: v.sizeId
        ? {
          id: v.sizeId,
          slug: v.sizeSlug!,
          name: v.sizeName!,
        }
        : null,
    }));

    // Transform images
    const images = imagesData.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      variantId: img.variantId,
    }));

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      isPublished: product.isPublished,
      createdAt: product.createdAt,
      category: product.categoryId
        ? {
          id: product.categoryId,
          name: product.categoryName!,
          slug: product.categorySlug!,
        }
        : null,
      brand: product.brandId
        ? {
          id: product.brandId,
          name: product.brandName!,
          slug: product.brandSlug!,
          logoUrl: product.brandLogoUrl,
        }
        : null,
      gender: product.genderId
        ? {
          id: product.genderId,
          slug: product.genderSlug!,
          label: product.genderLabel!,
        }
        : null,
      variants,
      images,
    };
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}

/**
 * Get related products (for "You Might Also Like" section)
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  genderId: string | null,
  limit: number = 4
): Promise<ProductCardData[]> {
  try {
    // 1. Build scoring expression for relevance
    // Score 3: Same Category AND Same Gender
    // Score 2: Same Category
    // Score 1: Same Gender
    const relevanceScore = sql<number>`(
      (CASE WHEN ${products.categoryId} = ${categoryId} THEN 2 ELSE 0 END) +
      (CASE WHEN ${products.genderId} = ${genderId} THEN 1 ELSE 0 END)
    )`;

    // 2. Fetch products with relevance > 0
    const relatedQuery = await db
      .select({
        id: products.id,
        name: products.name,
        categoryName: categories.name,
        brandName: brands.name,
        minEffectivePrice: sql<string>`MIN(CAST(COALESCE(${productVariants.salePrice}, ${productVariants.price}) AS DECIMAL))`,
        hasSalePrice: sql<boolean>`MAX(CASE WHEN ${productVariants.salePrice} IS NOT NULL THEN 1 ELSE 0 END) = 1`,
        minSalePrice: sql<string>`MIN(CAST(${productVariants.salePrice} AS DECIMAL))`,
        colorCount: sql<number>`COUNT(DISTINCT ${productVariants.colorId})`,
        score: relevanceScore,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(products.isPublished, true),
          sql`${products.id} != ${productId}`,
          or(
            categoryId ? eq(products.categoryId, categoryId) : undefined,
            genderId ? eq(products.genderId, genderId) : undefined
          )
        )
      )
      .groupBy(products.id, products.name, categories.name, brands.name, relevanceScore)
      .orderBy(desc(relevanceScore))
      .limit(limit);

    // 3. Fetch images for these products
    const relatedWithImages: ProductCardData[] = await Promise.all(
      relatedQuery.map(async (product) => {
        const image = await db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
          .limit(1);

        return {
          id: product.id,
          name: product.name,
          categoryName: product.categoryName || "Shoes",
          brandName: product.brandName,
          price: parseFloat(product.minEffectivePrice),
          salePrice: product.hasSalePrice && product.minSalePrice
            ? parseFloat(product.minSalePrice)
            : null,
          imageUrl: image[0]?.url || "/shoes/shoe-1.jpg",
          colorCount: product.colorCount || 1,
        };
      })
    );

    return relatedWithImages;
  } catch (error) {
    console.error(`Failed to fetch related products:`, error);
    return [];
  }
}
