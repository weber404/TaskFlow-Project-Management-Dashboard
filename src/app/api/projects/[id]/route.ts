import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseRouteId,
  parseJsonBody,
} from "@/lib/api-response";
import { updateProjectSchema } from "@/schemas/project.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Retrieves a single project and all its associated tasks.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsedId = parseRouteId(rawId);
    if ("errorResponse" in parsedId) {
      return parsedId.errorResponse;
    }

    const project = await db.project.findUnique({
      where: { id: parsedId.id },
      include: {
        tasks: {
          orderBy: { id: "asc" },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    return successResponse(project, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/projects/[id]
 * Updates permitted fields on an existing project.
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

    const validation = updateProjectSchema.safeParse(parseResult.data);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // Verify record exists before updating
    const existing = await db.project.findUnique({
      where: { id: parsedId.id },
    });

    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    const updated = await db.project.update({
      where: { id: parsedId.id },
      data: validation.data,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return successResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/projects/[id]
 * Deletes a project and safely cascades deletion to all associated tasks.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsedId = parseRouteId(rawId);
    if ("errorResponse" in parsedId) {
      return parsedId.errorResponse;
    }

    // Verify record exists before deletion
    const existing = await db.project.findUnique({
      where: { id: parsedId.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    await db.project.delete({
      where: { id: parsedId.id },
    });

    return successResponse(
      {
        message: `Project ${parsedId.id} and ${existing._count.tasks} associated task(s) deleted successfully`,
        deletedProjectId: parsedId.id,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
