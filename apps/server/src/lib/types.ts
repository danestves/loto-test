export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	meta?: Record<string, unknown>;
}

export interface PaginationMeta extends Record<string, unknown> {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApiResponseWithPagination<T = unknown> extends ApiResponse<T> {
	meta: PaginationMeta;
}

export interface ErrorResponse {
	success: false;
	message: string;
	errors?: unknown[];
}

export type ServiceMethod<T extends unknown[], R> = (...args: T) => Promise<R>;

export type RepositoryMethod<T extends unknown[], R> = (
	...args: T
) => Promise<R>;
