export function success<T>(
	data: T,
	message?: string,
	meta?: Record<string, unknown>,
) {
	return {
		success: true,
		data,
		...(message && { message }),
		...(meta && { meta }),
	};
}

export function successWithMeta<T>(
	data: T,
	meta: Record<string, unknown>,
	message?: string,
) {
	return {
		success: true,
		data,
		meta,
		...(message && { message }),
	};
}

export function created<T>(data: T, message?: string) {
	return {
		success: true,
		data,
		message: message || "Resource created successfully",
	};
}

export function updated<T>(data: T, message?: string) {
	return {
		success: true,
		data,
		message: message || "Resource updated successfully",
	};
}

export function deleted(message?: string) {
	return {
		success: true,
		message: message || "Resource deleted successfully",
	};
}

export function message(message: string) {
	return {
		success: true,
		message,
	};
}
