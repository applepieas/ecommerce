import { db } from "./index";
import {
  genders,
  colors,
  sizes,
  brands,
  categories,
  collections,
  products,
  productVariants,
  productImages,
  productCollections,
} from "./schema";
import * as fs from "fs";
import * as path from "path";

// ============================================
// Seed Data Definitions
// ============================================

const GENDERS = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Unisex", slug: "unisex" },
];

const COLORS = [
  { name: "Black", slug: "black", hexCode: "#000000" },
  { name: "White", slug: "white", hexCode: "#FFFFFF" },
  { name: "Red", slug: "red", hexCode: "#FF0000" },
  { name: "Blue", slug: "blue", hexCode: "#0066CC" },
  { name: "Green", slug: "green", hexCode: "#00AA00" },
  { name: "Grey", slug: "grey", hexCode: "#808080" },
  { name: "Orange", slug: "orange", hexCode: "#FF6600" },
  { name: "Pink", slug: "pink", hexCode: "#FF69B4" },
  { name: "Navy", slug: "navy", hexCode: "#001F3F" },
  { name: "Volt", slug: "volt", hexCode: "#CCFF00" },
];

const SIZES = [
  { name: "6", slug: "6", sortOrder: 1 },
  { name: "7", slug: "7", sortOrder: 2 },
  { name: "8", slug: "8", sortOrder: 3 },
  { name: "9", slug: "9", sortOrder: 4 },
  { name: "10", slug: "10", sortOrder: 5 },
  { name: "11", slug: "11", sortOrder: 6 },
  { name: "12", slug: "12", sortOrder: 7 },
  { name: "13", slug: "13", sortOrder: 8 },
];

