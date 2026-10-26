import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  path?: (string | number)[];
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    issues?: ApiErrorDetail[];
  };
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  issues?: ApiErrorDetail[]
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(issues && issues.length > 0 ? { issues } : {}),
    },
  };
  return NextResponse.json(body, { status });
}

/**
 * Validates and extracts a numeric ID from a route param.
 */
export function parseRouteId(rawId: string | string[] | undefined): { id: number } | { errorResponse: NextResponse<ApiErrorResponse> } {
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!idStr || !/^\d+$/.test(idStr)) {
    return {
      errorResponse: errorResponse("Invalid ID format: must be a positive integer", 400),
    };
  }

  const id = parseInt(idStr, 10);
  if (id <= 0 || !Number.isSafeInteger(id)) {
    return {
      errorResponse: errorResponse("Invalid ID: must be a positive integer", 400),
    };
  }

  return { id };
}

/**
 * Parses and validates request JSON body safely.
 */
export async function parseJsonBody(req: Request): Promise<{ data: unknown } | { errorResponse: NextResponse<ApiErrorResponse> }> {
  try {
    const text = await req.text();
    if (!text || text.trim() === "") {
      return {
        errorResponse: errorResponse("Request body cannot be empty", 400),
      };
    }
    const parsed = JSON.parse(text);
    return { data: parsed };
  } catch {
    return {
      errorResponse: errorResponse("Invalid JSON format in request body", 400),
    };
  }
}

/**
 * Unified error handler for API Route Handlers.
 * Strips database credentials, internal traces, and SQL queries before sending response.
 */
export function handleApiError(err: unknown): NextResponse<ApiErrorResponse> {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const issues: ApiErrorDetail[] = err.issues.map((i) => ({
      path: i.path,
      message: i.message,
    }));
    return errorResponse("Validation failed", 400, issues);
  }

  // 2. Prisma Known Errors
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;

    // Record not found
    if (code === "P2025") {
      return errorResponse("Record not found", 404);
    }

    // Foreign key violation
    if (code === "P2003") {
      return errorResponse("Referenced record does not exist or relation constraint failed", 400);
    }

    // Unique constraint violation
    if (code === "P2002") {
      return errorResponse("A record with these details already exists", 400);
    }
  }

  // 3. Database connection failure or unhandled exception
  const errMessage = err instanceof Error ? err.message : String(err);
  console.error("[API_ERROR]", errMessage);

  if (
    errMessage.includes("ECONNREFUSED") ||
    errMessage.includes("ETIMEDOUT") ||
    errMessage.includes("Connection url is empty") ||
    errMessage.includes("Can't reach database server")
  ) {
    return errorResponse("Database connection unavailable. Please check your configuration.", 500);
  }

  return errorResponse("An unexpected server error occurred", 500);
}
