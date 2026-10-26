import { db, ProjectStatus, TaskStatus } from "@/lib/db";
import { successResponse, handleApiError } from "@/lib/api-response";

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}

/**
 * GET /api/dashboard/stats
 * Aggregates real metrics dynamically from PostgreSQL via Prisma.
 * Strictly differentiates PENDING tasks from IN_PROGRESS tasks.
 * Overdue projects are calculated as projects with deadline < now and status != COMPLETED.
 */
export async function GET() {
  try {
    const now = new Date();

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      overdueProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    ] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: ProjectStatus.ACTIVE } }),
      db.project.count({ where: { status: ProjectStatus.COMPLETED } }),
      db.project.count({ where: { status: ProjectStatus.ON_HOLD } }),
      db.project.count({
        where: {
          deadline: { lt: now },
          status: { not: ProjectStatus.COMPLETED },
        },
      }),
      db.task.count(),
      db.task.count({ where: { status: TaskStatus.COMPLETED } }),
      db.task.count({ where: { status: TaskStatus.PENDING } }),
      db.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    ]);

    const stats: DashboardStats = {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      overdueProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    };

    return successResponse(stats, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
