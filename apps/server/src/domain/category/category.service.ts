import { and, eq, ne } from "drizzle-orm";

import { db } from "../../db";
import { category } from "../../db/schema";
import * as dbUtils from "../../lib/base-repository";
import { validateCategoryName } from "../../lib/validation";

export interface CategoryRepository {
	findAll(): Promise<(typeof category.$inferSelect)[]>;
	findById(id: number): Promise<typeof category.$inferSelect | undefined>;
	create(name: string): Promise<typeof category.$inferSelect>;
	update(id: number, name: string): Promise<typeof category.$inferSelect>;
	delete(id: number): Promise<void>;
	existsByName(name: string): Promise<boolean>;
	existsExcluding(id: number, name: string): Promise<boolean>;
}

export class CategoryService {
	constructor(private repository: CategoryRepository) {}

	async getAllCategories() {
		return this.repository.findAll();
	}

	async getCategoryById(id: number) {
		const result = await this.repository.findById(id);
		if (!result) {
			throw new Error("Category not found");
		}
		return result;
	}

	async createCategory(name: string) {
		validateCategoryName(name);

		const exists = await this.repository.existsByName(name);
		if (exists) {
			throw new Error("Category with this name already exists");
		}

		return this.repository.create(name);
	}

	async updateCategory(id: number, name: string) {
		validateCategoryName(name);

		const existingCategory = await this.repository.findById(id);
		if (!existingCategory) {
			throw new Error("Category not found");
		}

		const nameExists = await this.repository.existsExcluding(id, name);
		if (nameExists) {
			throw new Error("Category with this name already exists");
		}

		return this.repository.update(id, name);
	}

	async deleteCategory(id: number) {
		const existingCategory = await this.repository.findById(id);
		if (!existingCategory) {
			throw new Error("Category not found");
		}

		await this.repository.delete(id);
	}
}

export class CategoryRepositoryImpl implements CategoryRepository {
	async findAll() {
		return dbUtils.findAll(category);
	}

	async findById(id: number) {
		return dbUtils.findById(category, id, category.id);
	}

	async create(name: string) {
		return dbUtils.insert(category, { name });
	}

	async update(id: number, name: string) {
		return dbUtils.update(category, id, { name }, category.id);
	}

	async delete(id: number) {
		return dbUtils.deleteById(category, id, category.id);
	}

	async existsByName(name: string): Promise<boolean> {
		const result = await db
			.select({ id: category.id })
			.from(category)
			.where(eq(category.name, name))
			.limit(1);
		return result.length > 0;
	}

	async existsExcluding(id: number, name: string): Promise<boolean> {
		const result = await db
			.select({ id: category.id })
			.from(category)
			.where(and(eq(category.name, name), ne(category.id, id)))
			.limit(1);
		return result.length > 0;
	}
}
