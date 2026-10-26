// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TasksList } from "@/components/tasks/TasksList";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { DeleteTaskModal } from "@/components/tasks/DeleteTaskModal";
import { TaskStatus, ProjectStatus, TaskWithProject } from "@/types";

const mockProjects = [
  { id: 1, title: "E-Commerce Website Redesign" },
  { id: 2, title: "Mobile App Development" },
];

const mockTasks: TaskWithProject[] = [
  {
    id: 101,
    projectId: 1,
    title: "Design homepage mockup",
    description: "Create Figma prototype for homepage",
    status: TaskStatus.PENDING,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    project: {
      id: 1,
      title: "E-Commerce Website Redesign",
      status: ProjectStatus.ACTIVE,
    },
  },
  {
    id: 102,
    projectId: 1,
    title: "Implement checkout flow",
    description: "Build checkout components and API integration",
    status: TaskStatus.IN_PROGRESS,
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    project: {
      id: 1,
      title: "E-Commerce Website Redesign",
      status: ProjectStatus.ACTIVE,
    },
  },
  {
    id: 103,
    projectId: 2,
    title: "Set up push notifications",
    description: "Configure APNS and FCM credentials",
    status: TaskStatus.COMPLETED,
    createdAt: "2026-01-06T00:00:00.000Z",
    updatedAt: "2026-01-07T00:00:00.000Z",
    project: {
      id: 2,
      title: "Mobile App Development",
      status: ProjectStatus.COMPLETED,
    },
  },
  {
    id: 104,
    projectId: 99,
    title: "Unassociated Task",
    description: "Task with missing or deleted project reference",
    status: TaskStatus.PENDING,
    createdAt: "2026-01-08T00:00:00.000Z",
    updatedAt: "2026-01-08T00:00:00.000Z",
    // project is undefined/missing
  },
];

describe("TaskCard Component", () => {
  it("renders task title, description, status badge, and project name", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleStatusChange = vi.fn();

    render(
      <TaskCard
        task={mockTasks[0]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    );

    expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    expect(screen.getByText("Create Figma prototype for homepage")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();

    // Trigger edit
    fireEvent.click(screen.getByLabelText("Edit task Design homepage mockup"));
    expect(handleEdit).toHaveBeenCalledWith(mockTasks[0]);

    // Trigger delete
    fireEvent.click(screen.getByLabelText("Delete task Design homepage mockup"));
    expect(handleDelete).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("handles missing project association gracefully without crashing", () => {
    render(
      <TaskCard
        task={mockTasks[3]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("Unassociated Task")).toBeTruthy();
    expect(screen.getByText("Project #99")).toBeTruthy();
  });

  it("triggers status transition when action button is clicked", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTasks[0]} // PENDING
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={handleStatusChange}
      />
    );

    // Click "Start" button (transition to IN_PROGRESS)
    const startBtn = screen.getByRole("button", { name: "Start task Design homepage mockup" });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith(mockTasks[0], TaskStatus.IN_PROGRESS);
    });
  });

  it("allows marking an in-progress task as completed", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTasks[1]} // IN_PROGRESS
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={handleStatusChange}
      />
    );

    const completeBtn = screen.getByRole("button", { name: "Complete task Implement checkout flow" });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith(mockTasks[1], TaskStatus.COMPLETED);
    });
  });

  it("allows reopening a completed task", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTasks[2]} // COMPLETED
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={handleStatusChange}
      />
    );

    const reopenBtn = screen.getByRole("button", { name: "Reopen task Set up push notifications" });
    fireEvent.click(reopenBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith(mockTasks[2], TaskStatus.PENDING);
    });
  });
});

