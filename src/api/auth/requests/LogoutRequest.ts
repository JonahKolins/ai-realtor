import AuthRequest from './AuthRequest';
import AuthResponseHandler from '../handlers/AuthResponseHandler';

export default class LogoutRequest extends AuthRequest<{}> {
  protected url = '/auth/logout';
  protected method = 'POST';
  protected responseHandler = new AuthResponseHandler<{}>();
}
