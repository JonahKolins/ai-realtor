// Утилиты для валидации форм аутентификации

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Email обязателен');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Введите корректный email');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Пароль обязателен');
  } else {
    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Пароль должен содержать минимум одну букву');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Пароль должен содержать минимум одну цифру');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = { isValid: !!password.trim(), errors: password.trim() ? [] : ['Пароль обязателен'] };
  
  return {
    isValid: emailValidation.isValid && passwordValidation.isValid,
    errors: [...emailValidation.errors, ...passwordValidation.errors]
  };
};

export const validateRegisterForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  
  return {
    isValid: emailValidation.isValid && passwordValidation.isValid,
    errors: [...emailValidation.errors, ...passwordValidation.errors]
  };
};
