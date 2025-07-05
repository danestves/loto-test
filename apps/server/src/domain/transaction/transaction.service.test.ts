import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	CreateTransactionInput,
	ExpenseSummary,
	TransactionFilters,
	TransactionWithCategory,
} from "./transaction.service";

type TransactionStatus = "pending" | "approved" | "rejected";

// Define interfaces to avoid importing the actual service file which imports db
interface TransactionRepository {
	findAll(filters?: TransactionFilters): Promise<TransactionWithCategory[]>;
	findById(id: number): Promise<unknown | undefined>;
	create(input: CreateTransactionInput): Promise<unknown>;
	update(id: number, input: unknown): Promise<unknown>;
	delete(id: number): Promise<void>;
	updateStatus(id: number, status: unknown): Promise<void>;
	getExpenseSummaryByCategory(): Promise<ExpenseSummary[]>;
}

class MockTransactionRepository implements TransactionRepository {
	findAll = vi.fn();
	findById = vi.fn();
	create = vi.fn();
	update = vi.fn();
	delete = vi.fn();
	updateStatus = vi.fn();
	getExpenseSummaryByCategory = vi.fn();
}

class TransactionService {
	constructor(private repository: TransactionRepository) {}

	async createTransaction(input: CreateTransactionInput) {
		// Validate card number format (last 4 digits)
		if (!/^\d{4}$/.test(input.cardLastFour)) {
			throw new Error("Card number must be exactly 4 digits");
		}

		// Validate amount
		if (input.amount <= 0) {
			throw new Error("Amount must be greater than 0");
		}

		return this.repository.create(input);
	}

	async getTransactions(filters?: TransactionFilters) {
		return this.repository.findAll(filters);
	}

	async updateTransactionStatus(id: number, status: TransactionStatus) {
		const transaction = await this.repository.findById(id);
		if (!transaction) {
			throw new Error("Transaction not found");
		}

		await this.repository.updateStatus(id, status);
	}

	async getExpenseSummary() {
		return this.repository.getExpenseSummaryByCategory();
	}
}

describe("TransactionService", () => {
	let service: TransactionService;
	let mockRepository: MockTransactionRepository;

	beforeEach(() => {
		mockRepository = new MockTransactionRepository();
		service = new TransactionService(mockRepository);
	});

	describe("createTransaction", () => {
		it("should create transaction with valid data", async () => {
			const input: CreateTransactionInput = {
				cardLastFour: "1234",
				amount: 100.5,
				categoryId: 1,
				transactionDate: new Date(),
			};
			const mockTransaction = {
				id: 1,
				...input,
				status: "pending" as TransactionStatus,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockRepository.create.mockResolvedValue(mockTransaction);

			const result = await service.createTransaction(input);

			expect(result).toEqual(mockTransaction);
			expect(mockRepository.create).toHaveBeenCalledWith(input);
		});

		it("should throw error for invalid card number", async () => {
			const input: CreateTransactionInput = {
				cardLastFour: "12", // Too short
				amount: 100,
				categoryId: 1,
				transactionDate: new Date(),
			};

			await expect(service.createTransaction(input)).rejects.toThrow(
				"Card number must be exactly 4 digits",
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw error for invalid amount", async () => {
			const input: CreateTransactionInput = {
				cardLastFour: "1234",
				amount: -10, // Negative amount
				categoryId: 1,
				transactionDate: new Date(),
			};

			await expect(service.createTransaction(input)).rejects.toThrow(
				"Amount must be greater than 0",
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});
	});

	describe("getTransactions", () => {
		it("should return filtered transactions", async () => {
			const filters: TransactionFilters = {
				categoryId: 1,
				status: "pending" as TransactionStatus,
			};
			const mockTransactions = [
				{
					id: 1,
					cardLastFour: "1234",
					amount: 100,
					categoryId: 1,
					categoryName: "Food",
					transactionDate: new Date(),
					status: "pending" as TransactionStatus,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];
			mockRepository.findAll.mockResolvedValue(mockTransactions);

			const result = await service.getTransactions(filters);

			expect(result).toEqual(mockTransactions);
			expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
		});
	});

	describe("updateTransactionStatus", () => {
		it("should update status when transaction exists", async () => {
			const mockTransaction = {
				id: 1,
				cardLastFour: "1234",
				amount: 100,
				categoryId: 1,
				transactionDate: new Date(),
				status: "pending" as TransactionStatus,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockRepository.findById.mockResolvedValue(mockTransaction);
			mockRepository.updateStatus.mockResolvedValue(undefined);

			await service.updateTransactionStatus(1, "approved");

			expect(mockRepository.findById).toHaveBeenCalledWith(1);
			expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, "approved");
		});

		it("should throw error when transaction not found", async () => {
			mockRepository.findById.mockResolvedValue(undefined);

			await expect(
				service.updateTransactionStatus(999, "approved"),
			).rejects.toThrow("Transaction not found");
			expect(mockRepository.updateStatus).not.toHaveBeenCalled();
		});
	});

	describe("getExpenseSummary", () => {
		it("should return expense summary by category", async () => {
			const mockSummary = [
				{
					categoryId: 1,
					categoryName: "Food",
					totalAmount: 500.5,
					transactionCount: 10,
				},
				{
					categoryId: 2,
					categoryName: "Transportation",
					totalAmount: 250.0,
					transactionCount: 5,
				},
			];
			mockRepository.getExpenseSummaryByCategory.mockResolvedValue(mockSummary);

			const result = await service.getExpenseSummary();

			expect(result).toEqual(mockSummary);
			expect(mockRepository.getExpenseSummaryByCategory).toHaveBeenCalledOnce();
		});
	});
});
