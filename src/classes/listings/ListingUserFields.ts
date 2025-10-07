/**
 * Интерфейс для пользовательских полей листинга
 * Версия 2.0 - адаптировано под mustCover систему AI генерации
 */

export interface IListingUserFields {
    // === ОБЯЗАТЕЛЬНЫЕ для высокого quality score ===
    
    // Локация (Required для mustCover)
    city?: string;              // Город (например: "Milano")
    neighborhood?: string;      // Район/зона (например: "Porta Romana")
    address?: string;           // Полный адрес
    street?: string;            // Улица отдельно
    flatNumber?: string;        // Номер квартиры
    postalCode?: string;        // CAP
    community?: string;         // Communa
    province?: string;          // Провинция
    
    // Площадь и планировка (Required для mustCover)
    squareMeters?: number;      // Общая площадь в m² (было area)
    rooms?: number;             // Всего комнат
    bedrooms?: number;          // Спальни отдельно
    bathrooms?: number;         // Санузлы отдельно
    levels?: number;            // Уровни (для таунхаусов)
    
    // Этаж (Required для mustCover)
    floor?: number;             // Этаж
    totalFloors?: number;       // Всего этажей в здании
    elevator?: boolean;         // Лифт
    
    // === ОПЦИОНАЛЬНЫЕ (повышают quality score) ===
    
    // Открытые пространства (Optional для mustCover)
    balcony?: boolean;          // Есть балкон
    balconySize?: number;       // Размер балкона в m²
    balconyNumber?: number;     // Количество балконов
    terrace?: boolean;          // Есть терраса
    terraceSize?: number;       // Размер террасы в m²
    
    // Удобства
    cellar?: boolean;           // Погреб/кладовая
    parking?: boolean;          // Парковка
    parkingPlaces?: number;     // Количество мест
    garden?: boolean;           // Сад
    gardenSquareMeters?: number;
    
    // Коммуникации
    heating?: string;           // Тип отопления: "autonomo a metano", "centralizzato", "pompa di calore"
    heatingType?: string;       // Альтернативное название
    water?: boolean;
    electricity?: boolean;
    gas?: boolean;
    sewerage?: boolean;
    
    // Энергоэффективность (Optional для mustCover)
    energyClass?: string;       // "A", "B", "C", "D", "E", "F", "G"
    
    // Расстояния пешком (Optional для mustCover - ВАЖНО!)
    walkingDistanceMetro?: number;   // Минут до метро
    metroStation?: string;           // Название станции метро
    walkingDistancePark?: number;    // Минут до парка
    parkName?: string;               // Название парка
    walkingDistanceShops?: number;   // Минут до магазинов
    walkingDistanceSchools?: number; // Минут до школ
    
    // Финансы (Optional для mustCover)
    condoFees?: number;         // Платежи за кондо (€/месяц)
    
    // Состояние и год
    condition?: string;         // "new", "renovated", "to_be_restored", "good", "excellent"
    yearBuilt?: number;         // Год постройки
    yearRenovated?: number;     // Год ремонта
    
    // Дополнительно
    extraInfo?: string;
    
    // Расширяемость
    [key: string]: any;
}

// Константы для выбора значений

export const HEATING_TYPES = [
    { value: 'autonomo_a_metano', label: 'Autonomo a metano' },
    { value: 'centralizzato', label: 'Centralizzato' },
    { value: 'pompa_di_calore', label: 'Pompa di calore' },
    { value: 'elettrico', label: 'Elettrico' },
    { value: 'condizionatori', label: 'Condizionatori' },
    { value: 'radiatori', label: 'Radiatori' },
    { value: 'pavimento', label: 'Riscaldamento a pavimento' },
] as const;

export const ENERGY_CLASSES = [
    { value: 'A+', label: 'A+' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' },
] as const;

export const CONDITION_TYPES = [
    { value: 'new', label: 'Nuovo' },
    { value: 'excellent', label: 'Ottimo' },
    { value: 'good', label: 'Buono' },
    { value: 'renovated', label: 'Ristrutturato' },
    { value: 'to_be_restored', label: 'Da ristrutturare' },
] as const;

