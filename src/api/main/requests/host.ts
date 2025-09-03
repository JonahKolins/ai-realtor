// Безопасно получаем переменные окружения (с fallback для браузера)
const getEnvVar = (name: string, defaultValue: string): string => {
  // Проверяем доступность process (Node.js окружение)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }
  return defaultValue;
};

// Определяем окружение
const isRailwayEnvironment = typeof window !== 'undefined' && window.location.hostname.includes('.railway.app');
const isProductionBuild = getEnvVar('NODE_ENV', 'development') === 'production';

// Получаем хосты из переменных окружения или используем дефолтные
const INTERNAL_HOST = getEnvVar('REACT_APP_INTERNAL_API_HOST', 'http://ai-realtor-backend.railway.internal:8080');
const EXTERNAL_HOST = getEnvVar('REACT_APP_API_HOST', 'https://ai-realtor-backend-production.up.railway.app');

// Выбираем хост в зависимости от окружения
export const HOST = isRailwayEnvironment && isProductionBuild 
  ? INTERNAL_HOST 
  : EXTERNAL_HOST;

export const API_PREFIX = getEnvVar('REACT_APP_API_PREFIX', '/api/v1');

// Для отладки в консоли (только в dev режиме)
if (getEnvVar('NODE_ENV', 'development') === 'development') {
  console.log('🌐 API Configuration:', {
    isRailwayEnvironment,
    isProductionBuild,
    selectedHost: HOST,
    apiPrefix: API_PREFIX,
    fullApiUrl: `${HOST}${API_PREFIX}`,
    envVars: {
      REACT_APP_API_HOST: getEnvVar('REACT_APP_API_HOST', ''),
      REACT_APP_INTERNAL_API_HOST: getEnvVar('REACT_APP_INTERNAL_API_HOST', ''),
      REACT_APP_API_PREFIX: getEnvVar('REACT_APP_API_PREFIX', '')
    }
  });
}