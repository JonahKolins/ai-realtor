import AuthRequest from './AuthRequest';
import AuthResponseHandler from '../handlers/AuthResponseHandler';

export default class LogoutAllRequest extends AuthRequest<{}> {
  protected url = '/auth/logout-all';
  protected method = 'POST';
  protected responseHandler = new AuthResponseHandler<{}>();
}
