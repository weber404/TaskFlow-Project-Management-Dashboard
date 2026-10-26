import { describe, it, expect } from "vitest";
import {
  successResponse,
  errorResponse,
  parseRouteId,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

describe("API Response & Error Helpers", () => {
  it("formats success response correctly", async () => {
    const res = successResponse({ id: 1, name: "Test" }, 201);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({
      success: true,
      data: { id: 1, name: "Test" },
    });
  });

  it("formats error response with optional issues", async () => {
    const res = errorResponse("Something went wrong", 400, [
      { path: ["title"], message: "Title required" },
    ]);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: {
        message: "Something went wrong",
        issues: [{ path: ["title"], message: "Title required" }],
      },
    });
  });

  it("parses valid route ID", () => {
    const valid = parseRouteId("42");
    expect("id" in valid).toBe(true);
    if ("id" in valid) {
      expect(valid.id).toBe(42);
    }
  });

  it("rejects non-numeric, negative, or zero route IDs", async () => {
    const nonNumeric = parseRouteId("abc");
    expect("errorResponse" in nonNumeric).toBe(true);
    if ("errorResponse" in nonNumeric) {
      expect(nonNumeric.errorResponse.status).toBe(400);
    }

    const negative = parseRouteId("-10");
    expect("errorResponse" in negative).toBe(true);

    const zero = parseRouteId("0");
    expect("errorResponse" in zero).toBe(true);
  });

  it("handles Zod validation error cleanly", async () => {
    const schema = z.object({ count: z.number() });
    try {
      schema.parse({ count: "not-a-number" });
    } catch (err) {
      const res = handleApiError(err);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Validation failed");
      expect(json.error.issues).toBeDefined();
    }
  });

  it("handles Prisma P2025 (Record not found) error with 404", async () => {
    const prismaError = { code: "P2025", message: "Record to update not found." };
    const res = handleApiError(prismaError);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.message).toBe("Record not found");
  });

  it("handles database connection errors without leaking credentials or stack traces", async () => {
    const dbErr = new Error("Connection url is empty. See https://pris.ly/d/config-url");
    const res = handleApiError(dbErr);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.message).toBe("Database connection unavailable. Please check your configuration.");
    expect(json.error.stack).toBeUndefined();
  });
});
