import { z } from "zod";
import { ProjectStatus } from "@/lib/db";

export const projectStatusSchema = z.nativeEnum(ProjectStatus, {
  errorMap: () => ({ message: "Status must be ACTIVE, COMPLETED, or ON_HOLD" }),
});

export const deadlineSchema = z
  .union([z.string().trim(), z.date(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === null || val === undefined || val === "") {
      return null;
    }
    if (val instanceof Date) {
      if (isNaN(val.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date object provided for deadline",
        });
        return z.NEVER;
      }
      return val;
    }

    // Verify calendar date validity for YYYY-MM-DD
    const ymdMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const [, y, m, day] = ymdMatch;
      const parsedUtc = new Date(`${val}T00:00:00.000Z`);
      if (
        isNaN(parsedUtc.getTime()) ||
        parsedUtc.getUTCFullYear() !== parseInt(y, 10) ||
        parsedUtc.getUTCMonth() + 1 !== parseInt(m, 10) ||
        parsedUtc.getUTCDate() !== parseInt(day, 10)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid calendar date: ${val}`,
        });
        return z.NEVER;
      }
      return parsedUtc;
    }

    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date format for deadline",
      });
      return z.NEVER;
    }
    return parsed;
  });

export const createProjectSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required" })
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .nullable()
      .optional()
      .transform((val) => (val === "" || val === undefined ? null : val)),
    status: projectStatusSchema.default(ProjectStatus.ACTIVE),
    deadline: deadlineSchema.optional(),
  })
  .strict({
    message: "Unexpected fields present in request. Setting id or timestamps is not permitted.",
  });

export const updateProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val)),
    status: projectStatusSchema.optional(),
    deadline: deadlineSchema.optional(),
  })
  .strict({
    message: "Unexpected fields present in request. Modifying id or timestamps is not permitted.",
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  );

export const projectQuerySchema = z.object({
  status: projectStatusSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
