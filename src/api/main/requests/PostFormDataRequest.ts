import RequestSender from '../RequestSender';
import IResponseHandler from '../handlers/IResponseHandler';
import { HOST, API_PREFIX } from './host';

export default abstract class PostFormDataRequest<TData> {
  protected abstract url: string;
  protected abstract formData: FormData;
  protected abstract responseHandler: IResponseHandler<TData>;
  
  protected additionalHeaders: Record<string, string> = {};
  protected additionalRequestInit: Partial<RequestInit> = {};
  protected timeout = 15000;
  protected host?: string;

  private get requestInit(): RequestInit {
    return {
      method: 'POST',
      credentials: 'include' as RequestCredentials, // Поддержка HttpOnly cookies
      headers: this.headers,
      body: this.formData,
      ...this.additionalRequestInit
    };
  }

  private get headers(): Headers {
    const headers = new Headers(this.additionalHeaders);
    
    // Не устанавливаем Content-Type - браузер сделает это автоматически
    // с правильным boundary для FormData
    
    return headers;
  }

  private getFullUrl(): string {
    const requestHost = this.host ?? HOST;
    return `${requestHost}${API_PREFIX}${this.url}`;
  }

  public async send(): Promise<TData> {
    try {
      const response = await RequestSender.sendRequest(
        this.getFullUrl(),
        this.requestInit,
        this.timeout
      );

      return await this.responseHandler.handleResponse(response);
    } catch (error) {
      throw new Error(`FormData request to ${this.url} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Дополнительные методы при необходимости
  public abort(): void {
    // Реализация отмены запроса при необходимости
  }
}
