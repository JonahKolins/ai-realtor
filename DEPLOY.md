# Деплой на Railway

## Подготовка проекта

Проект настроен для деплоя на Railway со статическим хостингом.

### Структура файлов для деплоя:

- `railway.json` - конфигурация Railway
- `nixpacks.toml` - конфигурация Nixpacks (билдер)
- `public/_redirects` - правила редиректов для SPA
- `.railwayignore` - файлы для исключения из деплоя

### Backend API

Проект настроен для работы с бэкендом на Railway:

**Внешний доступ (всегда работает):**
```
https://ai-realtor-backend-production.up.railway.app/api/v1
```

**Внутренняя Railway сеть (быстрее, только Railway ↔ Railway):**
```
http://ai-realtor-backend.railway.internal:8080/api/v1
```

**Автоматический выбор:**
- В локальной разработке → внешний URL
- При деплое на Railway → внутренний URL (оптимизация скорости)

## Инструкции по деплою

### 1. Подключение к Railway

1. Зайдите на [railway.app](https://railway.app)
2. Авторизуйтесь через GitHub
3. Нажмите "New Project" → "Deploy from GitHub repo"
4. Выберите репозиторий `ai-realtor`

### 2. Настройка проекта

Railway автоматически:
- Обнаружит `nixpacks.toml` и `railway.json`
- Установит зависимости (`npm ci`)
- Соберет проект (`npm run build`)
- Настроит статический хостинг из папки `dist/`

### 3. Автоматическая настройка

Никаких дополнительных настроек не требуется:
- ✅ Автоматические деплои при push в main
- ✅ SPA роутинг через `_redirects`
- ✅ Правильный publicPath для статики
- ✅ Оптимизированная сборка

### 4. После деплоя

1. Railway предоставит URL вида: `https://your-app-name.up.railway.app`
2. Проект будет автоматически обновляться при изменениях в репозитории

## Команды для разработки

```bash
# Локальная разработка
npm run dev

# Сборка для продакшена  
npm run build

# Проверка типов
npm run type-check
```

## Структура проекта

```
ai-realtor/
├── public/
│   ├── index.html
│   └── _redirects          # SPA роутинг
├── src/                    # Исходный код
├── dist/                   # Собранные файлы (Railway статика)
├── railway.json           # Конфигурация Railway
├── nixpacks.toml          # Конфигурация сборки
└── .railwayignore         # Исключения для деплоя
```

## Переменные окружения

### Автоматически настраиваются в Railway:

```bash
NODE_ENV=production
REACT_APP_API_HOST=https://ai-realtor-backend-production.up.railway.app
REACT_APP_INTERNAL_API_HOST=http://ai-realtor-backend.railway.internal:8080
REACT_APP_API_PREFIX=/api/v1
```

### Для локальной разработки (.env):

```bash
REACT_APP_API_HOST=https://ai-realtor-backend-production.up.railway.app
REACT_APP_API_PREFIX=/api/v1
NODE_ENV=development
```

### Настройка связи между сервисами Railway:

1. **Frontend проект** (этот) → использует внутреннюю Railway сеть
2. **Backend проект** (`ai-realtor-backend`) → Railway internal URL: `ai-realtor-backend.railway.internal:8080`
3. **Автоматическое переключение** между внешним/внутренним URL

## Troubleshooting

### Ошибка "undefined variable 'npm'" в Nixpacks

Если возникает ошибка с `npm` в Nix:
1. ✅ Исправлено: убран `npm` из `nixpacks.toml` (npm входит в nodejs)
2. Как последний вариант - удалите `nixpacks.toml` (Railway автоматически определит Node.js проект)

### Другие проблемы

Если деплой не работает:
1. Проверьте логи в Railway Dashboard
2. Убедитесь что `npm run build` работает локально
3. Проверьте что все файлы закоммичены в git
4. Попробуйте упрощенную конфигурацию или автоматическое определение
