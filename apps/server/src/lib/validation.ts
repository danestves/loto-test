import { HTTPException } from "hono/http-exception";

export function validateId(id: string | number, resourceName = "ID"): number {
	const numericId = typeof id === "string" ? Number(id) : id;

	if (Number.isNaN(numericId)) {
		throw new HTTPException(400, {
			message: `Invalid ${resourceName}`,
		});
	}

	return numericId;
}

export function validateCardLastFour(cardLastFour: string): void {
	if (!/^\d{4}$/.test(cardLastFour)) {
		throw new Error("Card number must be exactly 4 digits");
	}
}

export function validateAmount(amount: number): void {
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}
}

export function validateCategoryName(name: string): void {
	if (!name || name.length < 1 || name.length > 100) {
		throw new Error("Category name must be between 1 and 100 characters");
	}
}
