import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_DIRECT_URL && !process.env.DATABASE_URL) {
  try {
    loadEnvFile("../../.env");
  } catch {
    // CI and production inject environment variables instead of a local file.
  }
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_DIRECT_URL
      ?? process.env.DATABASE_URL
      ?? "postgresql://lifelang:lifelang@localhost:5432/lifelang"
  }
});
