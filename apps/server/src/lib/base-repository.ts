import { eq, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";

import { db } from "../db";

export async function findById<T extends SQLiteTable>(
	table: T,
	id: number,
	idColumn: SQLiteColumn,
): Promise<T["$inferSelect"] | undefined> {
	const result = await db.select().from(table).where(eq(idColumn, id)).limit(1);
	return result[0];
}

export async function findAll<T extends SQLiteTable>(
	table: T,
	where?: SQL,
): Promise<T["$inferSelect"][]> {
	const query = db.select().from(table);

	if (where) {
		query.where(where);
	}

	return await query;
}

export async function deleteById<T extends SQLiteTable>(
	table: T,
	id: number,
	idColumn: SQLiteColumn,
): Promise<void> {
	await db.delete(table).where(eq(idColumn, id));
}

export async function insert<T extends SQLiteTable>(
	table: T,
	data: T["$inferInsert"],
): Promise<T["$inferSelect"]> {
	const result = await db.insert(table).values(data).returning();
	return result[0];
}

export async function update<T extends SQLiteTable>(
	table: T,
	id: number,
	data: Partial<T["$inferInsert"]>,
	idColumn: SQLiteColumn,
): Promise<T["$inferSelect"]> {
	const result = await db
		.update(table)
		.set(data)
		.where(eq(idColumn, id))
		.returning();
	return result[0];
}

export async function exists<T extends SQLiteTable>(
	table: T,
	id: number,
	idColumn: SQLiteColumn,
): Promise<boolean> {
	const result = await findById(table, id, idColumn);
	return !!result;
}
