export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ProjectWithTaskCount {
  id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    tasks: number;
  };
}

export interface TaskWithProject {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  project?: {
    id: number;
    title: string;
    status: ProjectStatus;
  };
}

export interface TaskItem {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProjectDetail extends ProjectWithTaskCount {
  tasks: TaskItem[];
}

export interface DashboardStatsData {
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
