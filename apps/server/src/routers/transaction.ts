import { TransactionRepositoryImpl, TransactionService } from "../domain/transaction/transaction.service";
import { publicProcedure } from "../lib/orpc";
import {
  createTransactionSchema,
  transactionFiltersSchema,
  transactionIdSchema,
  transactionUpdateInputSchema,
  transactionUpdateStatusInputSchema,
} from "../schemas";

const transactionRepository = new TransactionRepositoryImpl();
const transactionService = new TransactionService(transactionRepository);

export const transactionRouter = {
    create: publicProcedure
        .input(createTransactionSchema)
        .handler(async ({ input }) => {
            return await transactionService.createTransaction(input);
        }),

    update: publicProcedure
        .input(transactionUpdateInputSchema)
        .handler(async ({ input }) => {
            const { id, ...updateData } = input;
            return await transactionService.updateTransaction(id, updateData);
        }),

    delete: publicProcedure
        .input(transactionIdSchema)
        .handler(async ({ input }) => {
            await transactionService.deleteTransaction(input.id);
            return { success: true };
        }),

    getAll: publicProcedure
        .input(transactionFiltersSchema.optional())
        .handler(async ({ input }) => {
            return await transactionService.getTransactions(input);
        }),

    updateStatus: publicProcedure
        .input(transactionUpdateStatusInputSchema)
        .handler(async ({ input }) => {
            await transactionService.updateTransactionStatus(input.id, input.status);
            return { success: true };
        }),

    getExpenseSummary: publicProcedure.handler(async () => {
        return await transactionService.getExpenseSummary();
    }),
};
