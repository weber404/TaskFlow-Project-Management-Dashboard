import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseRouteId,
  parseJsonBody,
} from "@/lib/api-response";
import { updateTaskSchema } from "@/schemas/task.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Retrieves task details with associated project information.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsedId = parseRouteId(rawId);
    if ("errorResponse" in parsedId) {
      return parsedId.errorResponse;
    }

    const task = await db.task.findUnique({
      where: { id: parsedId.id },
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

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return successResponse(task, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/tasks/[id]
 * Updates permitted task fields, preserving status distinction (PENDING, IN_PROGRESS, COMPLETED).
 * Verifies destination project exists if projectId is being updated.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsedId = parseRouteId(rawId);
    if ("errorResponse" in parsedId) {
      return parsedId.errorResponse;
    }

    const parseResult = await parseJsonBody(req);
    if ("errorResponse" in parseResult) {
      return parseResult.errorResponse;
    }

    const validation = updateTaskSchema.safeParse(parseResult.data);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // Verify task exists
    const existingTask = await db.task.findUnique({
      where: { id: parsedId.id },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    // If changing projectId, verify destination project exists
    if (validation.data.projectId && validation.data.projectId !== existingTask.projectId) {
      const destinationProject = await db.project.findUnique({
        where: { id: validation.data.projectId },
      });

      if (!destinationProject) {
        return errorResponse(`Destination project ID ${validation.data.projectId} does not exist`, 404);
      }
    }

    const updatedTask = await db.task.update({
      where: { id: parsedId.id },
      data: validation.data,
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

    return successResponse(updatedTask, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a single task.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsedId = parseRouteId(rawId);
    if ("errorResponse" in parsedId) {
      return parsedId.errorResponse;
    }

    // Check task exists
    const existing = await db.task.findUnique({
      where: { id: parsedId.id },
    });

    if (!existing) {
      return errorResponse("Task not found", 404);
    }

    await db.task.delete({
      where: { id: parsedId.id },
    });

    return successResponse(
      {
        message: `Task ${parsedId.id} deleted successfully`,
        deletedTaskId: parsedId.id,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
