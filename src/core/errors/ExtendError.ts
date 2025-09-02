import { ApiError } from './ApiError';
import {ApiErrorCode} from "./ErrorCode";

export interface ExtendErrorInterface {
	errorCode: number;
	errorDisplayMessage?: string;
	errorMessage: string;
	processState?: string;
	rejectionCode?: number;
	rejectionDisplayMessage?: string;
	rejectionMessage?: string;
	rejectionComment?: string;
}

export function isExtendError(error: unknown): error is ExtendError {
	return error instanceof ExtendError;
}

// Ошибка выполнения запроса (серверный ответ, содержащий причину ошибки)
export class ExtendError extends ApiError<ApiErrorCode> {
	public readonly comment: string;
	constructor(source: string, public readonly response: ExtendErrorInterface) {
		let message = '';
		if (response.rejectionCode != null) {
			message = response.rejectionDisplayMessage || response.rejectionMessage || '';
		} else {
			message = response.errorDisplayMessage || response.errorMessage || '';
		}
		super(
			source,
			response.rejectionCode != null ? response.rejectionCode : response.errorCode,
			message,
			response.processState || '',
		)
		this.comment = response.rejectionComment || '';
	}
}
