// Утилиты для работы с CORS при разработке

export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function addCorsToRequestInit(requestInit: RequestInit): RequestInit {
  // В продакшне CORS настроен на бэкенде
  if (process.env.NODE_ENV === 'production') {
    return requestInit;
  }

  // В разработке добавляем заголовки если нужно
  return {
    ...requestInit,
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      ...requestInit.headers,
      'Content-Type': 'application/json',
    },
  };
}

export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && 
         typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
}
