import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { validateRegisterForm } from '../../../utils/validation';
import styles from './RegisterForm.module.sass';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const { register, error, clearError, isRateLimited, rateLimitedUntil } = useAuth();

  // Очищаем ошибки при изменении полей
  useEffect(() => {
    if (error) {
      clearError();
    }
    setValidationErrors([]);
  }, [email, password]);

  // Проверка требований к паролю для визуального отображения
  const getPasswordRequirements = () => {
    return [
      { text: 'Минимум 8 символов', satisfied: password.length >= 8 },
      { text: 'Минимум одна буква', satisfied: /[a-zA-Z]/.test(password) },
      { text: 'Минимум одна цифра', satisfied: /[0-9]/.test(password) }
    ];
  };

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
    const validation = validateRegisterForm(email, password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const success = await register({ email: email.trim(), password });
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
    <div className={styles.registerForm}>
      <h2 className={styles.title}>Регистрация</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Rate limit уведомление */}
        {isRateLimited && (
          <div className={styles.rateLimitNotice}>
            Слишком много попыток регистрации. Попробуйте через {formatRateLimitTime()}
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
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
            className={`${styles.input} ${validationErrors.length > 0 ? styles.hasError : ''}`}
            placeholder="Создайте пароль"
            disabled={isFormDisabled}
            autoComplete="new-password"
            required
          />
          
          {/* Требования к паролю */}
          {(showPasswordRequirements || password.length > 0) && (
            <div className={styles.passwordRequirements}>
              <div className={styles.requirementsTitle}>Требования к паролю:</div>
              <ul className={styles.requirementsList}>
                {getPasswordRequirements().map((req, index) => (
                  <li
                    key={index}
                    className={`${styles.requirementItem} ${req.satisfied ? styles.satisfied : ''}`}
                  >
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      {/* Ссылка на вход */}
      {onSwitchToLogin && (
        <div className={styles.switchForm}>
          Уже есть аккаунт?{' '}
          <span className={styles.switchLink} onClick={onSwitchToLogin}>
            Войти
          </span>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
