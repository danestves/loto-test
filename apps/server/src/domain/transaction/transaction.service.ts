import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../../db";
import type { TransactionStatus } from "../../db/schema";
import { category, transaction } from "../../db/schema";
import * as dbUtils from "../../lib/base-repository";
import { validateAmount, validateCardLastFour } from "../../lib/validation";

export interface TransactionFilters {
	categoryId?: number;
	status?: TransactionStatus;
	dateFrom?: Date;
	dateTo?: Date;
}

export interface CreateTransactionInput {
	cardLastFour: string;
	amount: number;
	categoryId: number;
	transactionDate: Date;
	status?: TransactionStatus;
}

export interface UpdateTransactionInput {
	cardLastFour?: string;
	amount?: number;
	categoryId?: number;
	transactionDate?: Date;
	status?: TransactionStatus;
}

export interface TransactionWithCategory {
	id: number;
	cardLastFour: string;
	amount: number;
	categoryId: number;
	categoryName: string;
	transactionDate: Date;
	status: TransactionStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface ExpenseSummary {
	categoryId: number;
	categoryName: string;
	totalAmount: number;
	transactionCount: number;
}

export interface TransactionRepository {
	findAll(filters?: TransactionFilters): Promise<TransactionWithCategory[]>;
	findById(id: number): Promise<typeof transaction.$inferSelect | undefined>;
	create(
		input: CreateTransactionInput,
	): Promise<typeof transaction.$inferSelect>;
	update(
		id: number,
		input: UpdateTransactionInput,
	): Promise<typeof transaction.$inferSelect>;
	delete(id: number): Promise<void>;
	updateStatus(id: number, status: TransactionStatus): Promise<void>;
	getExpenseSummaryByCategory(): Promise<ExpenseSummary[]>;
}

export class TransactionService {
	constructor(private repository: TransactionRepository) {}

	async createTransaction(input: CreateTransactionInput) {
		validateCardLastFour(input.cardLastFour);
		validateAmount(input.amount);

		return this.repository.create(input);
	}

	async updateTransaction(id: number, input: UpdateTransactionInput) {
		const existingTransaction = await this.repository.findById(id);
		if (!existingTransaction) {
			throw new Error("Transaction not found");
		}

		if (input.cardLastFour) {
			validateCardLastFour(input.cardLastFour);
		}

		if (input.amount !== undefined) {
			validateAmount(input.amount);
		}

		return this.repository.update(id, input);
	}

	async deleteTransaction(id: number) {
		const existingTransaction = await this.repository.findById(id);
		if (!existingTransaction) {
			throw new Error("Transaction not found");
		}

		await this.repository.delete(id);
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

export class TransactionRepositoryImpl implements TransactionRepository {
	async findAll(
		filters?: TransactionFilters,
	): Promise<TransactionWithCategory[]> {
		const conditions = [];

		if (filters?.categoryId) {
			conditions.push(eq(transaction.categoryId, filters.categoryId));
		}

		if (filters?.status) {
			conditions.push(eq(transaction.status, filters.status));
		}

		if (filters?.dateFrom) {
			conditions.push(gte(transaction.transactionDate, filters.dateFrom));
		}

		if (filters?.dateTo) {
			conditions.push(lte(transaction.transactionDate, filters.dateTo));
		}

		const result = await db
			.select({
				id: transaction.id,
				cardLastFour: transaction.cardLastFour,
				amount: transaction.amount,
				categoryId: transaction.categoryId,
				categoryName: category.name,
				transactionDate: transaction.transactionDate,
				status: transaction.status,
				createdAt: transaction.createdAt,
				updatedAt: transaction.updatedAt,
			})
			.from(transaction)
			.leftJoin(category, eq(transaction.categoryId, category.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		return result.map((row) => ({
			...row,
			categoryName: row.categoryName || "Unknown",
			createdAt: new Date(row.createdAt),
			updatedAt: new Date(row.updatedAt),
		})) as TransactionWithCategory[];
	}

	async findById(id: number) {
		return dbUtils.findById(transaction, id, transaction.id);
	}

	async create(input: CreateTransactionInput) {
		return dbUtils.insert(transaction, input);
	}

	async update(id: number, input: UpdateTransactionInput) {
		return dbUtils.update(
			transaction,
			id,
			{
				...(input.cardLastFour && { cardLastFour: input.cardLastFour }),
				...(input.amount !== undefined && { amount: input.amount }),
				...(input.categoryId !== undefined && { categoryId: input.categoryId }),
				...(input.transactionDate && {
					transactionDate: input.transactionDate,
				}),
				...(input.status && { status: input.status }),
			},
			transaction.id,
		);
	}

	async delete(id: number) {
		return dbUtils.deleteById(transaction, id, transaction.id);
	}

	async updateStatus(id: number, status: TransactionStatus) {
		await dbUtils.update(transaction, id, { status }, transaction.id);
	}

	async getExpenseSummaryByCategory(): Promise<ExpenseSummary[]> {
		const result = await db
			.select({
				categoryId: transaction.categoryId,
				categoryName: category.name,
				totalAmount: sql<number>`CAST(SUM(${transaction.amount}) AS REAL)`,
				transactionCount: sql<number>`COUNT(${transaction.id})`,
			})
			.from(transaction)
			.leftJoin(category, eq(transaction.categoryId, category.id))
			.groupBy(transaction.categoryId, category.name);

		return result as ExpenseSummary[];
	}
}
