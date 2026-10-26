import { z } from "zod";
import { TaskStatus } from "@/lib/db";

export const taskStatusSchema = z.nativeEnum(TaskStatus, {
  errorMap: () => ({ message: "Status must be PENDING, IN_PROGRESS, or COMPLETED" }),
});

export const createTaskSchema = z
  .object({
    projectId: z
      .number({ required_error: "projectId is required and must be an integer" })
      .int("projectId must be an integer")
      .positive("projectId must be a positive integer"),
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
    status: taskStatusSchema.default(TaskStatus.PENDING),
  })
  .strict({
    message: "Unexpected fields present in request. Setting id or timestamps is not permitted.",
  });

export const updateTaskSchema = z
  .object({
    projectId: z
      .number()
      .int("projectId must be an integer")
      .positive("projectId must be a positive integer")
      .optional(),
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
    status: taskStatusSchema.optional(),
  })
  .strict({
    message: "Unexpected fields present in request. Modifying id or timestamps is not permitted.",
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  );

export const taskQuerySchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
  status: taskStatusSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
