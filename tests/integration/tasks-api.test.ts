import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getTasks, POST as createTask } from "@/app/api/tasks/route";
import {
  GET as getTaskById,
  PATCH as updateTask,
  DELETE as deleteTask,
} from "@/app/api/tasks/[id]/route";
import { TaskStatus, ProjectStatus } from "@/lib/db";

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
        findUnique: vi.fn(),
      },
      task: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

import { db } from "@/lib/db";

describe("Tasks API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("returns list of tasks with associated project metadata", async () => {
      const mockTasks = [
        {
          id: 101,
          projectId: 1,
          title: "Design homepage mockup",
          status: TaskStatus.COMPLETED,
          project: {
            id: 1,
            title: "E-Commerce Website Redesign",
            status: ProjectStatus.ACTIVE,
          },
        },
      ];
      (db.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

      const req = new NextRequest("http://localhost:3000/api/tasks");
      const res = await getTasks(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockTasks);
      expect(db.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { id: "asc" },
        include: {
          project: {
            select: { id: true, title: true, status: true },
          },
        },
      });
    });

    it("filters tasks by projectId and status in PostgreSQL query", async () => {
      (db.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/tasks?projectId=1&status=PENDING");
      const res = await getTasks(req);

      expect(res.status).toBe(200);
      expect(db.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 1,
          status: TaskStatus.PENDING,
        },
        orderBy: { id: "asc" },
        include: {
          project: {
            select: { id: true, title: true, status: true },
          },
        },
      });
    });

    it("returns 400 for invalid query parameters", async () => {
      const req = new NextRequest("http://localhost:3000/api/tasks?projectId=abc");
      const res = await getTasks(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Validation failed");
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a task and returns 201 when destination project exists", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        title: "Project 1",
        status: ProjectStatus.ACTIVE,
      });

      const created = {
        id: 121,
        projectId: 1,
        title: "New Task",
        status: TaskStatus.PENDING,
        project: { id: 1, title: "Project 1", status: ProjectStatus.ACTIVE },
      };
      (db.task.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: 1,
          title: "New Task",
          status: "PENDING",
        }),
      });

      const res = await createTask(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data).toEqual(created);
    });

    it("returns 404 when referenced project does not exist", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: 999,
          title: "Orphan Task Attempt",
        }),
      });

      const res = await createTask(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.message).toContain("Referenced project ID 999 does not exist");
      expect(db.task.create).not.toHaveBeenCalled();
    });

    it("returns 400 when title is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ projectId: 1, title: "" }),
      });

      const res = await createTask(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("GET /api/tasks/[id]", () => {
    it("returns task with associated project metadata", async () => {
      const mockTask = {
        id: 101,
        title: "Design homepage mockup",
        status: TaskStatus.COMPLETED,
        project: { id: 1, title: "E-Commerce", status: ProjectStatus.ACTIVE },
      };
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTask);

      const req = new NextRequest("http://localhost:3000/api/tasks/101");
      const res = await getTaskById(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockTask);
    });

    it("returns 404 if task does not exist", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/999");
      const res = await getTaskById(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.message).toBe("Task not found");
    });
  });

  describe("PATCH /api/tasks/[id]", () => {
    it("updates task fields and preserves status distinction", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 101,
        projectId: 1,
        status: TaskStatus.PENDING,
      });

      const updated = {
        id: 101,
        projectId: 1,
        title: "Updated Title",
        status: TaskStatus.IN_PROGRESS,
        project: { id: 1, title: "Project 1", status: ProjectStatus.ACTIVE },
      };
      (db.task.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated);

      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Updated Title",
          status: "IN_PROGRESS",
        }),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("returns 404 when reassigned project does not exist", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 101,
        projectId: 1,
      });
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "PATCH",
        body: JSON.stringify({ projectId: 999 }),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.message).toContain("Destination project ID 999 does not exist");
      expect(db.task.update).not.toHaveBeenCalled();
    });

    it("returns 404 when task to update does not exist", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/999", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
    });

    it("returns 400 when empty update payload is provided to PATCH", async () => {
      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 400 when invalid ID parameter is provided to PATCH", async () => {
      const req = new NextRequest("http://localhost:3000/api/tasks/invalid-id", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "invalid-id" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Invalid ID format");
    });

    it("handles database update error gracefully", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 101, projectId: 1 });
      (db.task.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database write error"));

      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const res = await updateTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("deletes existing task and returns success", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 101 });
      (db.task.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 101 });

      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "DELETE",
      });

      const res = await deleteTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deletedTaskId).toBe(101);
      expect(db.task.delete).toHaveBeenCalledWith({ where: { id: 101 } });
    });

    it("returns 404 if task to delete does not exist", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/tasks/999", {
        method: "DELETE",
      });

      const res = await deleteTask(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
      expect(db.task.delete).not.toHaveBeenCalled();
    });

    it("returns 400 when invalid ID parameter is provided to DELETE", async () => {
      const req = new NextRequest("http://localhost:3000/api/tasks/-5", {
        method: "DELETE",
      });

      const res = await deleteTask(req, {
        params: Promise.resolve({ id: "-5" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Invalid ID format");
    });

    it("handles database deletion error gracefully", async () => {
      (db.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 101 });
      (db.task.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database failure"));

      const req = new NextRequest("http://localhost:3000/api/tasks/101", {
        method: "DELETE",
      });

      const res = await deleteTask(req, {
        params: Promise.resolve({ id: "101" }),
      });

      expect(res.status).toBe(500);
    });
  });
});

