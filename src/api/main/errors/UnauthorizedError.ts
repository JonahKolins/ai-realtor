import ApplicationError from './ApplicationError';

export default class UnauthorizedError extends ApplicationError {
  public name = 'UnauthorizedError';

  public constructor(public response: Response) {
    super(`Unauthorized error when performing ${response.url} request: ${response.status}`);
  }
}
