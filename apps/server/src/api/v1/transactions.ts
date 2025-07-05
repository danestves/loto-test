import { Hono } from "hono";

import {
	type ExpenseSummary,
	TransactionRepositoryImpl,
	TransactionService,
} from "../../domain/transaction/transaction.service";
import { withErrorHandling } from "../../lib/error-handling";
import * as responses from "../../lib/response";
import { validateId } from "../../lib/validation";
import {
	createTransactionRestSchema,
	transactionQueryFiltersSchema,
	updateTransactionRestSchema,
	updateTransactionStatusSchema,
} from "../../schemas";

const transactionRepository = new TransactionRepositoryImpl();
const transactionService = new TransactionService(transactionRepository);

const app = new Hono();

app.get(
	"/",
	withErrorHandling(async (c) => {
		const query = c.req.query();
		const filters = transactionQueryFiltersSchema.parse(query);

		const transactions = await transactionService.getTransactions({
			categoryId: filters.categoryId,
			status: filters.status,
			dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
			dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
		});

		return c.json(
			responses.successWithMeta(transactions, {
				count: transactions.length,
			}),
		);
	}),
);

app.get(
	"/summary",
	withErrorHandling(async (c) => {
		const summary = await transactionService.getExpenseSummary();

		const totalAmount = summary.reduce(
			(sum: number, item: ExpenseSummary) => sum + item.totalAmount,
			0,
		);
		const totalTransactions = summary.reduce(
			(sum: number, item: ExpenseSummary) => sum + item.transactionCount,
			0,
		);

		return c.json(
			responses.successWithMeta(summary, {
				totalAmount,
				totalTransactions,
				categoryCount: summary.length,
			}),
		);
	}),
);

app.post(
	"/",
	withErrorHandling(async (c) => {
		const body = await c.req.json();
		const validatedData = createTransactionRestSchema.parse(body);

		const transaction =
			await transactionService.createTransaction(validatedData);

		return c.json(responses.created(transaction), 201);
	}),
);

app.put(
	"/:id",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "transaction ID");
		const body = await c.req.json();
		const validatedData = updateTransactionRestSchema.parse(body);

		const transaction = await transactionService.updateTransaction(
			id,
			validatedData,
		);

		return c.json(responses.updated(transaction));
	}),
);

app.delete(
	"/:id",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "transaction ID");

		await transactionService.deleteTransaction(id);

		return c.json(responses.deleted());
	}),
);

app.patch(
	"/:id/status",
	withErrorHandling(async (c) => {
		const id = validateId(c.req.param("id"), "transaction ID");
		const body = await c.req.json();
		const validatedData = updateTransactionStatusSchema.parse(body);

		await transactionService.updateTransactionStatus(id, validatedData.status);

		return c.json(responses.message("Transaction status updated successfully"));
	}),
);

export default app;
