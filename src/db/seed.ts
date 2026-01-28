import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products } from "../lib/db/schema";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const nikeProducts = [
  {
    name: "Nike Air Max 90",
    description:
      "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.",
    price: "130.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-max-90-shoes-N7Tbw0.png",
    category: "Running",
  },
  {
    name: "Nike Air Force 1 '07",
    description:
      "The radiance lives on in the Nike Air Force 1 '07, the basketball original that puts a fresh spin on what you know best.",
    price: "115.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png",
    category: "Lifestyle",
  },
  {
    name: "Nike Dunk Low",
    description:
      "Created for the hardwood but taken to the streets, the Nike Dunk Low returns with crisp overlays and original team colors.",
    price: "115.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/af407478-5e4e-4d15-a50e-e5c9e310f6d4/dunk-low-shoes-N8m6fC.png",
    category: "Lifestyle",
  },
  {
    name: "Air Jordan 1 Retro High OG",
    description:
      "The Air Jordan 1 Retro High remakes the classic sneaker with new colors, blocking and materials.",
    price: "180.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f6638d5d-7484-4b8c-9e37-7a8f6b2f6e63/air-jordan-1-retro-high-og-shoes-X5vM0M.png",
    category: "Jordan",
  },
  {
    name: "Nike Blazer Mid '77 Vintage",
    description:
      "In the '70s, Nike was the new kid on the block. The Nike Blazer Mid '77 Vintage harks back to Nike's humble beginnings.",
    price: "105.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/fb7eda3c-5ac8-4d05-a18f-1c2c5e82e36e/blazer-mid-77-vintage-shoes-CBF52v.png",
    category: "Lifestyle",
  },
  {
    name: "Nike Pegasus 41",
    description:
      "Responsive satisfying running with a snappy feel. The Pegasus 41 provides comfort for your everyday run.",
    price: "140.00",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/fb8d437e-1fc5-401a-bdd7-8e898b0cc8d4/pegasus-41-road-running-shoes-YpxyCD.png",
    category: "Running",
  },
];

async function seed() {
  console.log("🌱 Seeding database with Nike products...");

  try {
    // Insert all products
    await db.insert(products).values(nikeProducts);
    console.log(`✅ Successfully seeded ${nikeProducts.length} Nike products!`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
