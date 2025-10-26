// Типы для системы аутентификации

export interface User {
  id: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

// Типы для форм аутентификации
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// Типы для API ответов
export interface AuthResponse {
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Коды ошибок аутентификации
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  USER_BLOCKED = 'USER_BLOCKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED'
}

// Маппинг HTTP статусов к кодам ошибок
export const AUTH_ERROR_STATUS_MAP: Record<number, AuthErrorCode> = {
  400: AuthErrorCode.INVALID_CREDENTIALS,
  401: AuthErrorCode.UNAUTHORIZED,
  409: AuthErrorCode.EMAIL_TAKEN,
  423: AuthErrorCode.USER_BLOCKED,
  429: AuthErrorCode.RATE_LIMITED
};

// Сообщения об ошибках для пользователя
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Неверный email или пароль',
  [AuthErrorCode.EMAIL_TAKEN]: 'Этот email уже используется',
  [AuthErrorCode.USER_BLOCKED]: 'Ваш аккаунт заблокирован',
  [AuthErrorCode.UNAUTHORIZED]: 'Необходимо войти в систему',
  [AuthErrorCode.RATE_LIMITED]: 'Слишком много попыток. Попробуйте позже'
};
