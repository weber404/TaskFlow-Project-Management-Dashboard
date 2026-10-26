import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { defineConfig, env } from "prisma/config";

const dbUrlKey = process.env.DATABASE_URL_UNPOOLED
  ? "DATABASE_URL_UNPOOLED"
  : process.env.DATABASE_URL
    ? "DATABASE_URL"
    : "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: dbUrlKey ? env(dbUrlKey) : "",
  },
});

