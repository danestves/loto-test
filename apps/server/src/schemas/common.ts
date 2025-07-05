import { z } from "zod/v4";

export const idSchema = z.object({
  id: z.number(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type IdInput = z.infer<typeof idSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
