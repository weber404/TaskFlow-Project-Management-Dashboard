"use client";

import React from "react";
import { FolderKanban, Activity, CheckCircle2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { DashboardStatsData } from "@/types";
import { Button } from "@/components/ui/Button";

export interface MetricCardsProps {
  stats: DashboardStatsData | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

interface MetricItem {
  id: string;
  label: string;
  value: number | string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  borderColor?: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  stats,
  isLoading,
  error,
  onRetry,
}) => {
  if (error) {
    return (
      <div
        role="alert"
        className="p-5 rounded-xl bg-danger/10 border border-danger/30 text-text-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-danger/20 border border-danger/30 flex items-center justify-center text-danger shrink-0">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-danger">
              Failed to load dashboard metrics
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{error}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw className="size-3.5" />}
            className="border-danger/40 hover:bg-danger/20 text-danger shrink-0"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Loading metrics">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-surface border border-border animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-surface-elevated rounded" />
              <div className="size-9 rounded-lg bg-surface-elevated" />
            </div>
            <div className="h-8 w-16 bg-surface-elevated rounded" />
            <div className="h-3 w-32 bg-surface-elevated rounded" />
          </div>
        ))}
      </div>
    );
  }

  const completionPercentage =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const metrics: MetricItem[] = [
    {
      id: "total-projects",
      label: "Total Projects",
      value: stats.totalProjects,
      subtext: `${stats.completedProjects} completed • ${stats.onHoldProjects} on hold`,
      icon: FolderKanban,
      iconColor: "text-accent",
      iconBg: "bg-accent/10 border-accent/20",
    },
    {
      id: "active-projects",
      label: "Active Projects",
      value: stats.activeProjects,
      subtext:
        stats.overdueProjects > 0
          ? `${stats.overdueProjects} overdue project${stats.overdueProjects > 1 ? "s" : ""}`
          : "All active on schedule",
      icon: Activity,
      iconColor: "text-success",
      iconBg: "bg-success/10 border-success/20",
    },
    {
      id: "completed-tasks",
      label: "Completed Tasks",
      value: stats.completedTasks,
      subtext: `${completionPercentage}% completion rate`,
      icon: CheckCircle2,
      iconColor: "text-info",
      iconBg: "bg-info/10 border-info/20",
    },
    {
      id: "pending-tasks",
      label: "Pending Tasks",
      value: stats.pendingTasks,
      subtext: `${stats.inProgressTasks} task${stats.inProgressTasks === 1 ? "" : "s"} in progress`,
      icon: Clock,
      iconColor: "text-warning",
      iconBg: "bg-warning/10 border-warning/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Dashboard Metrics">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;

        return (
          <div
            key={metric.id}
            data-testid={metric.id}
            className="p-5 rounded-xl bg-surface border border-border shadow-xs hover:border-border-focus/40 transition-colors duration-150 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">
                {metric.label}
              </span>
              <div
                className={`size-9 rounded-lg border flex items-center justify-center shrink-0 ${metric.iconBg} ${metric.iconColor}`}
                aria-hidden="true"
              >
                <IconComponent className="size-4.5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                {metric.value}
              </div>
              <p className="text-xs text-text-muted mt-1 truncate">
                {metric.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
