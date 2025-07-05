import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";

export function handleValidationError(error: z.ZodError): HTTPException {
	return new HTTPException(400, {
		message: "Invalid request data",
		cause: error.issues,
	});
}

export function handleNotFoundError(resourceName: string): HTTPException {
	return new HTTPException(404, {
		message: `${resourceName} not found`,
	});
}

export function handleConflictError(message: string): HTTPException {
	return new HTTPException(409, {
		message,
	});
}

export function handleBusinessLogicError(error: Error): HTTPException {
	if (error.message.includes("not found")) {
		return new HTTPException(404, {
			message: error.message,
		});
	}

	if (error.message.includes("already exists")) {
		return new HTTPException(409, {
			message: error.message,
		});
	}

	if (
		error.message.includes("4 digits") ||
		error.message.includes("greater than 0") ||
		error.message.includes("between 1 and 100")
	) {
		return new HTTPException(400, {
			message: error.message,
		});
	}

	return new HTTPException(500, {
		message: "Internal server error",
	});
}

export function handleUnknownError(
	message = "Internal server error",
): HTTPException {
	return new HTTPException(500, {
		message,
	});
}

export function withErrorHandling<T extends Response>(
	handler: (c: Context) => Promise<T>,
): (c: Context) => Promise<T> {
	return async (c: Context): Promise<T> => {
		try {
			return await handler(c);
		} catch (error) {
			if (error instanceof HTTPException) {
				throw error;
			}

			if (error instanceof z.ZodError) {
				throw handleValidationError(error);
			}

			if (error instanceof Error) {
				throw handleBusinessLogicError(error);
			}

			throw handleUnknownError();
		}
	};
}
