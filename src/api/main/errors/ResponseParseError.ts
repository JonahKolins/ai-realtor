import ApplicationError from './ApplicationError';

export default class ResponseParseError extends ApplicationError {
  public name = 'ResponseParseError';

  public constructor(public response: Response, public originalError: unknown, message = 'Get response parse error') {
    super(message);
  }

  public toJSON() {
    const { name, message } = this;

    return {
      name,
      message,
    };
  }
}
