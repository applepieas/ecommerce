import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

function createDb() {
  if (!databaseUrl) {
    console.warn(
      "⚠️ DATABASE_URL is not set. Database operations will fail."
    );
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

export const db = createDb();
