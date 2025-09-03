# 🔗 API Конфигурация для Railway

## Автоматическая настройка связи Frontend ↔ Backend

### 🎯 Как это работает:

**1. Автоматическое определение окружения:**
```typescript
// src/api/main/requests/host.ts
const isRailwayEnvironment = window.location.hostname.includes('.railway.app');
const isProductionBuild = process.env.NODE_ENV === 'production';
```

**2. Выбор оптимального хоста:**
- **Локально:** `https://ai-realtor-backend-production.up.railway.app` (внешний)
- **Railway → Railway:** `http://ai-realtor-backend.railway.internal:8080` (внутренний, быстрее)

### 🚀 Railway Internal Network

**Преимущества внутренней сети:**
- ✅ **Быстрее** - нет выхода в интернет
- ✅ **Надежнее** - прямое соединение между сервисами
- ✅ **Бесплатно** - не тратит bandwidth
- ✅ **Безопаснее** - трафик не выходит из Railway

### 📋 Конфигурация в Railway

**В `railway.json` автоматически настроены переменные:**
```json
{
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "REACT_APP_API_HOST": "https://ai-realtor-backend-production.up.railway.app",
        "REACT_APP_INTERNAL_API_HOST": "http://ai-realtor-backend.railway.internal:8080",
        "REACT_APP_API_PREFIX": "/api/v1"
      }
    }
  }
}
```

### 🔧 Локальная разработка

**Создайте `.env` файл:**
```bash
cp .env.example .env
```

**Настройте API хост:**
```bash
# .env
REACT_APP_API_HOST=https://ai-realtor-backend-production.up.railway.app
REACT_APP_API_PREFIX=/api/v1
NODE_ENV=development
```

### 🐛 Отладка API

**В dev режиме выводится конфигурация в консоль:**
```javascript
🌐 API Configuration: {
  isRailwayEnvironment: false,
  isProductionBuild: false,
  selectedHost: "https://ai-realtor-backend-production.up.railway.app",
  apiPrefix: "/api/v1",
  fullApiUrl: "https://ai-realtor-backend-production.up.railway.app/api/v1"
}
```

### 📡 API Endpoints

**Все запросы автоматически используют правильный хост:**

- `GET /api/v1/listings` - получить листинги
- `POST /api/v1/listings` - создать листинг
- `GET /api/v1/listings/:id` - получить листинг по ID

### ⚡ CORS настройки

**Настроены в `src/api/utils/cors.ts`:**
- В dev режиме добавляются CORS заголовки
- В production CORS настроен на бэкенде
- Автоматическое определение локальной разработки

### 🔄 Переключение между API серверами

**Для тестирования другого API сервера:**
```bash
# Локально переопределить хост
REACT_APP_API_HOST=http://localhost:8080 npm run dev

# Или в production через Railway variables
```

### 📂 Структура API модулей

```
src/api/
├── main/
│   ├── requests/
│   │   ├── host.ts           # 🎯 Конфигурация хоста
│   │   ├── GetRequest.ts     # GET запросы
│   │   ├── PostRequest.ts    # POST запросы
│   │   └── PostFormDataRequest.ts # FormData загрузка
│   ├── handlers/             # Обработчики ответов
│   └── errors/              # Типы ошибок
├── network/
│   └── listings/            # API листингов
└── utils/
    └── cors.ts              # CORS утилиты
```

### ✅ Готовые интеграции

- ✅ Автоматическое переключение хостов
- ✅ Environment variables поддержка  
- ✅ TypeScript типизация API
- ✅ Error handling
- ✅ CORS настройки
- ✅ Timeout handling
- ✅ Railway internal network optimization
