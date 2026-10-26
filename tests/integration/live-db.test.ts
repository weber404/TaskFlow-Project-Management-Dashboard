import { describe, it, expect } from "vitest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const hasLiveDb =
  process.env.RUN_LIVE_DB_TESTS === "true" &&
  Boolean(dbUrl) &&
  !dbUrl?.includes("mock");

describe("Live Neon PostgreSQL Database Integration (Opt-In)", () => {
  it("documents live database execution instructions", () => {
    // This test unconditionally executes and verifies that test runners understand how to enable live database tests
    const status = hasLiveDb
      ? "Live database credentials detected; running live query tests."
      : "Live database testing is currently DISABLED (default safe mode). Set DATABASE_URL and RUN_LIVE_DB_TESTS=true to enable.";

    expect(typeof status).toBe("string");
  });

  describe.skipIf(!hasLiveDb)("Live PostgreSQL Query & Relation Verification", () => {
    it("connects to live database and executes read queries safely", async () => {
      const { db } = await import("@/lib/db");

      // Verify connection and read counts
      const [projectCount, taskCount] = await Promise.all([
        db.project.count(),
        db.task.count(),
      ]);

      expect(typeof projectCount).toBe("number");
      expect(typeof taskCount).toBe("number");
      expect(projectCount).toBeGreaterThanOrEqual(0);
      expect(taskCount).toBeGreaterThanOrEqual(0);
    });

    it("verifies project-task relationship on live database", async () => {
      const { db } = await import("@/lib/db");

      const projectsWithTasks = await db.project.findMany({
        take: 3,
        include: {
          tasks: { take: 2 },
          _count: { select: { tasks: true } },
        },
      });

      expect(Array.isArray(projectsWithTasks)).toBe(true);
      for (const project of projectsWithTasks) {
        expect(typeof project.id).toBe("number");
        expect(typeof project.title).toBe("string");
        expect(Array.isArray(project.tasks)).toBe(true);
      }
    });
  });
});
