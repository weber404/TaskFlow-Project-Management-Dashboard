"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { DeleteTaskModal } from "./DeleteTaskModal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TaskStatus, TaskWithProject, ProjectWithTaskCount } from "@/types";
import { Plus, CheckSquare, AlertCircle, RefreshCw, Filter } from "lucide-react";

type FilterStatus = "ALL" | TaskStatus;

export const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithProject[] | null>(null);
  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [activeStatus, setActiveStatus] = useState<FilterStatus>("ALL");
  const [activeProjectId, setActiveProjectId] = useState<string>("ALL");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithProject | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskWithProject | null>(null);

  // Load projects list for dropdown filter and creation modal
  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setProjects(
          json.data.map((p: ProjectWithTaskCount) => ({
            id: p.id,
            title: p.title,
          }))
        );
      }
    } catch {
      // Non-blocking project fetch
    }
  }, []);

  const loadTasks = useCallback(async (status: FilterStatus, projId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status !== "ALL") {
        params.append("status", status);
      }
      if (projId !== "ALL" && !isNaN(Number(projId))) {
        params.append("projectId", projId);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/tasks?${queryString}` : "/api/tasks";

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load tasks");
      }

      setTasks(json.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load tasks";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and filter synchronization
  useEffect(() => {
    let ignore = false;

    async function initialize() {
      try {
        // Fetch projects if not loaded yet
        fetch("/api/projects")
          .then((r) => r.json())
          .then((json) => {
            if (!ignore && json.success && Array.isArray(json.data)) {
              setProjects(
                json.data.map((p: ProjectWithTaskCount) => ({
                  id: p.id,
                  title: p.title,
                }))
              );
            }
          })
          .catch(() => {});

        const params = new URLSearchParams();
        if (activeStatus !== "ALL") {
          params.append("status", activeStatus);
        }
        if (activeProjectId !== "ALL" && !isNaN(Number(activeProjectId))) {
          params.append("projectId", activeProjectId);
        }

        const queryString = params.toString();
        const url = queryString ? `/api/tasks?${queryString}` : "/api/tasks";

        const res = await fetch(url);
        const json = await res.json();

        if (ignore) return;

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load tasks");
        }

        setTasks(json.data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        const message = err instanceof Error ? err.message : "Failed to load tasks";
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
  }, [activeStatus, activeProjectId]);

  const handleStatusFilterChange = (status: FilterStatus) => {
    setIsLoading(true);
    setError(null);
    setActiveStatus(status);
  };

  const handleProjectFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIsLoading(true);
    setError(null);
    setActiveProjectId(val);
  };

  const handleStatusChange = async (task: TaskWithProject, newStatus: TaskStatus) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "Failed to update task status");
    }

    // Update in local state
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === task.id ? json.data : t)) : []
    );
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    loadProjects();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskWithProject) => {
    setEditingTask(task);
    loadProjects();
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (task: TaskWithProject) => {
    setDeletingTask(task);
  };

  const handleTaskSuccess = () => {
    loadTasks(activeStatus, activeProjectId);
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setTasks((prev) => (prev ? prev.filter((t) => t.id !== deletedId) : []));
  };

  const handleClearFilters = () => {
    setIsLoading(true);
    setError(null);
    setActiveStatus("ALL");
    setActiveProjectId("ALL");
  };

  const statusTabs: { id: FilterStatus; label: string }[] = [
    { id: "ALL", label: "All Tasks" },
    { id: TaskStatus.PENDING, label: "Pending" },
    { id: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { id: TaskStatus.COMPLETED, label: "Completed" },
  ];

  const projectSelectOptions = [
    { value: "ALL", label: "All Projects" },
    ...projects.map((p) => ({ value: String(p.id), label: p.title })),
  ];

  const isFiltered = activeStatus !== "ALL" || activeProjectId !== "ALL";

  return (
    <div className="space-y-6">
      {/* Control Bar: Filters & New Task Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs & Project Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Filter tasks by status"
            className="flex items-center gap-1.5 p-1 bg-surface-elevated/60 border border-border rounded-lg overflow-x-auto"
          >
            {statusTabs.map((tab) => {
              const isSelected = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleStatusFilterChange(tab.id)}
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

          {/* Project Dropdown Filter */}
          <div className="w-full sm:w-56">
            <Select
              aria-label="Filter tasks by project"
              value={activeProjectId}
              onChange={handleProjectFilterChange}
              options={projectSelectOptions}
              className="text-xs py-1.5"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
          <Button
            type="button"
            variant="OUTLINE"
            size="SM"
            onClick={() => loadTasks(activeStatus, activeProjectId)}
            disabled={isLoading}
            aria-label="Refresh task list"
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
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div
          aria-label="Loading tasks"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-4 animate-pulse min-h-[150px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 bg-surface-elevated rounded-full" />
                  <div className="h-5 w-28 bg-surface-elevated rounded-md" />
                </div>
                <div className="h-5 w-3/4 bg-surface-elevated rounded" />
                <div className="h-4 w-full bg-surface-elevated rounded" />
              </div>
              <div className="pt-3 border-t border-border-subtle flex justify-between">
                <div className="h-4 w-24 bg-surface-elevated rounded" />
                <div className="h-5 w-16 bg-surface-elevated rounded" />
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
              Failed to load tasks
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              {error}
            </p>
          </div>
          <Button
            type="button"
            variant="OUTLINE"
            size="SM"
            onClick={() => loadTasks(activeStatus, activeProjectId)}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div
          aria-label="Tasks list"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="tasks-empty-state"
          className="p-12 rounded-xl bg-surface border border-border border-dashed flex flex-col items-center justify-center text-center space-y-3"
        >
          <div className="size-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted">
            <CheckSquare className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-primary">
              {isFiltered ? "No matching tasks found" : "No tasks found"}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              {isFiltered
                ? "No tasks match the selected status or project filters. Adjust your criteria or clear filters."
                : "Your workspace has no tasks yet. Create a task to track work items across projects."}
            </p>
          </div>
          {isFiltered ? (
            <Button
              type="button"
              variant="SECONDARY"
              size="SM"
              onClick={handleClearFilters}
            >
              <Filter className="size-3.5" aria-hidden="true" />
              <span>Clear Filters</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="PRIMARY"
              size="SM"
              onClick={handleOpenCreateModal}
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Create Task</span>
            </Button>
          )}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <TaskModal
          key={editingTask ? `edit-${editingTask.id}` : "create"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTaskSuccess}
          task={editingTask}
          projects={projects}
          initialProjectId={activeProjectId !== "ALL" ? Number(activeProjectId) : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onSuccess={handleDeleteSuccess}
        task={deletingTask}
      />
    </div>
  );
};
