// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";

// Mock next/navigation
let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("Sidebar Navigation Component", () => {
  it("renders navigation links for Dashboard, Projects, and Tasks", () => {
    currentPathname = "/";
    render(<Sidebar isMobileOpen={false} onMobileClose={vi.fn()} />);

    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(within(nav).getByText("Dashboard")).toBeTruthy();
    expect(within(nav).getByText("Projects")).toBeTruthy();
    expect(within(nav).getByText("Tasks")).toBeTruthy();
  });

  it("handles mobile drawer toggle and close action", () => {
    const handleClose = vi.fn();
    render(<Sidebar isMobileOpen={true} onMobileClose={handleClose} />);

    // Mobile drawer backdrop or close button
    const closeButtons = screen.getAllByLabelText(/close navigation/i);
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("Header Component", () => {
  it("renders breadcrumbs and triggers mobile menu toggle", () => {
    currentPathname = "/projects";
    const handleToggle = vi.fn();

    render(<Header onMobileMenuToggle={handleToggle} />);

    // Breadcrumb
    expect(screen.getByText("Projects")).toBeTruthy();

    // Mobile toggle button
    const menuBtn = screen.getByLabelText(/open navigation menu/i);
    fireEvent.click(menuBtn);
    expect(handleToggle).toHaveBeenCalled();
  });

  it("displays workspace indicator badge", () => {
    currentPathname = "/";
    render(<Header onMobileMenuToggle={vi.fn()} />);

    expect(screen.getByText("Production Workspace")).toBeTruthy();
  });
});

describe("PageHeader UI Component", () => {
  it("renders title, description, and optional action buttons", () => {
    render(
      <PageHeader
        title="Custom Title"
        description="Custom page description"
        actions={<button type="button">Action</button>}
      />
    );

    expect(screen.getByText("Custom Title")).toBeTruthy();
    expect(screen.getByText("Custom page description")).toBeTruthy();
    expect(screen.getByText("Action")).toBeTruthy();
  });
});
