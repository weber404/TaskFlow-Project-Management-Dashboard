"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { Button } from "@/components/ui/Button";
import { ProjectStatus, ProjectWithTaskCount } from "@/types";
import { Plus, FolderKanban, AlertCircle, RefreshCw, Filter } from "lucide-react";

type FilterStatus = "ALL" | ProjectStatus;

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithTaskCount[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithTaskCount | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithTaskCount | null>(null);

  const loadProjects = useCallback(async (filter: FilterStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = filter === "ALL" ? "/api/projects" : `/api/projects?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load projects");
      }

      setProjects(json.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initialize() {
      try {
        const url = activeFilter === "ALL" ? "/api/projects" : `/api/projects?status=${activeFilter}`;
        const res = await fetch(url);
        const json = await res.json();

        if (ignore) return;

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load projects");
        }

        setProjects(json.data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        const message = err instanceof Error ? err.message : "Failed to load projects";
        setError(message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      ignore = true;
    };
  }, [activeFilter]);

  const handleFilterChange = (filter: FilterStatus) => {
    setIsLoading(true);
    setError(null);
    setActiveFilter(filter);
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectWithTaskCount) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (project: ProjectWithTaskCount) => {
    setDeletingProject(project);
  };

  const handleProjectSuccess = () => {
    loadProjects(activeFilter);
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setProjects((prev) => (prev ? prev.filter((p) => p.id !== deletedId) : []));
  };

  const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "ALL", label: "All Projects" },
    { id: ProjectStatus.ACTIVE, label: "Active" },
    { id: ProjectStatus.COMPLETED, label: "Completed" },
    { id: ProjectStatus.ON_HOLD, label: "On Hold" },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar: Filter Tabs & New Project Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter projects by status"
          className="flex items-center gap-1.5 p-1 bg-surface-elevated/60 border border-border rounded-lg overflow-x-auto"
        >
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer focus-ring ${
                  isSelected
                    ? "bg-accent text-[#111111] font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="OUTLINE"
            size="SM"
            onClick={() => loadProjects(activeFilter)}
            disabled={isLoading}
            aria-label="Refresh project list"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="PRIMARY"
            size="SM"
            onClick={handleOpenCreateModal}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div
          aria-label="Loading projects"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-4 animate-pulse min-h-[160px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 bg-surface-elevated rounded-full" />
                  <div className="h-5 w-12 bg-surface-elevated rounded-md" />
                </div>
                <div className="h-5 w-3/4 bg-surface-elevated rounded" />
                <div className="h-4 w-full bg-surface-elevated rounded" />
              </div>
              <div className="pt-3 border-t border-border-subtle flex justify-between">
                <div className="h-4 w-24 bg-surface-elevated rounded" />
                <div className="h-4 w-16 bg-surface-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="p-6 rounded-xl bg-surface border border-danger/30 flex flex-col items-center text-center space-y-3"
        >
          <div className="size-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
            <AlertCircle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Failed to load projects
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              {error}
            </p>
          </div>
          <Button
            type="button"
            variant="OUTLINE"
            size="SM"
            onClick={() => loadProjects(activeFilter)}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : projects && projects.length > 0 ? (
        <div
          aria-label="Projects list"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="projects-empty-state"
          className="p-12 rounded-xl bg-surface border border-border border-dashed flex flex-col items-center justify-center text-center space-y-3"
        >
          <div className="size-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted">
            <FolderKanban className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-primary">
              {activeFilter === "ALL"
                ? "No projects found"
                : `No ${activeFilter.toLowerCase().replace("_", " ")} projects`}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              {activeFilter === "ALL"
                ? "Get started by creating your first workspace project."
                : "No projects match the selected filter. Try selecting another filter or create a project."}
            </p>
          </div>
          {activeFilter !== "ALL" ? (
            <Button
              type="button"
              variant="SECONDARY"
              size="SM"
              onClick={() => handleFilterChange("ALL")}
            >
              <Filter className="size-3.5" aria-hidden="true" />
              <span>Show All Projects</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="PRIMARY"
              size="SM"
              onClick={handleOpenCreateModal}
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Create Project</span>
            </Button>
          )}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <ProjectModal
          key={editingProject ? `edit-${editingProject.id}` : "create"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProjectSuccess}
          project={editingProject}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onSuccess={handleDeleteSuccess}
        project={deletingProject}
      />
    </div>
  );
};
