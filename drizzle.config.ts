import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load .env.local automatically — load it explicitly
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use unpooled connection for migrations (direct connection to Neon)
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});

