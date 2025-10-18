import React, { useCallback, useState } from "react";
import styles from "./CreateListingPropertyDetails.module.sass";
import { Dropdown, Input, InputNumber, Select, Switch } from "antd";
import { IPropertyDetails } from "@/classes/listings/propertyDetails";
import { IoChevronDown } from "react-icons/io5";
import { PropertyType } from "@/classes/listings/Listing.types";
import { ENERGY_CLASSES, HEATING_TYPES } from "@/classes/listings/ListingUserFields";


interface CreateListingPropertyDetailsProps {
    onDetailsChange?: (details: IPropertyDetails, changedFields: Set<string>) => void;
}

const propertyTypeDropdownItems = [
    {
        key: PropertyType.HOUSE,
        label: 'House',
    },
    {
        key: PropertyType.APARTMENT,
        label: 'Apartment',
    },
    {
        key: PropertyType.CELLAR,
        label: 'Cellar',
    },
    {
        key: PropertyType.GARAGE,
        label: 'Garage',
    },
    {
        key: PropertyType.PARKING,
        label: 'Parking',
    },
    {
        key: PropertyType.COMMERCIAL,
        label: 'Commercial',
    },
];

export const CreateListingPropertyDetails = React.memo<CreateListingPropertyDetailsProps>(({ onDetailsChange }) => {

    const [details, setDetails] = useState<IPropertyDetails>({});
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
    const [extraInfo, setExtraInfo] = useState<string>('');
    const [isReady, setIsReady] = useState(false);

    //
    const [selectedPropertyType, setSelectedPropertyType] = useState<{key: PropertyType, label: string}>({key: PropertyType.HOUSE, label: 'House'});


    const handlePropertyTypeChange = (value: PropertyType) => {
        const propertyType = propertyTypeDropdownItems.find((item) => item.key === value);
        if (propertyType) {
            setSelectedPropertyType(propertyType);
        }
    }

    // Обработка изменения полей
    const handleFieldChange = useCallback((fieldName: keyof IPropertyDetails, value: any) => {        
        setDetails(prev => ({
            ...prev,
            [fieldName]: value
        }));
        
        setChangedFields(prev => new Set(prev).add(String(fieldName)));
        
        // Вызываем callback с обновленными данными
        if (onDetailsChange) {
            const updatedDetails = { ...details, [fieldName]: value };
            const updatedChangedFields = new Set(changedFields).add(String(fieldName));
            onDetailsChange(updatedDetails, updatedChangedFields);
        }
    }, [details, changedFields, onDetailsChange]);


    return (
        <div className={styles['create-listing-property-details']}>
            <div className={styles['create-listing-property-details__section-main-title']}>Property details</div>
            <div className={styles['create-listing-property-details__section-content']}>
                <div className={styles['content-container']}>
                    <div className={styles['input-label']}>Address</div>
                    <Input 
                        size="large"
                        type="text" 
                        value={details.address} 
                        onChange={(e) => handleFieldChange('address', e.target.value)} 
                    />
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']}>
                <div className={styles['content-container']}>
                    <div className={styles['input-label']}>Postal code</div>
                    <Input 
                        size="large"
                        type="text" 
                        value={details.postalCode} 
                        onChange={(e) => handleFieldChange('postalCode', e.target.value)} 
                    />
                </div>
                <div className={styles['content-container']}>
                    <div className={styles['input-label']}>City</div>
                    <Input 
                        size="large"
                        type="text"
                        value={details.city} 
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                    />
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-second-title']}>Main features</div>
            <div className={styles['create-listing-property-details__section-content']}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Area and layout</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Type</div>
                            <Dropdown 
                                menu={{ 
                                    items: propertyTypeDropdownItems, 
                                    onClick: ({ key }) => handlePropertyTypeChange(key as PropertyType) 
                                }} 
                                trigger={['hover']}
                            >
                                <Input 
                                    size="middle"
                                    type="text"
                                    value={selectedPropertyType.label}
                                    readOnly
                                />
                            </Dropdown>
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Rooms</div>
                            <InputNumber
                                min={1}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('rooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Square meters</div>
                            <InputNumber
                                min={1}
                                defaultValue={20}
                                onChange={(value: number) => handleFieldChange('squareMeters', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Bedrooms</div>
                            <InputNumber
                                min={0}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('bedrooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Bathrooms</div>
                            <InputNumber
                                min={0}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('bathrooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Levels</div>
                            <InputNumber
                                min={1}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('levels', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Floors</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Elevator</div>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Switch
                                    checked={details.elevator}
                                    onChange={(value: boolean) => handleFieldChange('elevator', value)}
                                />
                            </div>
                            <div className={styles['inline-view']} style={{marginTop: '8px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Floor</div>
                                    <InputNumber
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('floor', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Total floors</div>
                                    <InputNumber
                                        min={0}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('totalFloors', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Open spaces</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Balcony</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.balcony}
                                            onChange={(value: boolean) => handleFieldChange('balcony', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Balcony number</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('balconyNumber', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.balcony}
                                        />
                                    </div>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Balcony size</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('balconySize', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.balcony}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Terrace</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.terrace}
                                            onChange={(value: boolean) => handleFieldChange('terrace', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Terrace number</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('terraceNumber', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.terrace}
                                        />
                                    </div>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Terrace size</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('terraceSize', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.terrace}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Garden</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.garden}
                                            onChange={(value: boolean) => handleFieldChange('garden', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Garden size</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('gardenSquareMeters', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.garden}
                                        />
                                    </div>
                                    <div className={styles['content-container']}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Comfort</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Cellar</div>
                            <div style={{marginTop: "4px"}}>
                                <Switch
                                    checked={details.cellar}
                                    onChange={(value: boolean) => handleFieldChange('cellar', value)}
                                />
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Parking</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.parking}
                                            onChange={(value: boolean) => handleFieldChange('parking', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Parking places</div>
                                        <InputNumber
                                            min={0}
                                            defaultValue={0}
                                            onChange={(value: number) => handleFieldChange('parkingPlaces', value)}
                                            style={{width: '100%'}}
                                            disabled={!details.parking}
                                        />
                                    </div>
                                    <div className={styles['content-container']}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Service lines</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Water</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.water}
                                            onChange={(value: boolean) => handleFieldChange('water', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Electricity</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.electricity}
                                            onChange={(value: boolean) => handleFieldChange('electricity', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Gas</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.gas}
                                            onChange={(value: boolean) => handleFieldChange('gas', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Sewerage</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.sewerage}
                                            onChange={(value: boolean) => handleFieldChange('sewerage', value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Heating</div>
                                    <Select
                                        key="heating"
                                        value={details.heating || undefined}
                                        onChange={(val) => handleFieldChange('heating', val)}
                                        placeholder="Select heating type"
                                        size="middle"
                                        options={HEATING_TYPES.map(h => ({ value: h.value, label: h.label }))}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Custom heating</div>
                                    <Input 
                                        size="middle"
                                        type="text"
                                        value={details.heatingType} 
                                        placeholder="Enter custom heating type"
                                        onChange={(e) => handleFieldChange('heatingType', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Energy efficiency</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Energy class</div>
                            <Select
                                key="energyClass"
                                value={details.energyClass || undefined}
                                onChange={(val) => handleFieldChange('energyClass', val)}
                                placeholder="Select energy class"
                                size="middle"
                                options={ENERGY_CLASSES.map(e => ({ value: e.value, label: e.label }))}
                            />
                        </div>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Energy consumption, kWh/m² year</div>
                            <InputNumber
                                min={0}
                                defaultValue={0}
                                onChange={(value: number) => handleFieldChange('energyConsumption', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});