import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { validateLoginForm } from '../../../utils/validation';
import styles from './LoginForm.module.sass';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError, isRateLimited, rateLimitedUntil } = useAuth();

  // Очищаем ошибки при изменении полей
  useEffect(() => {
    if (error) {
      clearError();
    }
    setValidationErrors([]);
  }, [email, password]);

  // Форматирование времени до окончания rate limit
  const formatRateLimitTime = (): string => {
    if (!rateLimitedUntil) return '';
    
    const remaining = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds} сек`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      return;
    }

    // Валидация
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const success = await login({ email: email.trim(), password });
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Ошибки обрабатываются в AuthService
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isRateLimited;

  return (
    <div className={styles.loginForm}>
      <h2 className={styles.title}>Вход в систему</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Rate limit уведомление */}
        {isRateLimited && (
          <div className={styles.rateLimitNotice}>
            Слишком много попыток входа. Попробуйте через {formatRateLimitTime()}
          </div>
        )}

        {/* Глобальная ошибка аутентификации */}
        {error && (
          <div className={styles.authError}>
            {error}
          </div>
        )}

        {/* Поле Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${styles.input} ${validationErrors.length > 0 ? styles.hasError : ''}`}
            placeholder="Введите ваш email"
            disabled={isFormDisabled}
            autoComplete="email"
            required
          />
        </div>

        {/* Поле Пароль */}
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${styles.input} ${validationErrors.length > 0 ? styles.hasError : ''}`}
            placeholder="Введите ваш пароль"
            disabled={isFormDisabled}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Ошибки валидации */}
        {validationErrors.length > 0 && (
          <ul className={styles.errorList}>
            {validationErrors.map((error, index) => (
              <li key={index} className={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isFormDisabled}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>

      {/* Ссылка на регистрацию */}
      {onSwitchToRegister && (
        <div className={styles.switchForm}>
          Нет аккаунта?{' '}
          <span className={styles.switchLink} onClick={onSwitchToRegister}>
            Зарегистрироваться
          </span>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
