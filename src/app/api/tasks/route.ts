import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseJsonBody,
} from "@/lib/api-response";
import {
  createTaskSchema,
  taskQuerySchema,
} from "@/schemas/task.schema";

/**
 * GET /api/tasks
 * Lists tasks filtered directly in PostgreSQL by projectId and/or status.
 * Includes relevant project information.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectIdParam = searchParams.get("projectId");
    const statusParam = searchParams.get("status");

    const queryValidation = taskQuerySchema.safeParse({
      projectId: projectIdParam || undefined,
      status: statusParam || undefined,
    });

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { projectId, status } = queryValidation.data;

    const tasks = await db.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { id: "asc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return successResponse(tasks, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks
 * Validates task payload, verifies referenced project exists, and creates task in PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const parseResult = await parseJsonBody(req);
    if ("errorResponse" in parseResult) {
      return parseResult.errorResponse;
    }

    const validation = createTaskSchema.safeParse(parseResult.data);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { projectId, title, description, status } = validation.data;

    // Verify destination project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, status: true },
    });

    if (!project) {
      return errorResponse(`Referenced project ID ${projectId} does not exist`, 404);
    }

    const newTask = await db.task.create({
      data: {
        projectId,
        title,
        description,
        status,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return successResponse(newTask, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
