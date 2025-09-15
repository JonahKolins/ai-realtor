import React, { useCallback, useMemo, useState } from 'react';
import { IoBedOutline, IoBusinessOutline, IoCashOutline, IoCellularOutline, IoHomeOutline, IoCarSportOutline, IoFileTrayFullOutline, IoStorefrontOutline, IoCartOutline} from "react-icons/io5";
import Button from '@/designSystem/button/Button';
import { PropertyType } from '@/classes/listings/Listing.types';
import { ListingType } from '@/api/network/listings';
import { IListingDraftData } from '@/classes/listings/ListingDraft';
import styles from './ListingTypeSection.module.sass';
import classNames from 'classnames';

export interface IListingTypeData {
    label: string;
    value: ListingType;
    icon: JSX.Element;
}

const listingTypes: IListingTypeData[] = [
    {label: 'Sell', value: 'sale', icon: <IoCashOutline size={24} />},
    {label: 'Rent out', value: 'rent', icon: <IoCellularOutline size={24} />},
];

export interface IPropertyData {
    caption: string;
    icon: JSX.Element | null;
    value: PropertyType;
}

const propertyTypes: IPropertyData[] = [
    {caption: 'House', icon: <IoHomeOutline size={24} />, value: PropertyType.HOUSE},
    {caption: 'Apartment', icon: <IoBusinessOutline size={24} />, value: PropertyType.APARTMENT},
    {caption: 'Cellar', icon: <IoFileTrayFullOutline size={24} />, value: PropertyType.CELLAR},
    {caption: 'Garage', icon: <IoCarSportOutline size={24} />, value: PropertyType.GARAGE},
    {caption: 'Parking', icon: <IoCartOutline size={24} />, value: PropertyType.PARKING},
    {caption: 'Commercial', icon: <IoStorefrontOutline size={24} />, value: PropertyType.COMMERCIAL},
];

const propertyTypesForRentOut: IPropertyData[] = [
    {caption: 'House', icon: <IoHomeOutline size={24} />, value: PropertyType.HOUSE},
    {caption: 'Apartment', icon: <IoBusinessOutline size={24} />, value: PropertyType.APARTMENT},
    {caption: 'Room', icon: <IoBedOutline size={24} />, value: PropertyType.ROOM},
    {caption: 'Cellar', icon: <IoFileTrayFullOutline size={24} />, value: PropertyType.CELLAR},
    {caption: 'Garage', icon: <IoCarSportOutline size={24} />, value: PropertyType.GARAGE},
    {caption: 'Parking', icon: <IoCartOutline size={24} />, value: PropertyType.PARKING},
    {caption: 'Commercial', icon: <IoStorefrontOutline size={24} />, value: PropertyType.COMMERCIAL},
];

interface ListingTypeSectionProps {
    data: IListingDraftData;
    updateListingType: (value: ListingType) => void;
    updatePropertyType: (value: PropertyType) => void;
    onNextStep: () => void;
    saveDraft: () => void;
}

// секция - тип объявления и тип недвижимости
const ListingTypeSection = React.memo<ListingTypeSectionProps>(({ data, onNextStep, updateListingType, updatePropertyType, saveDraft }) => {
    const {type, propertyType} = data || {};

    const [selectedListing, setSelectedListing] = useState<ListingType>(type || 'sale');

    // получение типов недвижимости в зависимости от типа объявления
    const propertyTypesByListingType = useMemo(() => {
        return selectedListing === 'rent' ? propertyTypesForRentOut : propertyTypes;
    }, [selectedListing]);

    // получение начального типа недвижимости
    const initialPropertyData = useMemo(() => {
        return propertyTypesByListingType.find((item: IPropertyData) => item.value === propertyType) || propertyTypes[0];
    }, [propertyType, propertyTypesByListingType]);

    const [selectedPropertyData, setSelectedPropertyData] = useState<IPropertyData>(initialPropertyData);
    const [hasChages, setHasChages] = useState<boolean>(false);

    // обработка выбора типа объявления
    const handleListingTypeChange = useCallback((value: ListingType) => {
        if (value !== selectedListing) {
            setHasChages(true);
            setSelectedListing(value);
            updateListingType(value);
        }
    }, [updateListingType, selectedListing])

    // обработка выбора типа недвижимости
    const handlePropertyTypeChange = useCallback((value: PropertyType) => {
        if (value !== selectedPropertyData.value) {
            setHasChages(true);
            setSelectedPropertyData(propertyTypesByListingType.find((item: IPropertyData) => item.value === value)!);
            updatePropertyType(value);
        }
    }, [updatePropertyType, selectedPropertyData, propertyTypesByListingType])

    // обработка нажатия на кнопку "Далее"
    const handleNextStep = useCallback(() => {
        saveDraft();
        onNextStep();
    }, [onNextStep, saveDraft]);

    // признак активности кнопки "Далее"
    const isNextStepDisabled = useMemo(() => {
        return !selectedPropertyData.value || !selectedListing;
    }, [selectedPropertyData, selectedListing]);

    return (
        <div className={styles['listing-type-section']}>
            <h1 className={styles['title']}>Listing</h1>
            <div className={styles['description']}>Choose the type of listing and the type of object you want to sell or rent out.</div>
            <div className={styles['field']}>
                <div className={styles['label']}>Type</div>
                <div className={styles['listing-types-container']}>
                    {listingTypes.map((item: IListingTypeData) => (
                        <div 
                            key={item.value}
                            className={classNames(styles['listing-type-item'], selectedListing === item.value && styles['_active'])}
                            onClick={() => handleListingTypeChange(item.value)}
                        >
                            <div className={styles['listing-type-item-icon']}>
                                <div>{item.icon}</div>
                                <div>{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles['field']}>
                <div className={styles['label']}>Object</div>
                <div className={styles['property-types-container']}>
                    {propertyTypesByListingType.map((item: IPropertyData) => (
                        <div 
                            key={item.value}
                            className={classNames(styles['property-type-item'], selectedPropertyData.value === item.value && styles['_active'])}
                            onClick={() => handlePropertyTypeChange(item.value)}
                        >
                            <div>{item.icon}</div>
                            <div>{item.caption}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles['field']}>
                <div className={styles['buttons']}>
                    <Button 
                        disabled={isNextStepDisabled}
                        onClick={handleNextStep}
                        className={styles['next-button']}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default ListingTypeSection;
