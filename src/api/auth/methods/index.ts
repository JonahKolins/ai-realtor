import LoginRequest from '../requests/LoginRequest';
import RegisterRequest from '../requests/RegisterRequest';
import GetCurrentUserRequest from '../requests/GetCurrentUserRequest';
import LogoutRequest from '../requests/LogoutRequest';
import LogoutAllRequest from '../requests/LogoutAllRequest';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../../../types/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const request = new LoginRequest(credentials);
  return await request.send();
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const request = new RegisterRequest(credentials);
  return await request.send();
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const request = new GetCurrentUserRequest();
  return await request.send();
};

export const logoutUser = async (): Promise<void> => {
  const request = new LogoutRequest();
  await request.send();
};

export const logoutAllDevices = async (): Promise<void> => {
  const request = new LogoutAllRequest();
  await request.send();
};
