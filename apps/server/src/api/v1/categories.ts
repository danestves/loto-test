import { Hono } from "hono";

import {
	CategoryRepositoryImpl,
	CategoryService,
} from "../../domain/category/category.service";
import { withErrorHandling } from "../../lib/error-handling";
import * as responses from "../../lib/response";
import { validateId } from "../../lib/validation";
import { createCategorySchema, updateCategorySchema } from "../../schemas";

const categoryRepository = new CategoryRepositoryImpl();
const categoryService = new CategoryService(categoryRepository);

const app = new Hono();

app.get(
	"/",
	withErrorHandling(async (c) => {
		const categories = await categoryService.getAllCategories();
		return c.json(responses.success(categories));
	}),
);

app.get(
	"/:id",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "category ID");
		const category = await categoryService.getCategoryById(id);
		return c.json(responses.success(category));
	}),
);

app.post(
	"/",
	withErrorHandling(async (c) => {
		const body = await c.req.json();
		const validatedData = createCategorySchema.parse(body);

		const category = await categoryService.createCategory(validatedData.name);

		return c.json(responses.created(category), 201);
	}),
);

app.put(
	"/:id",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "category ID");
		const body = await c.req.json();
		const validatedData = updateCategorySchema.parse(body);

		const category = await categoryService.updateCategory(
			id,
			validatedData.name,
		);

		return c.json(responses.updated(category));
	}),
);

app.delete(
	"/:id",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "category ID");

		await categoryService.deleteCategory(id);

		return c.json(responses.deleted());
	}),
);

export default app;
