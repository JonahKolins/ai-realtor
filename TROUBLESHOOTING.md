# 🔧 Troubleshooting

## Проблемы при разработке

### ❌ "process is not defined" при локальной разработке

**Проблема:** Ошибка `ReferenceError: process is not defined` в браузере

**Причина:** `process` - это объект Node.js, недоступный в браузере

**✅ Исправлено:**
1. Добавлен `webpack.DefinePlugin` в `webpack.config.js`
2. Создана безопасная функция `getEnvVar()` в `host.ts`
3. Переменные окружения теперь правильно обрабатываются

### ❌ API запросы не работают локально

**Возможные причины:**
1. CORS ошибки
2. Неправильный URL API
3. Бэкенд недоступен

**🔍 Отладка:**
```javascript
// В консоли браузера будет выведена конфигурация:
🌐 API Configuration: {
  selectedHost: "https://ai-realtor-backend-production.up.railway.app",
  fullApiUrl: "https://ai-realtor-backend-production.up.railway.app/api/v1"
}
```

**✅ Проверьте:**
1. Доступность бэкенда: откройте `https://ai-realtor-backend-production.up.railway.app/api/v1/listings`
2. Правильность URL в `.env` файле
3. CORS настройки на бэкенде

### ❌ Webpack сборка падает

**Возможные причины:**
1. Отсутствует `.env` файл
2. Неправильные переменные окружения
3. Проблемы с SASS

**✅ Решение:**
```bash
# Создайте .env файл
cp .env.example .env

# Проверьте сборку
npm run build

# Проверьте dev режим
npm run dev
```

### ❌ Переменные окружения не работают

**Railway Production:**
- Автоматически настроены в `railway.json`
- Проверьте Variables в Railway Dashboard

**Локальная разработка:**
```bash
# .env
REACT_APP_API_HOST=https://ai-realtor-backend-production.up.railway.app
REACT_APP_API_PREFIX=/api/v1
NODE_ENV=development
```

### ❌ SASS файлы не компилируются

**Проблема:** Ошибки при импорте SASS файлов

**✅ Решение:**
1. Используйте относительные пути в SASS: `@use '../../styles/variables.module.sass'`
2. Абсолютные пути работают только в TS/JS: `import '@/styles/...'`

### ❌ TypeScript ошибки типов

**Отключена строгая типизация:**
```json
// tsconfig.json
{
  "strict": false,
  "strictNullChecks": false
}
```

**Для исправления:**
1. Используйте `|| ''` для строк
2. Используйте `|| null` для объектов
3. Добавляйте проверки типов

## Полезные команды

```bash
# Перезапуск с очисткой кэша
rm -rf node_modules/.cache && npm run dev

# Проверка переменных окружения
echo $REACT_APP_API_HOST

# Принудительная пересборка
npm run build -- --clean

# Отладка webpack
npm run dev -- --verbose
```

## Логи Railway

1. Зайдите в Railway Dashboard
2. Выберите ваш проект  
3. Перейдите в Deploy → View Logs
4. Найдите ошибки в логах сборки

## Тестирование API

```bash
# Проверка доступности бэкенда
curl https://ai-realtor-backend-production.up.railway.app/api/v1/listings

# Проверка с параметрами
curl "https://ai-realtor-backend-production.up.railway.app/api/v1/listings?page=1&limit=5"
```
