import { z } from "zod/v4";

import { transactionStatus } from "../db/schema";

export const createTransactionSchema = z.object({
  cardLastFour: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.number(),
  transactionDate: z.date(),
  status: z.enum(transactionStatus).optional(),
});

export const updateTransactionSchema = z.object({
  cardLastFour: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  categoryId: z.number().optional(),
  transactionDate: z.date().optional(),
  status: z.enum(transactionStatus).optional(),
});

export const updateTransactionStatusSchema = z.object({
  status: z.enum(transactionStatus),
});

export const transactionFiltersSchema = z.object({
  categoryId: z.number().optional(),
  status: z.enum(transactionStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export const transactionIdSchema = z.object({
  id: z.number(),
});

export const transactionUpdateInputSchema = z.object({
  id: z.number(),
  cardLastFour: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  categoryId: z.number().optional(),
  transactionDate: z.date().optional(),
  status: z.enum(transactionStatus).optional(),
});

export const transactionUpdateStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(transactionStatus),
});

// REST API specific schemas with string date handling
export const createTransactionRestSchema = z.object({
  cardLastFour: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.number(),
  transactionDate: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
  status: z.enum(transactionStatus).optional(),
});

export const updateTransactionRestSchema = z.object({
  cardLastFour: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  categoryId: z.number().optional(),
  transactionDate: z.string().datetime().or(z.date()).transform((val) => new Date(val)).optional(),
  status: z.enum(transactionStatus).optional(),
});

export const transactionQueryFiltersSchema = z.object({
  categoryId: z.string().transform(Number).optional(),
  status: z.enum(transactionStatus).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateInputSchema>;
export type TransactionUpdateStatusInput = z.infer<typeof transactionUpdateStatusInputSchema>;
