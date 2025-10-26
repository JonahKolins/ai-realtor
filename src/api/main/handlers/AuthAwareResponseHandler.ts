import IResponseHandler from './IResponseHandler';
import authService from '../../../services/AuthService';

/**
 * Обработчик ответов с автоматической обработкой ошибок аутентификации
 */
export default class AuthAwareResponseHandler<TData> implements IResponseHandler<TData> {
  async handleResponse(response: Response): Promise<TData> {
    // Обрабатываем 401 ошибки автоматически
    if (response.status === 401) {
      // Очищаем состояние аутентификации
      await authService.logout();
      throw new Error('Сессия истекла. Необходимо войти в систему заново');
    }

    // Для успешных ответов
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      // Если ответ пустой (например, для DELETE запросов)
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

    // Для других ошибок пытаемся получить сообщение от сервера
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Если не удалось распарсить JSON, используем дефолтное сообщение
    }

    throw new Error(errorMessage);
  }
}
