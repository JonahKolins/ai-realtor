import AuthRequest from './AuthRequest';
import AuthResponseHandler from '../handlers/AuthResponseHandler';
import { AuthResponse } from '../../../types/auth';

export default class GetCurrentUserRequest extends AuthRequest<AuthResponse> {
  protected url = '/auth/me';
  protected method = 'GET';
  protected responseHandler = new AuthResponseHandler<AuthResponse>();
}
