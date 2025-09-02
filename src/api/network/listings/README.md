# Listings API

API для работы с объявлениями недвижимости.

## Эндпоинт

```
GET http://localhost:4000/api/v1/listings
```

## Параметры запроса

| Параметр | Тип | Описание | Значение по умолчанию |
|----------|-----|----------|----------------------|
| `status` | `'draft' \| 'ready' \| 'archived'` | Статус объявления | - |
| `type` | `'sale' \| 'rent'` | Тип операции | - |
| `q` | `string` | Поиск по названию (ILIKE) | - |
| `page` | `number` | Номер страницы | `1` |
| `limit` | `number` | Количество на странице | `20` |
| `sort` | `string` | Сортировка | `'-createdAt'` |

## Пример ответа

```json
{
  "items": [
    {
      "id": "773a7b43-b01e-4125-b6e0-f3cfdf8951df",
      "type": "sale",
      "status": "draft", 
      "title": "Тестовая квартира в Милане",
      "price": 199000,
      "userFields": {
        "city": "Milano",
        "floor": 2,
        "balcony": true
      },
      "createdAt": "2025-08-28T09:20:38.962Z",
      "updatedAt": "2025-08-28T09:20:38.962Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

## Использование

```typescript
import { requestListings } from '../api/network/listings';

// Все листинги
const allListings = await requestListings();

// Только продажа
const saleListings = await requestListings({ type: 'sale' });

// Поиск
const searchResults = await requestListings({ 
  q: 'квартира',
  page: 1,
  limit: 10 
});

// Готовые для аренды
const rentListings = await requestListings({
  type: 'rent',
  status: 'ready',
  sort: '-createdAt'
});
```

## Типы

```typescript
export type ListingType = 'sale' | 'rent';
export type ListingStatus = 'draft' | 'ready' | 'archived';

export interface IListing {
  id: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  price: number;
  userFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IListingsResponse {
  items: IListing[];
  page: number;
  limit: number;
  total: number;
}
```
