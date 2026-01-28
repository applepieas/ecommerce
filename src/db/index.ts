import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

// Create a factory function to get the db instance
function createDb() {
  if (!databaseUrl) {
    console.warn(
      "⚠️ DATABASE_URL is not set. Database operations will fail."
    );
    // Return a proxy that throws helpful errors
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Please add your Neon connection string to .env.local"
        );
      },
    });
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Create Drizzle database instance with schema
export const db = createDb();
