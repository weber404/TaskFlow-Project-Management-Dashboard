"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectDetail, ProjectStatus, TaskStatus, ProjectWithTaskCount } from "@/types";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ProjectModal } from "./ProjectModal";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { formatDate, isOverdue } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Edit2,
  Trash2,
  AlertCircle,
  FolderX,
  RefreshCw,
} from "lucide-react";

interface ProjectDetailViewProps {
  projectId: string;
}

const statusBadgeVariant: Record<ProjectStatus, BadgeVariant> = {
  [ProjectStatus.ACTIVE]: "ACTIVE",
  [ProjectStatus.COMPLETED]: "COMPLETED",
  [ProjectStatus.ON_HOLD]: "ON_HOLD",
};

const taskStatusBadgeVariant: Record<TaskStatus, BadgeVariant> = {
  [TaskStatus.PENDING]: "PENDING",
  [TaskStatus.IN_PROGRESS]: "IN_PROGRESS",
  [TaskStatus.COMPLETED]: "COMPLETED",
};

const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed",
};

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId }) => {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadProject = useCallback(async () => {
    const numId = Number(projectId);
    if (!/^\d+$/.test(projectId) || isNaN(numId) || numId <= 0) {
      setIsLoading(false);
      setError("Invalid project ID. Must be a positive integer.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();

      if (res.status === 404) {
        setIsNotFound(true);
        setError("Project not found");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load project details");
      }

      setProject(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load project details";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let ignore = false;

    async function initialize() {
      const numId = Number(projectId);
      if (!/^\d+$/.test(projectId) || isNaN(numId) || numId <= 0) {
        if (!ignore) {
          setError("Invalid project ID. Must be a positive integer.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (ignore) return;

        if (res.status === 404) {
          setIsNotFound(true);
          setError("Project not found");
          return;
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load project details");
        }

        setProject(json.data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        const message = err instanceof Error ? err.message : "Failed to load project details";
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
  }, [projectId]);

  const handleEditSuccess = (updated: ProjectWithTaskCount) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            title: updated.title,
            description: updated.description,
            status: updated.status,
            deadline: updated.deadline,
            updatedAt: updated.updatedAt,
          }
        : null
    );
    loadProject();
  };

  const handleDeleteSuccess = () => {
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div
        aria-label="Loading project details"
        className="p-16 flex flex-col items-center justify-center space-y-4"
      >
        <Spinner size="LG" label="Loading project details..." />
        <p className="text-xs text-text-muted">Fetching project and associated tasks...</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div
        role="alert"
        data-testid="project-not-found"
        className="p-12 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="size-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted">
          <FolderX className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-text-primary">
            Project Not Found
          </h2>
          <p className="text-xs text-text-secondary max-w-sm">
            The project you are looking for does not exist or may have been deleted.
          </p>
        </div>
        <Link href="/projects">
          <Button type="button" variant="PRIMARY" size="SM">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Return to Projects</span>
          </Button>
        </Link>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        role="alert"
        data-testid="project-error-state"
        className="p-10 rounded-xl bg-surface border border-danger/30 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="size-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Failed to Load Project
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-md">
            {error || "An unexpected error occurred while loading this project."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button type="button" variant="SECONDARY" size="SM">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <span>Back to Projects</span>
            </Button>
          </Link>
          <Button type="button" variant="OUTLINE" size="SM" onClick={loadProject}>
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(project.deadline, project.status);
  const tasks = project.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb / Back Link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors focus-ring rounded"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusBadgeVariant[project.status]}>
                {project.status.replace("_", " ")}
              </Badge>
              {overdue && <Badge variant="OVERDUE">Overdue</Badge>}
              <span className="text-xs text-text-muted">ID: #{project.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              {project.title}
            </h1>
            <p className="text-sm text-text-secondary max-w-3xl leading-relaxed whitespace-pre-wrap">
              {project.description || "No description provided for this project."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start">
            <Button
              type="button"
              variant="SECONDARY"
              size="SM"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit project"
            >
              <Edit2 className="size-3.5" aria-hidden="true" />
              <span>Edit Project</span>
            </Button>
            <Button
              type="button"
              variant="DANGER"
              size="SM"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete project"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border-subtle text-xs">
          <div>
            <span className="text-text-muted block mb-1">Deadline</span>
            <div className="flex items-center gap-1.5 text-text-primary font-medium">
              <Calendar className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>{formatDate(project.deadline)}</span>
            </div>
          </div>

          <div>
            <span className="text-text-muted block mb-1">Created</span>
            <div className="flex items-center gap-1.5 text-text-primary font-medium">
              <Clock className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>

          <div>
            <span className="text-text-muted block mb-1">Last Updated</span>
            <div className="flex items-center gap-1.5 text-text-primary font-medium">
              <Clock className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>{formatDate(project.updatedAt)}</span>
            </div>
          </div>

          <div>
            <span className="text-text-muted block mb-1">Task Progress</span>
            <div className="flex items-center gap-1.5 text-text-primary font-medium">
              <CheckCircle2 className="size-3.5 text-success shrink-0" aria-hidden="true" />
              <span>
                {completedTasksCount} / {tasks.length} ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="size-5 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-text-primary">
              Associated Tasks ({tasks.length})
            </h2>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div
            aria-label="Project tasks list"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                data-testid={`task-item-${task.id}`}
                className="p-4 rounded-lg bg-surface border border-border hover:border-border-focus transition-colors flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {task.title}
                    </span>
                    <Badge variant={taskStatusBadgeVariant[task.status]}>
                      {taskStatusLabels[task.status]}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                  <span>Task #{task.id}</span>
                  <span>Created {formatDate(task.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            data-testid="empty-tasks-state"
            className="p-10 rounded-xl bg-surface border border-border border-dashed flex flex-col items-center justify-center text-center space-y-2"
          >
            <div className="size-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted">
              <ListTodo className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium text-text-primary">
                No tasks associated with this project yet
              </h3>
              <p className="text-xs text-text-secondary max-w-sm">
                Tasks for this project can be added and managed in the Tasks view.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <ProjectModal
          key={project.id}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          project={project}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        project={project}
      />
    </div>
  );
};
