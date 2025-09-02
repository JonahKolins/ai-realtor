export enum ApiErrorCode {
	BadRequest = 1,                         // В запросе не определены какие-то обязательные поля
	TemporarilyUnavailable = 2,             // Сервис временно недоступен (перегружен)
	DuplicateRandomValue = 3,               // Обнаружено повторное использование значения "random"
	InvalidRequestId = 4,                   // RequestId не был получен, или время его действия истекло
	AuthenticationError = 5,                // Автор запроса не аутентифицирован, или аутентифицирован по-иному, чем при выполнении команды класса requestId
	AuthorizationError = 6,                 // Аутентифицированному автору запрещено выполнять такой запрос
	InvalidClientId = 7,                    // Неверный код клиента
	InvalidClientPassword = 8,              // Неверный пароль клиента
	InvalidCurrency = 9,                    // Неверная валюта
	DuplicateMarker = 10,                   // Повторный маркер
	InvalidOperation = 11,                  // Неверный код операции
	InvalidEmployee = 12,                   // Неверный логин сотрудника ФОНа
	InvalidEmployeePassword = 13,           // Неверный пароль сотрудника ФОНа
	ExceededMaximumLoginAttempts = 14,      // Превышено максимальное количество попыток ввода пароля
	RequestResultTooLarge = 15,             // Размер ответа на запрос слишком велик
	InvalidObjectId = 16,                   // Неверный код объекта
	InvalidSessionId = 17,                  // Неверный код сессии
	CaptchaRequired = 18,                   // Требуется операция с использованием капчи
	InvalidCaptchaId = 19, 	                // Неверный или устаревший код капчи
	LogicError = 22,						// Логическая ошибка
	TvStreamZeroBalanceError = 23,          // Запрещена трансляция с нулевым балансом
	caeExceededCommandFrequency = 24,       // Клиент превысил допустимую частоту запросов
	AuthCodeRequired = 26,                  // Требуется передача кода двухфакторной аутентификации
	SpamBlock = 31, 						// Слишком много запросов, попробуйте позже
	UnexpectedError = 100,                  // При выполнении запроса возникла нештатная ошибка
	TemporaryUnknownResult = 200,           // Результат запроса неизвестен, но может стать известным через некоторое время
	PermanentlyUnknownResult = 201,         // Результат запроса никогда не будет известен
	ServiceNotAvailableOnRequestedServer = -1, // Команда не может быть выполнена на запрашиваемом серсисе
}

export enum NetworkErrorCode {
	BadJSONFormat = 2001,                   // Сервер вернул нечитаемый JSON
	NoInternetConnection = 2002,            // Соединение с интернет, по-видимому прервано
	UnexpectedHTTPCode = 2003,              // Сервер вернул неожиданных HTTP код ответв
	CommonClientException = 2004,           // Необработанная ошибка на клиенте
	UnexpectedServerResponse = 2010,        // Неожиданный ответ от сервера
	AbortException = 2005,					// запрос был прерван
}
