// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { ProjectStatus, TaskStatus, ProjectWithTaskCount, ProjectDetail } from "@/types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockProjects: ProjectWithTaskCount[] = [
  {
    id: 1,
    title: "E-Commerce Website Redesign",
    description: "Complete redesign of storefront with modern UI",
    status: ProjectStatus.ACTIVE,
    deadline: "2030-10-15T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    _count: { tasks: 3 },
  },
  {
    id: 2,
    title: "Mobile App Development",
    description: "Cross-platform mobile application for customer portal",
    status: ProjectStatus.COMPLETED,
    deadline: "2026-06-30T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    _count: { tasks: 5 },
  },
  {
    id: 3,
    title: "Legacy System Migration",
    description: "Migrate legacy on-premise infrastructure",
    status: ProjectStatus.ON_HOLD,
    deadline: "2020-01-01T00:00:00.000Z", // Past due and not completed => Overdue
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-02T00:00:00.000Z",
    _count: { tasks: 2 },
  },
];

const mockProjectDetail: ProjectDetail = {
  id: 1,
  title: "E-Commerce Website Redesign",
  description: "Complete redesign of storefront with modern UI and cart flow.",
  status: ProjectStatus.ACTIVE,
  deadline: "2030-10-15T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  _count: { tasks: 2 },
  tasks: [
    {
      id: 101,
      projectId: 1,
      title: "Design homepage mockup",
      description: "Create Figma prototype for homepage",
      status: TaskStatus.COMPLETED,
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    },
    {
      id: 102,
      projectId: 1,
      title: "Implement checkout flow",
      description: "Build checkout components and API integration",
      status: TaskStatus.IN_PROGRESS,
      createdAt: "2026-01-04T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
    },
  ],
};

