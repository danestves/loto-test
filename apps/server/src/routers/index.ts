import { publicProcedure } from "../lib/orpc";
import { categoryRouter } from "./category";
import { transactionRouter } from "./transaction";

export const appRouter = {
    healthCheck: publicProcedure.handler(() => {
        return "OK";
    }),
    category: categoryRouter,
    transaction: transactionRouter,
};
export type AppRouter = typeof appRouter;
