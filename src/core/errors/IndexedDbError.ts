import {AbstractError} from "../errors/AbstractError";

const INDEXED_DB_ERROR_NAME = 'IndexedDbError';

// Если произошла ошибка с IndexedDb
export class IndexedDbError extends AbstractError {
	public readonly name = INDEXED_DB_ERROR_NAME;

	constructor(message: string) {
		super(`${INDEXED_DB_ERROR_NAME}: ${message}`);
	}
}