describe("ProjectCard Component", () => {
  it("renders project card with title, description, status badge, task count, and deadline", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ProjectCard
        project={mockProjects[0]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();
    expect(screen.getByText("Complete redesign of storefront with modern UI")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("3 tasks")).toBeTruthy();
    expect(screen.getByText("Oct 15, 2030")).toBeTruthy();

    // Trigger edit
    fireEvent.click(screen.getByLabelText("Edit project E-Commerce Website Redesign"));
    expect(handleEdit).toHaveBeenCalledWith(mockProjects[0]);

    // Trigger delete
    fireEvent.click(screen.getByLabelText("Delete project E-Commerce Website Redesign"));
    expect(handleDelete).toHaveBeenCalledWith(mockProjects[0]);
  });

  it("renders overdue badge when project deadline is in the past and not completed", () => {
    render(
      <ProjectCard
        project={mockProjects[2]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Legacy System Migration")).toBeTruthy();
    expect(screen.getByText("On Hold")).toBeTruthy();
    expect(screen.getByText("Overdue")).toBeTruthy();
  });
});

describe("ProjectModal Component", () => {
  it("validates required title field before submission", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <ProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={null}
      />
    );

    expect(screen.getByText("Create New Project")).toBeTruthy();

    const submitBtn = screen.getByRole("button", { name: "Create Project" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Project title is required")).toBeTruthy();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  it("submits new project successfully to POST /api/projects", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 10,
          title: "New AI Platform",
          description: "Machine learning workspace",
          status: ProjectStatus.ACTIVE,
          deadline: "2027-01-01T00:00:00.000Z",
          createdAt: "2026-10-26T00:00:00.000Z",
          updatedAt: "2026-10-26T00:00:00.000Z",
          _count: { tasks: 0 },
        },
      }),
    } as Response);

    render(
      <ProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={null}
      />
    );

    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: "New AI Platform" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Machine learning workspace" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Project" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/projects",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 10, title: "New AI Platform" })
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("pre-populates fields in edit mode and submits to PATCH /api/projects/[id]", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockProjects[0],
          title: "E-Commerce Website Redesign v2",
        },
      }),
    } as Response);

    render(
      <ProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={mockProjects[0]}
      />
    );

    expect(screen.getByText("Edit Project")).toBeTruthy();
    const titleInput = screen.getByLabelText(/project title/i) as HTMLInputElement;
    expect(titleInput.value).toBe("E-Commerce Website Redesign");

    fireEvent.change(titleInput, {
      target: { value: "E-Commerce Website Redesign v2" },
    });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/projects/${mockProjects[0].id}`,
        expect.objectContaining({
          method: "PATCH",
        })
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("displays server error message when API rejects submission", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Database connection failed" },
      }),
    } as Response);

    render(
      <ProjectModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        project={null}
      />
    );

    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: "Test Project" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));

    expect(await screen.findByText("Database connection failed")).toBeTruthy();
  });
});

describe("DeleteProjectModal Component", () => {
  it("displays cascade task warning and confirms deletion", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { message: "Deleted successfully", deletedProjectId: 1 },
      }),
    } as Response);

    render(
      <DeleteProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        project={mockProjects[0]}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete/)).toBeTruthy();
    expect(screen.getByText(/All 3 associated tasks will also be permanently deleted/)).toBeTruthy();

    const deleteBtn = screen.getByRole("button", { name: "Delete Project" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/projects/${mockProjects[0].id}`,
        expect.objectContaining({ method: "DELETE" })
      );
      expect(handleSuccess).toHaveBeenCalledWith(mockProjects[0].id);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("handles cancellation without calling DELETE endpoint", () => {
    const handleClose = vi.fn();
    const fetchMock = vi.spyOn(global, "fetch");

    render(
      <DeleteProjectModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={vi.fn()}
        project={mockProjects[0]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleClose).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("ProjectsList Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and renders project list with filter tabs", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProjects,
      }),
    } as Response);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();
      expect(screen.getByText("Mobile App Development")).toBeTruthy();
      expect(screen.getByText("Legacy System Migration")).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/projects");
  });

  it("filters projects by status when a status tab is clicked", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProjects }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockProjects[0]],
        }),
      } as Response);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();
    });

    // Click "Active" tab
    const activeTab = screen.getByRole("tab", { name: "Active" });
    fireEvent.click(activeTab);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/projects?status=ACTIVE");
    });
  });

  it("displays empty state when no projects match filter", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    } as Response);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByTestId("projects-empty-state")).toBeTruthy();
      expect(screen.getByText("No projects found")).toBeTruthy();
    });
  });

  it("displays error state with retry button on API failure", async () => {
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            success: false,
            error: { message: "Database unreachable" },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: mockProjects,
        }),
      } as Response);
    });

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load projects")).toBeTruthy();
      expect(screen.getByText("Database unreachable")).toBeTruthy();
    });

    // Click retry
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();
    });
  });
});

describe("ProjectDetailView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
  });

  it("renders project details and associated tasks accurately", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProjectDetail,
      }),
    } as Response);

    render(<ProjectDetailView projectId="1" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "E-Commerce Website Redesign" })).toBeTruthy();
      expect(screen.getByText(/Complete redesign of storefront with modern UI/)).toBeTruthy();
      expect(screen.getByText("Associated Tasks (2)")).toBeTruthy();
      expect(screen.getByText("Design homepage mockup")).toBeTruthy();
      expect(screen.getByText("Implement checkout flow")).toBeTruthy();
    });
  });

  it("displays 404 Project Not Found when project is missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 404,
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Project not found" },
      }),
    } as Response);

    render(<ProjectDetailView projectId="999" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-not-found")).toBeTruthy();
      expect(screen.getByText("Project Not Found")).toBeTruthy();
    });
  });

  it("handles invalid non-integer project ID without network error", async () => {
    render(<ProjectDetailView projectId="invalid-slug" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-error-state")).toBeTruthy();
      expect(screen.getByText(/Invalid project ID/)).toBeTruthy();
    });
  });

  it("displays empty task state when project has no associated tasks", async () => {
    const emptyTasksProject: ProjectDetail = {
      ...mockProjectDetail,
      tasks: [],
      _count: { tasks: 0 },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: emptyTasksProject,
      }),
    } as Response);

    render(<ProjectDetailView projectId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-tasks-state")).toBeTruthy();
      expect(screen.getByText("No tasks associated with this project yet")).toBeTruthy();
    });
  });
});
