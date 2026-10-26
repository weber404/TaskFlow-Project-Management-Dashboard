"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, FolderKanban, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { TaskWithProject } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface RecentTasksProps {
  tasks: TaskWithProject[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  limit?: number;
}

export const RecentTasks: React.FC<RecentTasksProps> = ({
  tasks,
  isLoading,
  error,
  onRetry,
  limit = 5,
}) => {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col h-full"
      data-testid="recent-tasks-section"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info">
            <CheckSquare className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-text-primary">
              Recent Tasks
            </h2>
            <p className="text-xs text-text-muted">
              Latest tasks across all projects
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
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
                Failed to load recent tasks
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
        ) : isLoading || !tasks ? (
          <div className="space-y-3" aria-label="Loading tasks">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-surface-elevated/40 border border-border-subtle animate-pulse space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-surface-elevated rounded" />
                  <div className="h-5 w-16 bg-surface-elevated rounded-full" />
                </div>
                <div className="h-3 w-48 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center space-y-2 border border-dashed border-border rounded-lg my-auto">
            <p className="text-xs font-medium text-text-secondary">
              No tasks found
            </p>
            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
              Your tasks will appear here once created under a project.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.slice(0, limit).map((task) => {
              return (
                <div
                  key={task.id}
                  data-testid={`task-item-${task.id}`}
                  className="p-3.5 rounded-lg bg-surface-elevated/40 hover:bg-surface-elevated border border-border-subtle hover:border-border transition-colors duration-150 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {task.title}
                    </span>
                    <Badge variant={task.status} size="sm" />
                  </div>

                  {task.description && (
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  {task.project && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-text-muted">
                      <FolderKanban className="size-3 text-text-muted shrink-0" aria-hidden="true" />
                      <span className="truncate">{task.project.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
