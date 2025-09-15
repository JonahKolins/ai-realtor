import { PropertyType } from "./Listing.types";

export interface IPropertyDetails {
    // address
    street?: string;
    flatNumber?: string;
    postalCode?: string; // CAP
    community?: string; // Communa
    province?: string;
    // property details
    squareMeters?: number;
    levels?: number;
    rooms?: number;
    floor?: number;
    //
    cellar?: boolean;
    // balcony
    balcony?: boolean;
    balconyNumber?: number;
    terrace?: boolean;
    // parking
    parking?: boolean;
    parkingPlaces?: number;
    // garden
    garden?: boolean;
    gardenSquareMeters?: number;
    // elevator
    elevator?: boolean;
    // 
    heating?: boolean;
    water?: boolean;
    electricity?: boolean;
    gas?: boolean;
    sewerage?: boolean;
    // extraInfo
    extraInfo?: string;
}

export type IPropertyInitialDetails = Record<PropertyType, IPropertyDetails>;

export const propertyInitialDetails: IPropertyInitialDetails = {
    [PropertyType.HOUSE]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        levels: 1,
        rooms: 1,
        cellar: false,
        balcony: false,
        terrace: false,
        parking: false,
        garden: false,
        gardenSquareMeters: undefined,
        elevator: false,
        heating: false,
        water: false,
        electricity: false,
        gas: false,
        sewerage: false
    },
    [PropertyType.APARTMENT]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined,
        levels: 1,
        rooms: 1,
        cellar: false,
        balcony: false,
        terrace: false,
        parking: false,
        elevator: false
    },
    [PropertyType.CELLAR]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined
    },
    [PropertyType.GARAGE]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined
    },
    [PropertyType.PARKING]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined,
        parkingPlaces: undefined
    },
    [PropertyType.COMMERCIAL]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined,
        levels: undefined,
        rooms: undefined,
        parking: false,
        parkingPlaces: undefined
    },
    [PropertyType.ROOM]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined
    },
    [PropertyType.DEFAULT]: {
        street: '',
        flatNumber: '',
        postalCode: '',
        community: '',
        province: '',
        squareMeters: undefined,
        floor: undefined,
        levels: undefined,
        rooms: undefined
    }
}