const CATEGORIES = [
  { name: "Running", slug: "running" },
  { name: "Basketball", slug: "basketball" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Training", slug: "training" },
  { name: "Football", slug: "football" },
];

const COLLECTIONS = [
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Best Sellers", slug: "best-sellers" },
  { name: "Summer '25", slug: "summer-25" },
];

// Product names for Nike shoes
const NIKE_PRODUCTS = [
  { name: "Nike Air Max 90", category: "lifestyle", price: 130 },
  { name: "Nike Air Force 1 '07", category: "lifestyle", price: 110 },
  { name: "Nike Dunk Low", category: "lifestyle", price: 115 },
  { name: "Nike Pegasus 41", category: "running", price: 140 },
  { name: "Nike ZoomX Vaporfly NEXT%", category: "running", price: 250 },
  { name: "Nike Air Zoom Alphafly NEXT% 3", category: "running", price: 285 },
  { name: "Nike LeBron 21", category: "basketball", price: 200 },
  { name: "Nike KD 16", category: "basketball", price: 160 },
  { name: "Nike Air Jordan 1 Retro High OG", category: "basketball", price: 180 },
  { name: "Nike Metcon 9", category: "training", price: 150 },
  { name: "Nike Free Metcon 5", category: "training", price: 120 },
  { name: "Nike SuperRep Go 3", category: "training", price: 100 },
  { name: "Nike Mercurial Superfly 9", category: "football", price: 275 },
  { name: "Nike Phantom GX Elite", category: "football", price: 250 },
  { name: "Nike React Infinity Run 4", category: "running", price: 160 },
];

// Helper function to get random items from array
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper to generate SKU - includes product index for uniqueness
function generateSku(productIndex: number, productName: string, color: string, size: string): string {
  const prefix = productName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  const colorCode = color.slice(0, 2).toUpperCase();
  return `${prefix}${productIndex}-${colorCode}-${size}`;
}

// ============================================
// Main Seed Function
// ============================================

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Clean up existing data first
    console.log("🧹 Cleaning up existing data...");
    const { sql } = await import("drizzle-orm");
    await db.delete(productCollections);
    await db.delete(productImages);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(collections);
    await db.delete(categories);
    await db.delete(brands);
    await db.delete(sizes);
    await db.delete(colors);
    await db.delete(genders);
    console.log("   ✓ Existing data cleared\n");

    // Copy images from public/shoes to public/uploads/products
    console.log("📁 Copying product images...");
    const shoesDir = path.join(process.cwd(), "public/shoes");
    const uploadsDir = path.join(process.cwd(), "public/uploads/products");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get all image files
    const imageFiles = fs.readdirSync(shoesDir).filter((f) => !f.startsWith("."));
    for (const file of imageFiles) {
      const src = path.join(shoesDir, file);
      const dest = path.join(uploadsDir, file);
      fs.copyFileSync(src, dest);
    }
    console.log(`   ✓ Copied ${imageFiles.length} images to /public/uploads/products/\n`);

    // Seed Genders
    console.log("👥 Seeding genders...");
    const insertedGenders = await db.insert(genders).values(GENDERS).returning();
    console.log(`   ✓ Inserted ${insertedGenders.length} genders\n`);

    // Seed Colors
    console.log("🎨 Seeding colors...");
    const insertedColors = await db.insert(colors).values(COLORS).returning();
    console.log(`   ✓ Inserted ${insertedColors.length} colors\n`);

    // Seed Sizes
    console.log("📏 Seeding sizes...");
    const insertedSizes = await db.insert(sizes).values(SIZES).returning();
    console.log(`   ✓ Inserted ${insertedSizes.length} sizes\n`);

    // Seed Brand (Nike)
    console.log("🏷️  Seeding brand...");
    const insertedBrands = await db
      .insert(brands)
      .values([
        {
          name: "Nike",
          slug: "nike",
          logoUrl: "/logo.svg",
        },
      ])
      .returning();
    const nikeBrand = insertedBrands[0];
    console.log(`   ✓ Inserted Nike brand\n`);

    // Seed Categories
    console.log("📂 Seeding categories...");
    const insertedCategories = await db.insert(categories).values(CATEGORIES).returning();
    const categoryMap = new Map(insertedCategories.map((c) => [c.slug, c]));
    console.log(`   ✓ Inserted ${insertedCategories.length} categories\n`);

    // Seed Collections
    console.log("🗂️  Seeding collections...");
    const insertedCollections = await db.insert(collections).values(COLLECTIONS).returning();
    console.log(`   ✓ Inserted ${insertedCollections.length} collections\n`);

    // Seed Products
    console.log("👟 Seeding products...");
    let variantCount = 0;
    let imageCount = 0;

    for (let i = 0; i < NIKE_PRODUCTS.length; i++) {
      const productData = NIKE_PRODUCTS[i];
      const category = categoryMap.get(productData.category);
      const randomGender = insertedGenders[Math.floor(Math.random() * insertedGenders.length)];

      // Insert product
      const [product] = await db
        .insert(products)
        .values({
          name: productData.name,
          description: `The ${productData.name} delivers premium performance and style. Engineered with cutting-edge technology for ultimate comfort and durability.`,
          categoryId: category?.id,
          genderId: randomGender.id,
          brandId: nikeBrand.id,
          isPublished: true,
        })
        .returning();

      // Generate random variants (2-4 colors, 3-6 sizes each)
      const variantColors = getRandomItems(insertedColors, Math.floor(Math.random() * 3) + 2);
      const variantSizes = getRandomItems(insertedSizes, Math.floor(Math.random() * 4) + 3);

      let firstVariantId: string | null = null;

      for (const color of variantColors) {
        // Add image for this color variant
        const imageIndex = (i % imageFiles.length);
        const imageFile = imageFiles[imageIndex];

        const [image] = await db
          .insert(productImages)
          .values({
            productId: product.id,
            url: `/uploads/products/${imageFile}`,
            sortOrder: variantColors.indexOf(color),
            isPrimary: variantColors.indexOf(color) === 0,
          })
          .returning();
        imageCount++;

        for (const size of variantSizes) {
          const salePrice =
            Math.random() > 0.7
              ? (productData.price * (0.8 + Math.random() * 0.15)).toFixed(2)
              : null;

          const [variant] = await db
            .insert(productVariants)
            .values({
              productId: product.id,
              sku: generateSku(i, productData.name, color.slug, size.name),
              price: productData.price.toFixed(2),
              salePrice,
              colorId: color.id,
              sizeId: size.id,
              inStock: Math.floor(Math.random() * 50) + 5,
              weight: 0.3 + Math.random() * 0.4,
              dimensions: {
                length: 30 + Math.random() * 5,
                width: 10 + Math.random() * 3,
                height: 12 + Math.random() * 2,
              },
            })
            .returning();

          if (!firstVariantId) {
            firstVariantId = variant.id;
          }
          variantCount++;
        }
      }

      // Update product with default variant
      if (firstVariantId) {
        const { eq } = await import("drizzle-orm");
        await db
          .update(products)
          .set({ defaultVariantId: firstVariantId })
          .where(eq(products.id, product.id));
      }

      // Add to random collection(s)
      const productCollectionCount = Math.floor(Math.random() * 2) + 1;
      const randomCollections = getRandomItems(insertedCollections, productCollectionCount);
      for (const collection of randomCollections) {
        await db.insert(productCollections).values({
          productId: product.id,
          collectionId: collection.id,
        });
      }

      console.log(`   ✓ Created ${productData.name} with ${variantColors.length} colors, ${variantSizes.length} sizes`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   • ${NIKE_PRODUCTS.length} products created`);
    console.log(`   • ${variantCount} product variants created`);
    console.log(`   • ${imageCount} product images linked`);
    console.log(`   • ${insertedGenders.length} genders`);
    console.log(`   • ${insertedColors.length} colors`);
    console.log(`   • ${insertedSizes.length} sizes`);
    console.log(`   • ${insertedCategories.length} categories`);
    console.log(`   • ${insertedCollections.length} collections`);
    console.log(`\n✅ Database seeded successfully!`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
