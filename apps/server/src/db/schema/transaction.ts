import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { category } from "./category";
import { timestamps } from "./utils/timestamps";

export const transactionStatus = ["pending", "approved", "rejected"] as const;
export type TransactionStatus = typeof transactionStatus[number];

export const transaction = sqliteTable("transaction", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cardLastFour: text("card_last_four").notNull(),
    amount: real("amount").notNull(),
    categoryId: integer("category_id")
        .notNull()
        .references(() => category.id),
    transactionDate: integer("transaction_date", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    status: text("status", { enum: transactionStatus })
        .notNull()
        .default("pending"),
    ...timestamps,
});
