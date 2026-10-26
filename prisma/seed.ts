import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProjectStatus, TaskStatus } from "./generated/client";

interface RawProject {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
}

interface RawTask {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
}

interface RawSeedData {
  projects: RawProject[];
  tasks: RawTask[];
}

const PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  Active: ProjectStatus.ACTIVE,
  Completed: ProjectStatus.COMPLETED,
  "On Hold": ProjectStatus.ON_HOLD,
};

const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  Pending: TaskStatus.PENDING,
  "In Progress": TaskStatus.IN_PROGRESS,
  Completed: TaskStatus.COMPLETED,
};

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is required to run seed script.");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Starting TaskFlow database seeding...");

  const seedFilePath = path.join(__dirname, "seed-data.json");
  const rawContent = fs.readFileSync(seedFilePath, "utf-8");
  const seedData: RawSeedData = JSON.parse(rawContent);

  // 1. Pre-validation: ensure foreign key consistency and unique IDs
  const projectIds = new Set<number>();
  for (const project of seedData.projects) {
    if (projectIds.has(project.id)) {
      throw new Error(`Duplicate project ID in seed data: ${project.id}`);
    }
    projectIds.add(project.id);
  }

  const taskIds = new Set<number>();
  for (const task of seedData.tasks) {
    if (taskIds.has(task.id)) {
      throw new Error(`Duplicate task ID in seed data: ${task.id}`);
    }
    if (!projectIds.has(task.projectId)) {
      throw new Error(`Task ID ${task.id} references invalid project ID: ${task.projectId}`);
    }
    taskIds.add(task.id);
  }

  console.log(`Pre-seed validation passed: ${projectIds.size} projects and ${taskIds.size} tasks.`);

  // 2. Perform idempotent upserts within an atomic transaction
  await prisma.$transaction(async (tx) => {
    // Upsert Projects preserving original IDs
    for (const p of seedData.projects) {
      const mappedStatus = PROJECT_STATUS_MAP[p.status];
      if (!mappedStatus) {
        throw new Error(`Unknown project status: ${p.status}`);
      }

      await tx.project.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          title: p.title,
          description: p.description,
          status: mappedStatus,
          deadline: p.deadline ? new Date(`${p.deadline}T00:00:00.000Z`) : null,
        },
        update: {
          title: p.title,
          description: p.description,
          status: mappedStatus,
          deadline: p.deadline ? new Date(`${p.deadline}T00:00:00.000Z`) : null,
        },
      });
    }

    // Upsert Tasks preserving original IDs and project relations
    for (const t of seedData.tasks) {
      const mappedStatus = TASK_STATUS_MAP[t.status];
      if (!mappedStatus) {
        throw new Error(`Unknown task status: ${t.status}`);
      }

      await tx.task.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          status: mappedStatus,
        },
        update: {
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          status: mappedStatus,
        },
      });
    }

    // 3. Synchronize PostgreSQL serial sequences so future inserts won't conflict with explicit seed IDs
    try {
      await tx.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Project"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Project";
      `);
      await tx.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Task"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Task";
      `);
      console.log("PostgreSQL serial sequences synchronized successfully.");
    } catch (seqError) {
      console.warn("Notice: Sequence synchronization skipped or unsupported:", (seqError as Error).message);
    }
  }, {
    maxWait: 20000,
    timeout: 60000,
  });

  // 4. Verification queries to confirm counts
  const [totalProjects, activeProjects, completedProjects, onHoldProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: ProjectStatus.ACTIVE } }),
    prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
    prisma.project.count({ where: { status: ProjectStatus.ON_HOLD } }),
  ]);

  const [totalTasks, completedTasks, inProgressTasks, pendingTasks] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
    prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    prisma.task.count({ where: { status: TaskStatus.PENDING } }),
  ]);

  console.log("-----------------------------------------");
  console.log("Database Seeding Completed Successfully:");
  console.log(`Projects: ${totalProjects} (Active: ${activeProjects}, Completed: ${completedProjects}, On Hold: ${onHoldProjects})`);
  console.log(`Tasks:    ${totalTasks} (Completed: ${completedTasks}, In Progress: ${inProgressTasks}, Pending: ${pendingTasks})`);
  console.log("-----------------------------------------");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  });
