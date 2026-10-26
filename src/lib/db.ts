import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

// Re-export generated types and enums for convenience
export * from "../../prisma/generated/client";

// Global singleton to prevent connection leaks during Next.js hot-reloading in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

  if (!connectionString) {
    // Fallback adapter configuration if DATABASE_URL is not configured yet.
    // Client instantiation succeeds; queries will report connection error when executed without valid credentials.
    const fallbackAdapter = new PrismaPg({
      connectionString: "postgresql://user:password@localhost:5432/taskflow_placeholder",
    });
    return new PrismaClient({ adapter: fallbackAdapter });
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
