# AI Realtor

Современное веб-приложение на React + TypeScript с кастомным Webpack конфигом.

## 🚀 Быстрый старт

1. Установите зависимости:
```bash
npm install
```

2. Запустите dev сервер:
```bash
npm run dev
```

Приложение откроется по адресу: http://localhost:3000

## 🛠 Доступные команды

- `npm run dev` - Запуск dev сервера на localhost:3000
- `npm run build` - Сборка проекта для production
- `npm run type-check` - Проверка типов TypeScript

## 🏗 Технологии

- **React 18** - библиотека для UI
- **TypeScript 5** - типизированный JavaScript
- **Webpack 5** - кастомная настройка сборки
- **Sass** - препроцессор стилей с поддержкой CSS модулей
- **React Router v6** - клиентский роутинг с ленивой загрузкой

## 📁 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── Navbar/         # Навигация с CSS модулями
│   └── LoadingSpinner/ # Спиннер загрузки
├── pages/              # Страницы приложения
│   ├── HomePage/       # Главная страница
│   ├── CreatePage/     # Страница создания
│   └── NotFoundPage/   # 404 страница
├── styles/             # Глобальные стили
│   └── global.sass     # Общие стили (indented syntax)
├── types/              # TypeScript типы
│   └── css-modules.d.ts # Типы для CSS модулей
├── App.tsx             # Главный компонент с роутингом
└── index.tsx           # Точка входа
```

## 🎨 Стили

- **CSS модули**: `*.module.sass` - локальные стили компонентов
- **Глобальные стили**: `*.sass` - общие стили приложения
- **Синтаксис**: используется indented syntax (.sass), не SCSS

## 🔧 Конфигурация

### Webpack
- Кастомная настройка с поддержкой TypeScript
- Hot Module Replacement в dev режиме
- CSS модули для `*.module.sass`
- Разделение кода (code splitting)
- Source maps

### TypeScript
- Strict режим включен
- Поддержка алиасов (@/*)
- Типы для CSS модулей

## 📦 Особенности

- **Ленивая загрузка**: страницы загружаются по требованию
- **CSS модули**: изолированные стили компонентов
- **TypeScript**: полная типизация включая CSS модули
- **Modern React**: использует React 18 с новыми фичами
- **Dev Experience**: HMR + source maps для быстрой разработки
