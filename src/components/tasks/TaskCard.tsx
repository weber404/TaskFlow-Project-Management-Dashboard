"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { TaskStatus, TaskWithProject } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  FolderKanban,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface TaskCardProps {
  task: TaskWithProject;
  onEdit: (task: TaskWithProject) => void;
  onDelete: (task: TaskWithProject) => void;
  onStatusChange: (task: TaskWithProject, newStatus: TaskStatus) => Promise<void>;
}

const statusBadgeVariant: Record<TaskStatus, BadgeVariant> = {
  [TaskStatus.PENDING]: "PENDING",
  [TaskStatus.IN_PROGRESS]: "IN_PROGRESS",
  [TaskStatus.COMPLETED]: "COMPLETED",
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed",
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatusClick = async (newStatus: TaskStatus) => {
    if (isUpdatingStatus || newStatus === task.status) return;
    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      await onStatusChange(task, newStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={`p-4 sm:p-5 rounded-xl bg-surface border transition-all duration-150 flex flex-col justify-between gap-4 group ${
        task.status === TaskStatus.COMPLETED
          ? "border-border/80 bg-surface/60"
          : "border-border hover:border-border-focus"
      }`}
    >
      <div className="space-y-3">
        {/* Header row: Status badge, project tag, and actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusBadgeVariant[task.status]}>
              {statusLabels[task.status]}
            </Badge>

            {task.project ? (
              <Link
                href={`/projects/${task.project.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-accent transition-colors bg-surface-elevated px-2 py-0.5 rounded-md border border-border-subtle max-w-[200px] truncate focus-ring"
                title={`Project: ${task.project.title}`}
              >
                <FolderKanban className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{task.project.title}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted bg-surface-elevated px-2 py-0.5 rounded-md border border-border-subtle">
                <FolderKanban className="size-3 shrink-0" aria-hidden="true" />
                <span>Project #{task.projectId}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.title}`}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors focus-ring cursor-pointer"
            >
              <Edit2 className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete task ${task.title}`}
              className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors focus-ring cursor-pointer"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3
            className={`text-sm font-semibold transition-colors ${
              task.status === TaskStatus.COMPLETED
                ? "text-text-secondary line-through"
                : "text-text-primary"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {statusError && (
          <p className="text-[11px] text-danger font-medium">
            {statusError}
          </p>
        )}
      </div>

      {/* Footer row: Date & Quick Status Controls */}
      <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span>Created {formatDate(task.createdAt)}</span>
        </div>

        {/* Status Transition Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          {isUpdatingStatus ? (
            <div className="inline-flex items-center gap-1.5 text-xs text-text-muted px-2 py-1">
              <Loader2 className="size-3.5 animate-spin text-accent" aria-hidden="true" />
              <span>Updating...</span>
            </div>
          ) : (
            <>
              {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.COMPLETED && (
                <button
                  type="button"
                  onClick={() => handleStatusClick(TaskStatus.IN_PROGRESS)}
                  aria-label={`Start task ${task.title}`}
                  className="button-content inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-colors focus-ring cursor-pointer whitespace-nowrap"
                >
                  <PlayCircle className="size-3 shrink-0" aria-hidden="true" />
                  <span>Start</span>
                </button>
              )}

              {task.status !== TaskStatus.COMPLETED ? (
                <button
                  type="button"
                  onClick={() => handleStatusClick(TaskStatus.COMPLETED)}
                  aria-label={`Complete task ${task.title}`}
                  className="button-content inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-colors focus-ring cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                  <span>Complete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStatusClick(TaskStatus.PENDING)}
                  aria-label={`Reopen task ${task.title}`}
                  className="button-content inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface-elevated text-text-secondary border border-border hover:text-text-primary hover:bg-surface-hover transition-colors focus-ring cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="size-3 shrink-0" aria-hidden="true" />
                  <span>Reopen</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
