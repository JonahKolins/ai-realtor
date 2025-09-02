import { ApiErrorCode } from './ErrorCode';
import { AbstractError, createErrorMessage } from './AbstractError';

const API_ERROR_NAME = 'ApiError';

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

// Если произошла ошибка с IndexedDb
export class ApiError<T extends number = ApiErrorCode> extends AbstractError {
	public name = API_ERROR_NAME;

	constructor(source: string, public readonly code: T, public readonly text: string, public readonly value: string) {
		super(`${API_ERROR_NAME} - ${source}: ${createErrorMessage(code, text, value)}`);
	}

	public is(type: T): boolean {
		return this.code === type;
	}

	public not(type: T): boolean {
		return this.code !== type;
	}
}
