// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { ProjectStatus, TaskStatus, DashboardStatsData, ProjectWithTaskCount, TaskWithProject } from "@/types";

const mockStats: DashboardStatsData = {
  totalProjects: 10,
  activeProjects: 6,
  completedProjects: 2,
  onHoldProjects: 2,
  overdueProjects: 1,
  totalTasks: 20,
  completedTasks: 6,
  pendingTasks: 9,
  inProgressTasks: 5,
};

const mockProjects: ProjectWithTaskCount[] = [
  {
    id: 1,
    title: "E-Commerce Website Redesign",
    description: "Complete redesign with modern UI",
    status: ProjectStatus.ACTIVE,
    deadline: "2030-08-15T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    _count: { tasks: 3 },
  },
  {
    id: 3,
    title: "Brand Identity for Startup",
    description: "Complete brand guidelines",
    status: ProjectStatus.COMPLETED,
    deadline: "2026-06-30T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    _count: { tasks: 2 },
  },
  {
    id: 5,
    title: "Past Due Project",
    description: "An overdue project",
    status: ProjectStatus.ACTIVE,
    deadline: "2020-01-01T00:00:00.000Z", // definitively past
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-02T00:00:00.000Z",
    _count: { tasks: 1 },
  },
];

const mockTasks: TaskWithProject[] = [
  {
    id: 101,
    projectId: 1,
    title: "Design homepage mockup",
    description: "High-fidelity Figma mockup",
    status: TaskStatus.COMPLETED,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
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
    description: "Cart and checkout logic",
    status: TaskStatus.IN_PROGRESS,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    project: {
      id: 1,
      title: "E-Commerce Website Redesign",
      status: ProjectStatus.ACTIVE,
    },
  },
  {
    id: 103,
    projectId: 1,
    title: "Set up product categories",
    description: "Organize catalog",
    status: TaskStatus.PENDING,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    project: {
      id: 1,
      title: "E-Commerce Website Redesign",
      status: ProjectStatus.ACTIVE,
    },
  },
];

