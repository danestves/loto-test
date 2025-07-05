import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "./utils/timestamps";

export const category = sqliteTable("category", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    ...timestamps,
});
