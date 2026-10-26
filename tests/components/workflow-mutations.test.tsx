// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { DeleteTaskModal } from "@/components/tasks/DeleteTaskModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { TaskStatus, ProjectStatus, TaskWithProject, ProjectWithTaskCount } from "@/types";

const mockTask: TaskWithProject = {
  id: 101,
  projectId: 1,
  title: "Original Task Title",
  description: "Description",
  status: TaskStatus.PENDING,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockProject: ProjectWithTaskCount = {
  id: 1,
  title: "Original Project Title",
  description: "Description",
  status: ProjectStatus.ACTIVE,
  deadline: "2026-12-31T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  _count: { tasks: 2 },
};

describe("Failed Mutations & Negative Feedback Workflow Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("failed task status transition preserves original status and displays error", async () => {
    const handleStatusChange = vi.fn().mockRejectedValue(new Error("Database connection timed out"));

    render(
      <TaskCard
        task={mockTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={handleStatusChange}
      />
    );

    // Initial status is Pending
    expect(screen.getByText("Pending")).toBeTruthy();

    // Click "Start"
    const startBtn = screen.getByRole("button", { name: /start task/i });
    fireEvent.click(startBtn);

    // Error is displayed
    expect(await screen.findByText("Database connection timed out")).toBeTruthy();

    // Status remains Pending
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.queryByText("In Progress")).toBeNull();
  });

  it("failed task deletion preserves modal and does NOT call onSuccess", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Task deletion forbidden: database locked" },
      }),
    } as Response);

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        task={mockTask}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete Task" });
    fireEvent.click(deleteBtn);

    expect(await screen.findByText("Task deletion forbidden: database locked")).toBeTruthy();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("failed project deletion preserves modal and does NOT call onSuccess", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Cannot delete project: active foreign key references" },
      }),
    } as Response);

    render(
      <DeleteProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={mockProject}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete Project" });
    fireEvent.click(deleteBtn);

    expect(await screen.findByText("Cannot delete project: active foreign key references")).toBeTruthy();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("failed project edit preserves form values, shows API alert, and does NOT call onSuccess", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Unique constraint violation on title" },
      }),
    } as Response);

    render(
      <ProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={mockProject}
      />
    );

    const titleInput = screen.getByLabelText(/project title/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Conflicting Title" } });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    expect(await screen.findByText("Unique constraint violation on title")).toBeTruthy();
    expect(titleInput.value).toBe("Conflicting Title");
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });
});
