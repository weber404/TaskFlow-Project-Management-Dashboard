import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from "@/schemas/project.schema";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "@/schemas/task.schema";
import { ProjectStatus, TaskStatus } from "@/lib/db";

describe("Project Validation Schemas", () => {
  it("validates valid project creation payload", () => {
    const valid = {
      title: "TaskFlow Core Engine",
      description: "Building the core task engine",
      status: ProjectStatus.ACTIVE,
      deadline: "2026-08-15",
    };
    const result = createProjectSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("TaskFlow Core Engine");
      expect(result.data.status).toBe(ProjectStatus.ACTIVE);
      expect(result.data.deadline).toBeInstanceOf(Date);
    }
  });

  it("trims whitespace from title", () => {
    const result = createProjectSchema.safeParse({
      title: "   Trimmed Project   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Trimmed Project");
      expect(result.data.status).toBe(ProjectStatus.ACTIVE); // default
      expect(result.data.description).toBeNull();
    }
  });

  it("rejects empty or whitespace-only title", () => {
    const emptyResult = createProjectSchema.safeParse({ title: "" });
    expect(emptyResult.success).toBe(false);

    const whitespaceResult = createProjectSchema.safeParse({ title: "   " });
    expect(whitespaceResult.success).toBe(false);
  });

  it("rejects invalid status enum values", () => {
    const result = createProjectSchema.safeParse({
      title: "Project",
      status: "INVALID_STATUS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid calendar dates like 2026-02-31", () => {
    const result = createProjectSchema.safeParse({
      title: "Project",
      deadline: "2026-02-31",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed date strings", () => {
    const result = createProjectSchema.safeParse({
      title: "Project",
      deadline: "not-a-valid-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects client attempts to inject id or server-managed timestamps", () => {
    const resultWithId = createProjectSchema.safeParse({
      id: 999,
      title: "Hacked ID Project",
    });
    expect(resultWithId.success).toBe(false);

    const resultWithTimestamp = createProjectSchema.safeParse({
      title: "Timestamp Project",
      createdAt: new Date().toISOString(),
    });
    expect(resultWithTimestamp.success).toBe(false);
  });

  it("validates partial updates and rejects empty update payloads", () => {
    const validPartial = updateProjectSchema.safeParse({
      status: ProjectStatus.COMPLETED,
    });
    expect(validPartial.success).toBe(true);

    const emptyUpdate = updateProjectSchema.safeParse({});
    expect(emptyUpdate.success).toBe(false);
  });

  it("validates project query parameters", () => {
    expect(projectQuerySchema.safeParse({ status: "ACTIVE" }).success).toBe(true);
    expect(projectQuerySchema.safeParse({ status: "COMPLETED" }).success).toBe(true);
    expect(projectQuerySchema.safeParse({ status: "ON_HOLD" }).success).toBe(true);
    expect(projectQuerySchema.safeParse({ status: "UNKNOWN" }).success).toBe(false);
    expect(projectQuerySchema.safeParse({}).success).toBe(true);
  });
});

describe("Task Validation Schemas", () => {
  it("validates valid task creation payload with integer projectId", () => {
    const valid = {
      projectId: 1,
      title: "Design Homepage UI",
      description: "High-fidelity Figma mockups",
      status: TaskStatus.IN_PROGRESS,
    };
    const result = createTaskSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(TaskStatus.IN_PROGRESS);
    }
  });

  it("rejects missing or non-positive projectId", () => {
    const missingProj = createTaskSchema.safeParse({
      title: "Task with no project",
    });
    expect(missingProj.success).toBe(false);

    const negativeProj = createTaskSchema.safeParse({
      projectId: -5,
      title: "Negative project id",
    });
    expect(negativeProj.success).toBe(false);

    const floatProj = createTaskSchema.safeParse({
      projectId: 1.5,
      title: "Float project id",
    });
    expect(floatProj.success).toBe(false);
  });

  it("strictly distinguishes PENDING, IN_PROGRESS, and COMPLETED statuses", () => {
    expect(createTaskSchema.safeParse({ projectId: 1, title: "T", status: TaskStatus.PENDING }).success).toBe(true);
    expect(createTaskSchema.safeParse({ projectId: 1, title: "T", status: TaskStatus.IN_PROGRESS }).success).toBe(true);
    expect(createTaskSchema.safeParse({ projectId: 1, title: "T", status: TaskStatus.COMPLETED }).success).toBe(true);
    expect(createTaskSchema.safeParse({ projectId: 1, title: "T", status: "Active" }).success).toBe(false);
  });

  it("rejects client attempts to set id or timestamps on task", () => {
    const result = createTaskSchema.safeParse({
      id: 101,
      projectId: 1,
      title: "Task with ID",
    });
    expect(result.success).toBe(false);
  });

  it("validates partial task updates and rejects empty updates", () => {
    const validUpdate = updateTaskSchema.safeParse({
      status: TaskStatus.COMPLETED,
    });
    expect(validUpdate.success).toBe(true);

    const emptyUpdate = updateTaskSchema.safeParse({});
    expect(emptyUpdate.success).toBe(false);
  });

  it("validates task query parameters", () => {
    expect(taskQuerySchema.safeParse({ projectId: "1", status: "PENDING" }).success).toBe(true);
    expect(taskQuerySchema.safeParse({ projectId: "invalid" }).success).toBe(false);
    expect(taskQuerySchema.safeParse({ status: "UNKNOWN" }).success).toBe(false);
  });
});