describe("TaskModal Component", () => {
  it("validates required title field before submission", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        task={null}
        projects={mockProjects}
      />
    );

    expect(screen.getByText("Create New Task")).toBeTruthy();

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Task title is required")).toBeTruthy();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  it("submits new task successfully to POST /api/tasks", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 105,
          projectId: 1,
          title: "New Integration Test",
          description: "End to end coverage",
          status: TaskStatus.PENDING,
          createdAt: "2026-10-26T00:00:00.000Z",
          updatedAt: "2026-10-26T00:00:00.000Z",
          project: { id: 1, title: "E-Commerce Website Redesign", status: ProjectStatus.ACTIVE },
        },
      }),
    } as Response);

    render(
      <TaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        task={null}
        projects={mockProjects}
      />
    );

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "New Integration Test" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "End to end coverage" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tasks",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("pre-populates fields in edit mode and submits to PATCH /api/tasks/[id]", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockTasks[0],
          title: "Design homepage mockup v2",
        },
      }),
    } as Response);

    render(
      <TaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        task={mockTasks[0]}
        projects={mockProjects}
      />
    );

    expect(screen.getByText("Edit Task")).toBeTruthy();
    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    expect(titleInput.value).toBe("Design homepage mockup");

    fireEvent.change(titleInput, {
      target: { value: "Design homepage mockup v2" },
    });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/tasks/${mockTasks[0].id}`,
        expect.objectContaining({
          method: "PATCH",
        })
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("displays server error message when API rejects task creation", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Referenced project ID does not exist" },
      }),
    } as Response);

    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        task={null}
        projects={mockProjects}
      />
    );

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Test Task" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(await screen.findByText("Referenced project ID does not exist")).toBeTruthy();
  });
});

describe("DeleteTaskModal Component", () => {
  it("confirms deletion and calls DELETE /api/tasks/[id]", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { message: "Task deleted successfully", deletedTaskId: 101 },
      }),
    } as Response);

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        task={mockTasks[0]}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete/)).toBeTruthy();
    expect(screen.getByText(/Design homepage mockup/)).toBeTruthy();

    const deleteBtn = screen.getByRole("button", { name: "Delete Task" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/tasks/${mockTasks[0].id}`,
        expect.objectContaining({ method: "DELETE" })
      );
      expect(handleSuccess).toHaveBeenCalledWith(mockTasks[0].id);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("handles cancellation without calling DELETE endpoint", () => {
    const handleClose = vi.fn();
    const fetchMock = vi.spyOn(global, "fetch");

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={vi.fn()}
        task={mockTasks[0]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleClose).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("TasksList Component Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and renders tasks and project filter options", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      if (urlStr.includes("/api/tasks")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockTasks }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown route"));
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
      expect(screen.getByText("Implement checkout flow")).toBeTruthy();
      expect(screen.getByText("Set up push notifications")).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/tasks");
  });

  it("filters tasks by status when status tab is clicked", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      if (urlStr.includes("/api/tasks?status=IN_PROGRESS")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [mockTasks[1]] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: mockTasks }),
      } as Response);
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    });

    // Click "In Progress" tab
    const inProgressTab = screen.getByRole("tab", { name: "In Progress" });
    fireEvent.click(inProgressTab);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks?status=IN_PROGRESS");
    });
  });

  it("filters tasks by project when project dropdown selection changes", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      if (urlStr.includes("/api/tasks?projectId=2")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [mockTasks[2]] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: mockTasks }),
      } as Response);
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    });

    // Change project filter
    const projectSelect = screen.getByLabelText(/filter tasks by project/i);
    fireEvent.change(projectSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks?projectId=2");
    });
  });

  it("combines status and project filters together", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      if (urlStr.includes("status=COMPLETED") && urlStr.includes("projectId=2")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [mockTasks[2]] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: mockTasks }),
      } as Response);
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    });

    // Select Completed status
    fireEvent.click(screen.getByRole("tab", { name: "Completed" }));

    // Select Project 2
    fireEvent.change(screen.getByLabelText(/filter tasks by project/i), {
      target: { value: "2" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks?status=COMPLETED&projectId=2");
    });
  });

  it("displays empty state when no tasks match current filters", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByTestId("tasks-empty-state")).toBeTruthy();
      expect(screen.getByText("No tasks found")).toBeTruthy();
    });
  });

  it("displays error state with retry button on API failure", async () => {
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockProjects }),
        } as Response);
      }
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            success: false,
            error: { message: "Database connection failed" },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTasks,
        }),
      } as Response);
    });

    render(<TasksList />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load tasks")).toBeTruthy();
      expect(screen.getByText("Database connection failed")).toBeTruthy();
    });

    // Click retry
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    });
  });
});
