import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ProjectStatus, TaskStatus } from "@/types";

interface RawProject {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
}

interface RawTask {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
}

interface RawSeedData {
  projects: RawProject[];
  tasks: RawTask[];
}

const PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  Active: ProjectStatus.ACTIVE,
  Completed: ProjectStatus.COMPLETED,
  "On Hold": ProjectStatus.ON_HOLD,
};

const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  Pending: TaskStatus.PENDING,
  "In Progress": TaskStatus.IN_PROGRESS,
  Completed: TaskStatus.COMPLETED,
};

describe("Seed Data Integrity & Safety Audit", () => {
  const seedPath = path.resolve(process.cwd(), "prisma/seed-data.json");
  const rawData: RawSeedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  it("contains exactly 10 projects and 20 tasks", () => {
    expect(rawData.projects).toHaveLength(10);
    expect(rawData.tasks).toHaveLength(20);
  });

  it("verifies unique IDs and valid schema types for all projects", () => {
    const projectIds = new Set<number>();

    for (const project of rawData.projects) {
      expect(typeof project.id).toBe("number");
      expect(project.id).toBeGreaterThan(0);
      expect(projectIds.has(project.id)).toBe(false);
      projectIds.add(project.id);

      expect(typeof project.title).toBe("string");
      expect(project.title.trim().length).toBeGreaterThan(0);
      expect(project.title.length).toBeLessThanOrEqual(200);

      expect(typeof project.description).toBe("string");
      expect(project.description.length).toBeLessThanOrEqual(2000);

      expect(PROJECT_STATUS_MAP[project.status]).toBeDefined();

      if (project.deadline) {
        expect(project.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const parsed = new Date(`${project.deadline}T00:00:00.000Z`);
        expect(isNaN(parsed.getTime())).toBe(false);
      }
    }

    expect(projectIds.size).toBe(10);
  });

  it("verifies all tasks have unique IDs and valid references to existing projects", () => {
    const projectIds = new Set(rawData.projects.map((p) => p.id));
    const taskIds = new Set<number>();

    for (const task of rawData.tasks) {
      expect(typeof task.id).toBe("number");
      expect(task.id).toBeGreaterThan(0);
      expect(taskIds.has(task.id)).toBe(false);
      taskIds.add(task.id);

      expect(typeof task.title).toBe("string");
      expect(task.title.trim().length).toBeGreaterThan(0);
      expect(task.title.length).toBeLessThanOrEqual(200);

      expect(TASK_STATUS_MAP[task.status]).toBeDefined();

      // Referential integrity check: task's projectId must point to a seeded project
      expect(projectIds.has(task.projectId)).toBe(true);
    }

    expect(taskIds.size).toBe(20);
  });

  it("ensures project IDs match the canonical sequence [1..10]", () => {
    const ids = rawData.projects.map((p) => p.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("verifies project statuses in seed-data.json strictly map to ACTIVE, COMPLETED, or ON_HOLD", () => {
    const validRawStatuses = new Set(["Active", "Completed", "On Hold"]);
    const expectedDbStatuses = new Set([ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.ON_HOLD]);

    for (const project of rawData.projects) {
      expect(validRawStatuses.has(project.status)).toBe(true);
      const mapped = PROJECT_STATUS_MAP[project.status];
      expect(expectedDbStatuses.has(mapped)).toBe(true);
    }
  });

  it("verifies task statuses in seed-data.json strictly map to PENDING, IN_PROGRESS, or COMPLETED", () => {
    const validRawStatuses = new Set(["Pending", "In Progress", "Completed"]);
    const expectedDbStatuses = new Set([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]);

    for (const task of rawData.tasks) {
      expect(validRawStatuses.has(task.status)).toBe(true);
      const mapped = TASK_STATUS_MAP[task.status];
      expect(expectedDbStatuses.has(mapped)).toBe(true);
    }
  });
});
