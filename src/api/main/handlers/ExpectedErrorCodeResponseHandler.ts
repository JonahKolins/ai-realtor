import IResponseHandler from './IResponseHandler';
import BadResponseError from '../errors/BadResponseError';
import UnauthorizedError from "../errors/UnauthorizedError";

export default class ExpectedErrorCodeResponseHandler implements IResponseHandler<Response> {
  public async handleResponse(response: Response) {
    if (response.status === 401) {
      throw new UnauthorizedError(response);
    }
    if (!response.ok) {
      throw new BadResponseError(response);
    }

    return response;
  }
}
