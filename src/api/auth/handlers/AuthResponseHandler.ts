import IResponseHandler from '../../main/handlers/IResponseHandler';
import { AuthErrorCode, AUTH_ERROR_STATUS_MAP } from '../../../types/auth';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export default class AuthResponseHandler<TData> implements IResponseHandler<TData> {
  async handleResponse(response: Response): Promise<TData> {
    // Проверяем успешность запроса
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      // Если ответ пустой (например, для logout)
      if (response.status === 204 || !contentType) {
        return {} as TData;
      }

      // Проверяем что это JSON
      if (!contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      try {
        const data = await response.json();
        return data as TData;
      } catch (error) {
        throw new Error(`Failed to parse JSON response: ${error}`);
      }
    }

    // Обрабатываем ошибки аутентификации
    const errorCode = AUTH_ERROR_STATUS_MAP[response.status] || AuthErrorCode.UNAUTHORIZED;
    
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Если не удалось распарсить JSON, используем дефолтное сообщение
    }

    throw new AuthError(errorCode, response.status, errorMessage);
  }
}
