import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  successResponse,
  handleApiError,
  parseJsonBody,
} from "@/lib/api-response";
import {
  createProjectSchema,
  projectQuerySchema,
} from "@/schemas/project.schema";

/**
 * GET /api/projects
 * Fetches projects with task counts, supporting optional status filter.
 * Stable ordering: most recently updated first.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    // Validate query parameters
    const queryValidation = projectQuerySchema.safeParse({
      status: statusParam || undefined,
    });

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { status } = queryValidation.data;

    const projects = await db.project.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return successResponse(projects, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/projects
 * Validates payload and creates a new project in PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const parseResult = await parseJsonBody(req);
    if ("errorResponse" in parseResult) {
      return parseResult.errorResponse;
    }

    const validation = createProjectSchema.safeParse(parseResult.data);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const newProject = await db.project.create({
      data: validation.data,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return successResponse(newProject, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
