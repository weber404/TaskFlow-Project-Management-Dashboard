"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, Calendar, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { ProjectWithTaskCount } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, isOverdue } from "@/lib/utils";

export interface RecentProjectsProps {
  projects: ProjectWithTaskCount[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  limit?: number;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  isLoading,
  error,
  onRetry,
  limit = 5,
}) => {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col h-full"
      data-testid="recent-projects-section"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <FolderKanban className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-text-primary">
              Recent Projects
            </h2>
            <p className="text-xs text-text-muted">
              Most recently updated projects
            </p>
          </div>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors focus-ring rounded-sm px-1 py-0.5"
        >
          <span>View all</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {error ? (
          <div
            role="alert"
            className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-center space-y-3 my-auto"
          >
            <div className="flex items-center justify-center text-danger">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-danger">
                Failed to load recent projects
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">{error}</p>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                icon={<RefreshCw className="size-3.5" />}
                className="border-danger/40 hover:bg-danger/20 text-danger"
              >
                Retry
              </Button>
            )}
          </div>
        ) : isLoading || !projects ? (
          <div className="space-y-3" aria-label="Loading projects">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-surface-elevated/40 border border-border-subtle animate-pulse space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-surface-elevated rounded" />
                  <div className="h-5 w-16 bg-surface-elevated rounded-full" />
                </div>
                <div className="h-3 w-64 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center space-y-2 border border-dashed border-border rounded-lg my-auto">
            <p className="text-xs font-medium text-text-secondary">
              No projects found
            </p>
            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
              Your projects will appear here once added in the Projects section.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {projects.slice(0, limit).map((project) => {
              const overdue = isOverdue(project.deadline, project.status);

              return (
                <div
                  key={project.id}
                  data-testid={`project-item-${project.id}`}
                  className="p-3.5 rounded-lg bg-surface-elevated/40 hover:bg-surface-elevated border border-border-subtle hover:border-border transition-colors duration-150 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-semibold text-text-primary hover:text-accent transition-colors truncate focus-ring rounded"
                    >
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {overdue && (
                        <Badge variant="OVERDUE" size="sm">
                          Overdue
                        </Badge>
                      )}
                      <Badge variant={project.status} size="sm" />
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3" aria-hidden="true" />
                      <span>{formatDate(project.deadline)}</span>
                    </div>

                    {project._count && (
                      <span>
                        {project._count.tasks} task{project._count.tasks === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
