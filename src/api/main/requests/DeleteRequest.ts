import RequestSender from '../RequestSender';
import IResponseHandler from '../handlers/IResponseHandler';
import { HOST, API_PREFIX } from './host';

export default abstract class DeleteRequest<TData> {
  protected abstract url: string;

  protected abstract responseHandler: IResponseHandler<TData>;

  protected additionalHeaders: Record<string, string> = {};

  protected additionalRequestInit: Partial<RequestInit> = {};

  protected timeout = 15000;

  protected host?: string;

  private get requestInit(): RequestInit {
    const { additionalHeaders, additionalRequestInit } = this;

    return {
      method: 'DELETE',
      credentials: 'include' as RequestCredentials, // Поддержка HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders,
      },
      ...additionalRequestInit
    };
  }

  public async send() {
    const { url, requestInit, timeout, responseHandler, host } = this;
    const requestHost = host ? host : HOST;

    const response = await RequestSender.sendRequest(`${requestHost}${API_PREFIX}${url}`, requestInit, timeout);

    const data = await responseHandler.handleResponse(response);

    return data;
  }
}
