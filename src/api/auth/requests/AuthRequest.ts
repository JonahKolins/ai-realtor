import { HOST, API_PREFIX } from '../../main/requests/host';
import RequestSender from '../../main/RequestSender';
import IResponseHandler from '../../main/handlers/IResponseHandler';

// Базовый класс для всех аутентификационных запросов
export default abstract class AuthRequest<TData> {
  protected abstract url: string;
  protected abstract method: string;
  protected abstract responseHandler: IResponseHandler<TData>;
  
  protected timeout = 15000;
  protected body?: unknown;

  // Всегда включаем credentials для работы с HttpOnly cookies
  private get requestInit(): RequestInit {
    const init: RequestInit = {
      method: this.method,
      credentials: 'include' as RequestCredentials,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.body) {
      init.body = JSON.stringify(this.body);
    }

    return init;
  }

  public async send(): Promise<TData> {
    const { url, requestInit, timeout, responseHandler } = this;
    
    const response = await RequestSender.sendRequest(
      `${HOST}${API_PREFIX}${url}`, 
      requestInit, 
      timeout
    );

    const data = await responseHandler.handleResponse(response);
    return data;
  }
}
