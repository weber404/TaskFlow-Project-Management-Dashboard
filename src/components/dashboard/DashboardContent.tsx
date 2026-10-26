"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Database } from "lucide-react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { Button } from "@/components/ui/Button";
import { DashboardStatsData, ProjectWithTaskCount, TaskWithProject } from "@/types";

export const DashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectWithTaskCount[] | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<TaskWithProject[] | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `HTTP ${res.status}: Failed to fetch metrics`);
      }
      setStats(json.data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `HTTP ${res.status}: Failed to fetch projects`);
      }
      setProjects(json.data);
    } catch (err) {
      setProjectsError(err instanceof Error ? err.message : "Failed to load projects");
      setProjects(null);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `HTTP ${res.status}: Failed to fetch tasks`);
      }
      setTasks(json.data);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to load tasks");
      setTasks(null);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let ignore = false;

    async function initializeDashboard() {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.allSettled([
          fetch("/api/dashboard/stats").then((r) => r.json()),
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/tasks").then((r) => r.json()),
        ]);

        if (ignore) return;

        // Process stats
        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
          setStats(statsRes.value.data);
          setStatsError(null);
        } else {
          const errMsg =
            statsRes.status === "fulfilled"
              ? statsRes.value?.error?.message || "Failed to load dashboard metrics"
              : statsRes.reason?.message || "Failed to load dashboard metrics";
          setStatsError(errMsg);
          setStats(null);
        }
        setStatsLoading(false);

        // Process projects
        if (projectsRes.status === "fulfilled" && projectsRes.value?.success) {
          setProjects(projectsRes.value.data);
          setProjectsError(null);
        } else {
          const errMsg =
            projectsRes.status === "fulfilled"
              ? projectsRes.value?.error?.message || "Failed to load projects"
              : projectsRes.reason?.message || "Failed to load projects";
          setProjectsError(errMsg);
          setProjects(null);
        }
        setProjectsLoading(false);

        // Process tasks
        if (tasksRes.status === "fulfilled" && tasksRes.value?.success) {
          setTasks(tasksRes.value.data);
          setTasksError(null);
        } else {
          const errMsg =
            tasksRes.status === "fulfilled"
              ? tasksRes.value?.error?.message || "Failed to load tasks"
              : tasksRes.reason?.message || "Failed to load tasks";
          setTasksError(errMsg);
          setTasks(null);
        }
        setTasksLoading(false);
      } catch (err) {
        if (ignore) return;
        const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
        setStatsError(msg);
        setProjectsError(msg);
        setTasksError(msg);
        setStatsLoading(false);
        setProjectsLoading(false);
        setTasksLoading(false);
      }
    }

    initializeDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  // Manual user-triggered refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([fetchStats(), fetchProjects(), fetchTasks()]);
    setIsRefreshing(false);
  };

  const hasConnectionError =
    (statsError && statsError.toLowerCase().includes("database")) ||
    (projectsError && projectsError.toLowerCase().includes("database")) ||
    (tasksError && tasksError.toLowerCase().includes("database"));

  return (
    <div className="space-y-8">
      {/* Quick Action Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Database className="size-3.5 text-text-muted" aria-hidden="true" />
          <span>Real-time PostgreSQL telemetry</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          loading={isRefreshing}
          icon={<RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          aria-label="Refresh dashboard data"
        >
          Refresh Data
        </Button>
      </div>

      {/* Database Connection Notice if connection is down */}
      {hasConnectionError && (
        <div
          role="status"
          className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-text-primary flex items-start gap-3"
        >
          <div className="size-8 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center text-warning shrink-0 mt-0.5">
            <Database className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-warning">
              Database Connection Required
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              TaskFlow requires a valid PostgreSQL database connection (<code className="text-warning/90">DATABASE_URL</code> in <code className="text-warning/90">.env</code>). Live telemetry will automatically populate once connected and seeded.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Section */}
      <section aria-label="Key Performance Metrics">
        <MetricCards
          stats={stats}
          isLoading={statsLoading}
          error={statsError}
          onRetry={fetchStats}
        />
      </section>

      {/* Two-Column Responsive Layout: Recent Projects & Recent Tasks */}
      <section
        aria-label="Recent Activity"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        <RecentProjects
          projects={projects}
          isLoading={projectsLoading}
          error={projectsError}
          onRetry={fetchProjects}
          limit={5}
        />

        <RecentTasks
          tasks={tasks}
          isLoading={tasksLoading}
          error={tasksError}
          onRetry={fetchTasks}
          limit={5}
        />
      </section>
    </div>
  );
};
