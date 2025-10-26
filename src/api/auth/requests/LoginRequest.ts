import AuthRequest from './AuthRequest';
import AuthResponseHandler from '../handlers/AuthResponseHandler';
import { LoginCredentials, AuthResponse } from '../../../types/auth';

export default class LoginRequest extends AuthRequest<AuthResponse> {
  protected url = '/auth/login';
  protected method = 'POST';
  protected responseHandler = new AuthResponseHandler<AuthResponse>();

  constructor(credentials: LoginCredentials) {
    super();
    this.body = credentials;
  }
}
