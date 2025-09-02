import {AbstractError} from "../errors/AbstractError";

const RUNTIME_ERROR_NAME = 'RuntimeError';

export class RuntimeError extends AbstractError {
	public readonly name = RUNTIME_ERROR_NAME;

	constructor(message: string) {
		super(`${RUNTIME_ERROR_NAME}: ${message}`);
	}

	// ошибка загрузки части приложения
	public static isChunkLoadingError(error: string): boolean {
		if (!error) return false;
		const e = error.toLowerCase();
		return e.includes('loading') && e.includes('chunk') && e.includes('failed');
	}
}
