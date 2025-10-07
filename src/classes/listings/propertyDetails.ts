import { PropertyType } from "./Listing.types";
import { IListingUserFields } from "./ListingUserFields";

/**
 * Интерфейс для деталей недвижимости
 * Расширяет IListingUserFields для обратной совместимости
 */
export interface IPropertyDetails extends IListingUserFields {
    // Наследует все поля из IListingUserFields
    // Дополнительные поля для UI-специфичных нужд могут быть добавлены здесь
}

export type IPropertyInitialDetails = Record<PropertyType, IPropertyDetails>;

export const propertyInitialDetails: IPropertyInitialDetails = {
    [PropertyType.HOUSE]: {
        // Локация
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        address: '',
        // Площадь и планировка
        squareMeters: undefined,
        levels: 1,
        rooms: 1,
        bedrooms: undefined,
        bathrooms: undefined,
        // Этаж
        floor: undefined,
        totalFloors: undefined,
        elevator: false,
        // Удобства
        cellar: false,
        balcony: false,
        balconyNumber: undefined,
        balconySize: undefined,
        terrace: false,
        terraceSize: undefined,
        parking: false,
        parkingPlaces: undefined,
        garden: false,
        gardenSquareMeters: undefined,
        // Коммуникации
        heating: '',
        heatingType: '',
        water: false,
        electricity: false,
        gas: false,
        sewerage: false,
        // Энергоэффективность
        energyClass: '',
        // Расстояния
        walkingDistanceMetro: undefined,
        metroStation: '',
        walkingDistancePark: undefined,
        parkName: '',
        walkingDistanceShops: undefined,
        walkingDistanceSchools: undefined,
        // Финансы
        condoFees: undefined,
        // Состояние
        condition: '',
        yearBuilt: undefined,
        yearRenovated: undefined,
    },
    [PropertyType.APARTMENT]: {
        // Локация
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        address: '',
        // Площадь и планировка
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
        levels: 1,
        rooms: 1,
        bedrooms: undefined,
        bathrooms: undefined,
        // Этаж
        elevator: false,
        // Удобства
        cellar: false,
        balcony: false,
        balconyNumber: undefined,
        balconySize: undefined,
        terrace: false,
        terraceSize: undefined,
        parking: false,
        parkingPlaces: undefined,
        // Коммуникации
        heating: '',
        heatingType: '',
        // Энергоэффективность
        energyClass: '',
        // Расстояния
        walkingDistanceMetro: undefined,
        metroStation: '',
        walkingDistancePark: undefined,
        parkName: '',
        walkingDistanceShops: undefined,
        walkingDistanceSchools: undefined,
        // Финансы
        condoFees: undefined,
        // Состояние
        condition: '',
        yearBuilt: undefined,
        yearRenovated: undefined,
    },
    [PropertyType.CELLAR]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
    },
    [PropertyType.GARAGE]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
    },
    [PropertyType.PARKING]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
        parkingPlaces: undefined
    },
    [PropertyType.COMMERCIAL]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
        levels: undefined,
        rooms: undefined,
        parking: false,
        parkingPlaces: undefined,
        heating: '',
        energyClass: '',
        yearBuilt: undefined,
    },
    [PropertyType.ROOM]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
    },
    [PropertyType.DEFAULT]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        city: '',
        neighborhood: '',
        squareMeters: undefined,
        floor: undefined,
        totalFloors: undefined,
        levels: undefined,
        rooms: undefined
    }
}