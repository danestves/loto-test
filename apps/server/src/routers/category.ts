import { CategoryRepositoryImpl, CategoryService } from "../domain/category/category.service";
import { publicProcedure } from "../lib/orpc";
import {
  categoryIdSchema,
  categoryUpdateInputSchema,
  createCategorySchema,
} from "../schemas";

const categoryRepository = new CategoryRepositoryImpl();
const categoryService = new CategoryService(categoryRepository);

export const categoryRouter = {
    getAll: publicProcedure.handler(async () => {
        return await categoryService.getAllCategories();
    }),

    getById: publicProcedure
        .input(categoryIdSchema)
        .handler(async ({ input }) => {
            return await categoryService.getCategoryById(input.id);
        }),

    create: publicProcedure
        .input(createCategorySchema)
        .handler(async ({ input }) => {
            return await categoryService.createCategory(input.name);
        }),

    update: publicProcedure
        .input(categoryUpdateInputSchema)
        .handler(async ({ input }) => {
            return await categoryService.updateCategory(input.id, input.name);
        }),

    delete: publicProcedure
        .input(categoryIdSchema)
        .handler(async ({ input }) => {
            await categoryService.deleteCategory(input.id);
            return { success: true };
        }),
};
