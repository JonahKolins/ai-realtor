import ResponseParseError from './ResponseParseError';

export default class JSONResponseParseError extends ResponseParseError {
  public name = 'JSONResponseParseError';

  public constructor(public response: Response, public originalError: unknown) {
    super(response, originalError);
  }
}
