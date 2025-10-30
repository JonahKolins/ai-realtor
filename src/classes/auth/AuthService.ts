import { 
  AuthState, 
  AuthStatus, 
  LoginCredentials, 
  RegisterCredentials, 
  User,
  AuthErrorCode,
  AUTH_ERROR_MESSAGES 
} from '../../types/auth';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  logoutUser, 
  logoutAllDevices 
} from '../../api/auth/methods';
import { AuthError } from '../../api/auth/handlers/AuthResponseHandler';

type AuthEventType = 'authStateChanged' | 'error' | 'rateLimited';

interface AuthEventHandlers {
  authStateChanged: (state: AuthState) => void;
  error: (error: string) => void;
  rateLimited: (retryAfter: number) => void;
}

class AuthService {
  private state: AuthState = {
    user: null,
    status: 'loading',
    error: null
  };

  private eventHandlers: Map<AuthEventType, Set<Function>> = new Map();
  private rateLimitEndTime: number | null = null;

  constructor() {
    // Инициализируем обработчики событий
    this.eventHandlers.set('authStateChanged', new Set());
    this.eventHandlers.set('error', new Set());
    this.eventHandlers.set('rateLimited', new Set());
  }

  // Геттер для получения текущего состояния
  public getState(): AuthState {
    return { ...this.state };
  }

  // Подписка на события
  public on<T extends AuthEventType>(event: T, handler: AuthEventHandlers[T]): () => void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }

    // Возвращаем функцию отписки
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  // Эмит событий
  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandlers[T]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as any)(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Обновление состояния
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('authStateChanged', this.getState());
  }

  // Обработка ошибок аутентификации
  private handleAuthError(error: unknown): string {
    if (error instanceof AuthError) {
      // Обработка rate limiting
      if (error.code === AuthErrorCode.RATE_LIMITED) {
        const retryAfter = this.extractRetryAfter(error);
        this.handleRateLimit(retryAfter);
        return AUTH_ERROR_MESSAGES[AuthErrorCode.RATE_LIMITED];
      }

      const message = AUTH_ERROR_MESSAGES[error.code] || error.message;
      this.updateState({ error: message, status: 'error' });
      this.emit('error', message);
      return message;
    }

    const genericError = 'Произошла ошибка. Попробуйте позже';
    this.updateState({ error: genericError, status: 'error' });
    this.emit('error', genericError);
    return genericError;
  }

  // Извлечение времени повтора из заголовков
  private extractRetryAfter(error: AuthError): number {
    // В реальном проекте это можно извлечь из заголовков ответа
    // Пока используем дефолтное значение 60 секунд
    return 60;
  }

  // Обработка rate limiting
  private handleRateLimit(retryAfterSeconds: number): void {
    this.rateLimitEndTime = Date.now() + (retryAfterSeconds * 1000);
    this.emit('rateLimited', retryAfterSeconds);
    
    // Автоматически убираем блокировку после истечения времени
    setTimeout(() => {
      this.rateLimitEndTime = null;
    }, retryAfterSeconds * 1000);
  }

  // Проверка rate limit
  private checkRateLimit(): boolean {
    if (this.rateLimitEndTime && Date.now() < this.rateLimitEndTime) {
      const remainingSeconds = Math.ceil((this.rateLimitEndTime - Date.now()) / 1000);
      this.emit('rateLimited', remainingSeconds);
      return true;
    }
    return false;
  }

  // Проверка статуса аутентификации при загрузке приложения
  public async checkAuthStatus(): Promise<void> {
    if (this.checkRateLimit()) {
      return;
    }

    try {
      this.updateState({ status: 'loading', error: null });
      const response = await getCurrentUser();
      this.updateState({ 
        user: response.user, 
        status: 'authenticated', 
        error: null 
      });
    } catch (error) {
      // Если пользователь не авторизован, это нормально
      if (error instanceof AuthError && error.code === AuthErrorCode.UNAUTHORIZED) {
        this.updateState({ 
          user: null, 
          status: 'unauthenticated', 
          error: null 
        });
      } else {
        this.handleAuthError(error);
      }
    }
  }

  // Вход в систему
  public async login(credentials: LoginCredentials): Promise<boolean> {
    if (this.checkRateLimit()) {
      return false;
    }

    try {
      this.updateState({ status: 'loading', error: null });
      const response = await loginUser(credentials);
      this.updateState({ 
        user: response.user, 
        status: 'authenticated', 
        error: null 
      });
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  // Регистрация
  public async register(credentials: RegisterCredentials): Promise<boolean> {
    if (this.checkRateLimit()) {
      return false;
    }

    try {
      this.updateState({ status: 'loading', error: null });
      const response = await registerUser(credentials);
      this.updateState({ 
        user: response.user, 
        status: 'authenticated', 
        error: null 
      });
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  // Выход из системы
  public async logout(): Promise<void> {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      // Продолжаем выход даже если запрос не удался
    } finally {
      this.updateState({ 
        user: null, 
        status: 'unauthenticated', 
        error: null 
      });
    }
  }

  // Выход со всех устройств
  public async logoutAll(): Promise<void> {
    try {
      await logoutAllDevices();
    } catch (error) {
      console.error('Logout all error:', error);
      // Продолжаем выход даже если запрос не удался
    } finally {
      this.updateState({ 
        user: null, 
        status: 'unauthenticated', 
        error: null 
      });
    }
  }

  // Очистка ошибок
  public clearError(): void {
    this.updateState({ error: null });
  }

  // Проверка аутентификации
  public isAuthenticated(): boolean {
    return this.state.status === 'authenticated' && this.state.user !== null;
  }

  // Проверка загрузки
  public isLoading(): boolean {
    return this.state.status === 'loading';
  }

  // Получение текущего пользователя
  public getCurrentUser(): User | null {
    return this.state.user;
  }
}

// Экспортируем синглтон
export const authService = new AuthService();
export default authService;
