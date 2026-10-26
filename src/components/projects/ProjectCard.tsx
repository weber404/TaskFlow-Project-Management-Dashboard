"use client";

import React from "react";
import Link from "next/link";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { ProjectStatus, ProjectWithTaskCount } from "@/types";
import { formatDate, isOverdue } from "@/lib/utils";
import { Calendar, CheckSquare, Edit2, Trash2, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: ProjectWithTaskCount;
  onEdit: (project: ProjectWithTaskCount) => void;
  onDelete: (project: ProjectWithTaskCount) => void;
}

const statusBadgeVariant: Record<ProjectStatus, BadgeVariant> = {
  [ProjectStatus.ACTIVE]: "ACTIVE",
  [ProjectStatus.COMPLETED]: "COMPLETED",
  [ProjectStatus.ON_HOLD]: "ON_HOLD",
};

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "Active",
  [ProjectStatus.COMPLETED]: "Completed",
  [ProjectStatus.ON_HOLD]: "On Hold",
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const overdue = isOverdue(project.deadline, project.status);
  const taskCount = project._count?.tasks ?? 0;

  return (
    <div
      data-testid={`project-card-${project.id}`}
      className="p-5 rounded-xl bg-surface border border-border shadow-xs hover:border-border-focus transition-all duration-150 flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Header row: Status badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={statusBadgeVariant[project.status]}>
              {statusLabels[project.status]}
            </Badge>
            {overdue && <Badge variant="OVERDUE">Overdue</Badge>}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(project)}
              aria-label={`Edit project ${project.title}`}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors focus-ring cursor-pointer"
            >
              <Edit2 className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              aria-label={`Delete project ${project.title}`}
              className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors focus-ring cursor-pointer"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-base font-semibold text-text-primary hover:text-accent transition-colors line-clamp-1 inline-flex items-center gap-1 focus-ring rounded"
          >
            <span>{project.title}</span>
          </Link>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 min-h-[32px]">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Footer: Deadline, Task Count, View link */}
      <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden="true" />
            <span>{formatDate(project.deadline)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="text-xs font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1 transition-colors"
          aria-label={`View details for ${project.title}`}
        >
          <span>Details</span>
          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
