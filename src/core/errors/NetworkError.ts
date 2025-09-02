import {AbstractError, createErrorMessage} from "../errors/AbstractError";
import {NetworkErrorCode} from "../errors/ErrorCode";

const NETWORK_ERROR_NAME = 'NetworkError';

export function isNetworkError(error: unknown): error is NetworkError {
	return error instanceof NetworkError;
}

// Внутренние ошибки сети, проблема с JSON и т.д.
export class NetworkError extends AbstractError {
	public readonly name = NETWORK_ERROR_NAME;

	constructor(source: string, public readonly code: NetworkErrorCode, public readonly text: string, public readonly value?: string) {
		super(`${NETWORK_ERROR_NAME} - ${source}: ${createErrorMessage(code, text)}`);
	}
}
