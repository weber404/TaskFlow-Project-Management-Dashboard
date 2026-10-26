import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getDashboardStats } from "@/app/api/dashboard/stats/route";

// Mock the Prisma db client
vi.mock("@/lib/db", () => {
  return {
    ProjectStatus: {
      ACTIVE: "ACTIVE",
      COMPLETED: "COMPLETED",
      ON_HOLD: "ON_HOLD",
    },
    TaskStatus: {
      PENDING: "PENDING",
      IN_PROGRESS: "IN_PROGRESS",
      COMPLETED: "COMPLETED",
    },
    db: {
      project: {
        count: vi.fn(),
      },
      task: {
        count: vi.fn(),
      },
    },
  };
});

import { db } from "@/lib/db";

describe("Dashboard Stats API Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates real database-backed metrics matching expected seed values", async () => {
    // Mock the 9 count queries executed in Promise.all
    (db.project.count as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(10) // totalProjects
      .mockResolvedValueOnce(6)  // activeProjects
      .mockResolvedValueOnce(2)  // completedProjects
      .mockResolvedValueOnce(2)  // onHoldProjects
      .mockResolvedValueOnce(5); // overdueProjects (simulated)

    (db.task.count as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(20) // totalTasks
      .mockResolvedValueOnce(6)  // completedTasks
      .mockResolvedValueOnce(9)  // pendingTasks
      .mockResolvedValueOnce(5); // inProgressTasks

    const res = await getDashboardStats();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      totalProjects: 10,
      activeProjects: 6,
      completedProjects: 2,
      onHoldProjects: 2,
      overdueProjects: 5,
      totalTasks: 20,
      completedTasks: 6,
      pendingTasks: 9,
      inProgressTasks: 5,
    });

    // Verify distinct counts for Pending vs In Progress
    expect(json.data.pendingTasks).toBe(9);
    expect(json.data.inProgressTasks).toBe(5);
    expect(json.data.pendingTasks).not.toBe(json.data.inProgressTasks);

    // Verify overdue calculation query excludes COMPLETED projects
    expect(db.project.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { not: "COMPLETED" },
          deadline: expect.objectContaining({ lt: expect.any(Date) }),
        }),
      })
    );
  });

  it("returns zero metrics accurately when database contains zero projects and zero tasks", async () => {
    (db.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (db.task.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const res = await getDashboardStats();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      overdueProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
    });
  });

  it("handles database connection error gracefully", async () => {
    (db.project.count as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Can't reach database server at `ep-example.us-east-2.aws.neon.tech`")
    );

    const res = await getDashboardStats();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain("Database connection unavailable");
  });
});

