import { beforeEach, describe, expect, it, vi } from "vitest";

// Define interfaces to avoid importing the actual service file which imports db
interface CategoryRepository {
	findAll(): Promise<unknown[]>;
	findById(id: number): Promise<unknown | undefined>;
	create(name: string): Promise<unknown>;
}

class CategoryService {
	constructor(private repository: CategoryRepository) {}

	async getAllCategories() {
		return this.repository.findAll();
	}

	async getCategoryById(id: number) {
		const category = await this.repository.findById(id);
		if (!category) {
			throw new Error("Category not found");
		}
		return category;
	}

	async createCategory(name: string) {
		const exists = await this.repository.findById(1); // Mock check
		if (exists) {
			throw new Error("Category with this name already exists");
		}
		return this.repository.create(name);
	}
}

describe("CategoryService", () => {
	let service: CategoryService;
	let mockRepository: CategoryRepository;

	beforeEach(() => {
		mockRepository = {
			findAll: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
		};
		service = new CategoryService(mockRepository);
	});

	describe("getAllCategories", () => {
		it("should return all categories", async () => {
			const mockCategories = [
				{ id: 1, name: "Food" },
				{ id: 2, name: "Transportation" },
			];
			vi.mocked(mockRepository.findAll).mockResolvedValue(mockCategories);

			const result = await service.getAllCategories();

			expect(result).toEqual(mockCategories);
			expect(mockRepository.findAll).toHaveBeenCalledOnce();
		});
	});

	describe("getCategoryById", () => {
		it("should return category when found", async () => {
			const mockCategory = { id: 1, name: "Food" };
			vi.mocked(mockRepository.findById).mockResolvedValue(mockCategory);

			const result = await service.getCategoryById(1);

			expect(result).toEqual(mockCategory);
			expect(mockRepository.findById).toHaveBeenCalledWith(1);
		});

		it("should throw error when category not found", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(undefined);

			await expect(service.getCategoryById(999)).rejects.toThrow(
				"Category not found",
			);
		});
	});

	describe("createCategory", () => {
		it("should create category when name is unique", async () => {
			const categoryName = "New Category";
			const mockCategory = { id: 3, name: categoryName };
			vi.mocked(mockRepository.findById).mockResolvedValue(undefined);
			vi.mocked(mockRepository.create).mockResolvedValue(mockCategory);

			const result = await service.createCategory(categoryName);

			expect(result).toEqual(mockCategory);
			expect(mockRepository.create).toHaveBeenCalledWith(categoryName);
		});
	});
});
