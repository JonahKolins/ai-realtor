// базовый класс ошибки
export abstract class AbstractError extends Error {
	protected constructor(message: string) {
		super(message);
	}
}

// общее формирование текста любой ошибки
export const createErrorMessage = (code: number, text?: string, value?: string): string => {
	let message: string = `code = ${code}`;

	if (text && value) {
		message += `, ${text}, value = '${value}'`;
	} else if (text) {
		message += `, ${text}`;
	} else if (value) {
		message += `, value = '${value}'`;
	}

	return message;
}
