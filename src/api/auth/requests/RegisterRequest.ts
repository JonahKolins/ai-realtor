import AuthRequest from './AuthRequest';
import AuthResponseHandler from '../handlers/AuthResponseHandler';
import { RegisterCredentials, AuthResponse } from '../../../types/auth';

export default class RegisterRequest extends AuthRequest<AuthResponse> {
  protected url = '/auth/register';
  protected method = 'POST';
  protected responseHandler = new AuthResponseHandler<AuthResponse>();

  constructor(credentials: RegisterCredentials) {
    super();
    this.body = credentials;
  }
}
