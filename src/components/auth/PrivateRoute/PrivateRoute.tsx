import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../LoadingSpinner/LoadingSpinner';
import AuthModal from '../AuthModal/AuthModal';

interface PrivateRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Утилиты для работы с redirect URL
const REDIRECT_KEY = 'auth_redirect_after_login';

const saveRedirectPath = (path: string) => {
  sessionStorage.setItem(REDIRECT_KEY, path);
};

const getRedirectPath = (): string | null => {
  return sessionStorage.getItem(REDIRECT_KEY);
};

const clearRedirectPath = () => {
  sessionStorage.removeItem(REDIRECT_KEY);
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, status } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Если пользователь не авторизован и не идет загрузка
    if (status === 'unauthenticated') {
      // Сохраняем текущий путь для редиректа после входа
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/') {
        saveRedirectPath(currentPath);
      }
      
      // Показываем модальное окно аутентификации
      setShowAuthModal(true);
    } else if (isAuthenticated) {
      // Если пользователь авторизовался, проверяем есть ли сохраненный путь для редиректа
      const redirectPath = getRedirectPath();
      if (redirectPath && redirectPath !== window.location.pathname + window.location.search) {
        clearRedirectPath();
        window.location.href = redirectPath;
      }
      setShowAuthModal(false);
    }
  }, [status, isAuthenticated]);

  // Показываем лоадер во время проверки аутентификации
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Если пользователь не авторизован, показываем модальное окно аутентификации
  if (!isAuthenticated) {
    return (
      <>
        {/* Показываем затемненный контент с уведомлением */}
        <div style={{
          position: 'relative',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          color: '#6c757d',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div>
            <h2>Требуется авторизация</h2>
            <p>Для доступа к этой странице необходимо войти в систему</p>
          </div>
        </div>

        {/* Модальное окно аутентификации */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // При закрытии модала перенаправляем на главную страницу
            clearRedirectPath();
            window.location.href = '/';
          }}
          initialMode="login"
        />
      </>
    );
  }

  // Если пользователь авторизован, показываем защищенный контент
  return <>{children}</>;
};

export default PrivateRoute;
