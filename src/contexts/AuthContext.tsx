import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import authService from '../services/AuthService';

interface AuthContextType extends AuthState {
  // Методы аутентификации
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;
  
  // Вспомогательные методы
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Rate limiting
  isRateLimited: boolean;
  rateLimitedUntil: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);

  useEffect(() => {
    // Подписываемся на изменения состояния аутентификации
    const unsubscribeAuthState = authService.on('authStateChanged', (newState) => {
      setAuthState(newState);
    });

    // Подписываемся на rate limiting
    const unsubscribeRateLimit = authService.on('rateLimited', (retryAfterSeconds) => {
      setIsRateLimited(true);
      const until = Date.now() + (retryAfterSeconds * 1000);
      setRateLimitedUntil(until);

      // Автоматически убираем флаг rate limit
      setTimeout(() => {
        setIsRateLimited(false);
        setRateLimitedUntil(null);
      }, retryAfterSeconds * 1000);
    });

    // Проверяем статус аутентификации при монтировании
    authService.checkAuthStatus();

    // Очищаем подписки при размонтировании
    return () => {
      unsubscribeAuthState();
      unsubscribeRateLimit();
    };
  }, []);

  const contextValue: AuthContextType = {
    // Состояние
    ...authState,
    isAuthenticated: authService.isAuthenticated(),
    isLoading: authService.isLoading(),
    isRateLimited,
    rateLimitedUntil,

    // Методы
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    logoutAll: authService.logoutAll.bind(authService),
    clearError: authService.clearError.bind(authService),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