describe("MetricCards Component", () => {
  it("renders loading skeletons when isLoading is true", () => {
    render(<MetricCards stats={null} isLoading={true} error={null} />);
    expect(screen.getByLabelText("Loading metrics")).toBeTruthy();
  });

  it("renders the 4 key metrics accurately when data is supplied", () => {
    render(<MetricCards stats={mockStats} isLoading={false} error={null} />);

    expect(screen.getByText("Total Projects")).toBeTruthy();
    expect(within(screen.getByTestId("total-projects")).getByText("10")).toBeTruthy();

    expect(screen.getByText("Active Projects")).toBeTruthy();
    expect(within(screen.getByTestId("active-projects")).getByText("6")).toBeTruthy();

    expect(screen.getByText("Completed Tasks")).toBeTruthy();
    expect(within(screen.getByTestId("completed-tasks")).getByText("6")).toBeTruthy();

    expect(screen.getByText("Pending Tasks")).toBeTruthy();
    expect(within(screen.getByTestId("pending-tasks")).getByText("9")).toBeTruthy();
  });

  it("renders error state and triggers onRetry when clicked", () => {
    const handleRetry = vi.fn();
    render(
      <MetricCards
        stats={null}
        isLoading={false}
        error="Database connection failed"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load dashboard metrics")).toBeTruthy();
    expect(screen.getByText("Database connection failed")).toBeTruthy();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe("RecentProjects Component", () => {
  it("renders loading skeletons while fetching projects", () => {
    render(<RecentProjects projects={null} isLoading={true} error={null} />);
    expect(screen.getByLabelText("Loading projects")).toBeTruthy();
  });

  it("renders projects list with status badges and overdue indicator", () => {
    render(<RecentProjects projects={mockProjects} isLoading={false} error={null} />);

    expect(screen.getByText("Recent Projects")).toBeTruthy();
    expect(screen.getByText("E-Commerce Website Redesign")).toBeTruthy();
    expect(screen.getByText("Brand Identity for Startup")).toBeTruthy();
    expect(screen.getByText("Past Due Project")).toBeTruthy();

    // Check overdue badge is displayed specifically for Past Due Project
    expect(within(screen.getByTestId("project-item-5")).getByText("Overdue")).toBeTruthy();
  });

  it("renders empty state when projects array is empty", () => {
    render(<RecentProjects projects={[]} isLoading={false} error={null} />);
    expect(screen.getByText("No projects found")).toBeTruthy();
  });

  it("renders error state with retry button", () => {
    const handleRetry = vi.fn();
    render(
      <RecentProjects
        projects={null}
        isLoading={false}
        error="Server error loading projects"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load recent projects")).toBeTruthy();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe("RecentTasks Component", () => {
  it("renders loading skeletons while fetching tasks", () => {
    render(<RecentTasks tasks={null} isLoading={true} error={null} />);
    expect(screen.getByLabelText("Loading tasks")).toBeTruthy();
  });

  it("renders tasks with status badges and associated project names", () => {
    render(<RecentTasks tasks={mockTasks} isLoading={false} error={null} />);

    expect(screen.getByText("Recent Tasks")).toBeTruthy();
    expect(screen.getByText("Design homepage mockup")).toBeTruthy();
    expect(screen.getByText("Implement checkout flow")).toBeTruthy();
    expect(screen.getByText("Set up product categories")).toBeTruthy();

    // Status badges
    expect(screen.getByText("Completed")).toBeTruthy();
    expect(screen.getByText("In Progress")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
  });

  it("renders empty state when tasks array is empty", () => {
    render(<RecentTasks tasks={[]} isLoading={false} error={null} />);
    expect(screen.getByText("No tasks found")).toBeTruthy();
  });

  it("renders error state with retry button", () => {
    const handleRetry = vi.fn();
    render(
      <RecentTasks
        tasks={null}
        isLoading={false}
        error="Network error"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load recent tasks")).toBeTruthy();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe("DashboardContent Component Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and renders dashboard metrics, recent projects, and recent tasks", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/dashboard/stats")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockStats,
          }),
        } as Response);
      }
      if (urlStr.includes("/api/projects")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockProjects,
          }),
        } as Response);
      }
      if (urlStr.includes("/api/tasks")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: mockTasks,
          }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown route"));
    });

    const { DashboardContent } = await import("@/components/dashboard/DashboardContent");
    const { waitFor } = await import("@testing-library/react");

    render(<DashboardContent />);

    // Initially shows loading or elements
    await waitFor(() => {
      expect(screen.getByText("Total Projects")).toBeTruthy();
      expect(screen.getByText("Recent Projects")).toBeTruthy();
      expect(screen.getByText("Recent Tasks")).toBeTruthy();
    });

    expect(within(screen.getByTestId("total-projects")).getByText("10")).toBeTruthy();
    expect(within(screen.getByTestId("project-item-1")).getByText("E-Commerce Website Redesign")).toBeTruthy();
    expect(screen.getByText("Design homepage mockup")).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith("/api/dashboard/stats");
    expect(fetchMock).toHaveBeenCalledWith("/api/projects");
    expect(fetchMock).toHaveBeenCalledWith("/api/tasks");
  });

  it("renders error state when API fails and retries on user click", async () => {
    let statsFailed = true;

    vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/dashboard/stats")) {
        if (statsFailed) {
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
            data: mockStats,
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      } as Response);
    });

    const { DashboardContent } = await import("@/components/dashboard/DashboardContent");
    const { waitFor } = await import("@testing-library/react");

    render(<DashboardContent />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load dashboard metrics")).toBeTruthy();
    });

    // Fix the error condition and click Retry
    statsFailed = false;
    const retryButtons = screen.getAllByRole("button", { name: /retry/i });
    fireEvent.click(retryButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Total Projects")).toBeTruthy();
      expect(within(screen.getByTestId("total-projects")).getByText("10")).toBeTruthy();
    });
  });
});
