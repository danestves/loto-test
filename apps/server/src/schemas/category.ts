import { z } from "zod/v4";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const categoryIdSchema = z.object({
  id: z.number(),
});

export const categoryUpdateInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateInputSchema>;
