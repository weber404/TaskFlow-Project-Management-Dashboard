import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getProjects, POST as createProject } from "@/app/api/projects/route";
import {
  GET as getProjectById,
  PATCH as updateProject,
  DELETE as deleteProject,
} from "@/app/api/projects/[id]/route";
import { ProjectStatus } from "@/lib/db";

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

describe("Projects API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("returns list of projects with task counts and stable order", async () => {
      const mockProjects = [
        {
          id: 1,
          title: "E-Commerce Website Redesign",
          status: ProjectStatus.ACTIVE,
          _count: { tasks: 3 },
          updatedAt: new Date("2026-08-01"),
        },
      ];
      (db.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);

      const req = new NextRequest("http://localhost:3000/api/projects");
      const res = await getProjects(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data[0].id).toBe(1);
      expect(json.data[0].title).toBe("E-Commerce Website Redesign");
      expect(json.data[0]._count.tasks).toBe(3);
      expect(db.project.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { tasks: true } } },
      });
    });

    it("filters projects by status in the database query", async () => {
      (db.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/projects?status=ACTIVE");
      const res = await getProjects(req);

      expect(res.status).toBe(200);
      expect(db.project.findMany).toHaveBeenCalledWith({
        where: { status: ProjectStatus.ACTIVE },
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { tasks: true } } },
      });
    });

    it("returns 400 when invalid status is provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects?status=INVALID_STATUS");
      const res = await getProjects(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Validation failed");
    });
  });

  describe("POST /api/projects", () => {
    it("creates a project with valid payload and returns 201", async () => {
      const created = {
        id: 11,
        title: "New Project",
        description: "Description",
        status: ProjectStatus.ACTIVE,
        _count: { tasks: 0 },
      };
      (db.project.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);

      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: "New Project",
          description: "Description",
          status: "ACTIVE",
          deadline: "2026-10-31",
        }),
      });

      const res = await createProject(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(created);
    });

    it("returns 400 when title is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ title: "   " }),
      });

      const res = await createProject(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.issues).toBeDefined();
    });

    it("returns 400 on malformed JSON body", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: "not-json-{{{",
      });

      const res = await createProject(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toBe("Invalid JSON format in request body");
    });
  });

  describe("GET /api/projects/[id]", () => {
    it("returns project with associated tasks for valid ID", async () => {
      const mockProject = {
        id: 1,
        title: "Project 1",
        tasks: [{ id: 101, title: "Task 1" }],
        _count: { tasks: 1 },
      };
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);

      const req = new NextRequest("http://localhost:3000/api/projects/1");
      const res = await getProjectById(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockProject);
    });

    it("returns 404 if project does not exist", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/projects/999");
      const res = await getProjectById(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.message).toBe("Project not found");
    });

    it("returns 400 for invalid ID parameter", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects/invalid-id");
      const res = await getProjectById(req, {
        params: Promise.resolve({ id: "invalid-id" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Invalid ID format");
    });
  });

  describe("PATCH /api/projects/[id]", () => {
    it("updates project fields and returns updated data", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, title: "Old Title" });
      (db.project.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        title: "Updated Title",
        status: ProjectStatus.COMPLETED,
        _count: { tasks: 2 },
      });

      const req = new NextRequest("http://localhost:3000/api/projects/1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Title", status: "COMPLETED" }),
      });

      const res = await updateProject(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.title).toBe("Updated Title");
    });

    it("returns 400 when empty update payload is submitted", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects/1", {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      const res = await updateProject(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(400);
    });

    it("returns 404 when updating non-existent project", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/projects/999", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Title" }),
      });

      const res = await updateProject(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
    });

    it("returns 400 when invalid ID parameter is provided to PATCH", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects/invalid-id", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const res = await updateProject(req, {
        params: Promise.resolve({ id: "invalid-id" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Invalid ID format");
    });

    it("handles database update error gracefully", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, title: "Existing" });
      (db.project.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database deadlock"));

      const req = new NextRequest("http://localhost:3000/api/projects/1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const res = await updateProject(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/projects/[id]", () => {
    it("deletes existing project and returns success message", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        title: "To Delete",
        _count: { tasks: 3 },
      });
      (db.project.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

      const req = new NextRequest("http://localhost:3000/api/projects/1", {
        method: "DELETE",
      });

      const res = await deleteProject(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deletedProjectId).toBe(1);
      expect(db.project.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("returns 404 if project to delete does not exist", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/projects/999", {
        method: "DELETE",
      });

      const res = await deleteProject(req, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(res.status).toBe(404);
      expect(db.project.delete).not.toHaveBeenCalled();
    });

    it("returns 400 when invalid ID parameter is provided to DELETE", async () => {
      const req = new NextRequest("http://localhost:3000/api/projects/-1", {
        method: "DELETE",
      });

      const res = await deleteProject(req, {
        params: Promise.resolve({ id: "-1" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Invalid ID format");
    });

    it("handles database deletion error gracefully", async () => {
      (db.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        title: "To Delete",
        _count: { tasks: 0 },
      });
      (db.project.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Foreign key constraint"));

      const req = new NextRequest("http://localhost:3000/api/projects/1", {
        method: "DELETE",
      });

      const res = await deleteProject(req, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(res.status).toBe(500);
    });
  });
});

