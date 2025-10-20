import React, { useCallback, useEffect, useState } from "react";
import styles from "./CreateListingPropertyDetails.module.sass";
import { Dropdown, Input, InputNumber, Select, Switch } from "antd";
import { IPropertyDetails, propertyInitialDetails } from "@/classes/listings/propertyDetails";
import { IoChevronDown } from "react-icons/io5";
import { PropertyType } from "@/classes/listings/Listing.types";
import { CONDITION_TYPES, ENERGY_CLASSES, HEATING_TYPES } from "@/classes/listings/ListingUserFields";
import TextArea from "antd/es/input/TextArea";
import { IListingDraftData } from "@/classes/listings/ListingDraft";


interface CreateListingPropertyDetailsProps {
    data: IListingDraftData;
    updatePropertyType: (propertyType: PropertyType) => void;
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

const extraInfoField = 'extraInfo';

export const CreateListingPropertyDetails = React.memo<CreateListingPropertyDetailsProps>(({ data, updatePropertyType, onDetailsChange }) => {

    const [details, setDetails] = useState<IPropertyDetails>({});
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
    const [extraInfo, setExtraInfo] = useState<string>('');
    const [isReady, setIsReady] = useState(false);

    const [selectedPropertyType, setSelectedPropertyType] = useState<{key: PropertyType, label: string}>({key: data.propertyType || PropertyType.HOUSE, label: data.propertyType || 'House'});

    // Отдельный useEffect для изменения типа недвижимости
    useEffect(() => {
        if (data.propertyType && data.propertyType !== PropertyType.DEFAULT) {
            const initialDetails = propertyInitialDetails[data.propertyType];
            setDetails(initialDetails);
            
            // Очищаем состояния при смене типа недвижимости
            setExtraInfo('');
            setChangedFields(new Set());
            setIsReady(true);
        }
    }, [data.propertyType]);

    // Отдельный useEffect для синхронизации с userFields
    useEffect(() => {
        if (data.userFields && isReady) {
            const initialDetails = propertyInitialDetails[data.propertyType] || {};
            
            // Мержим начальные данные с уже существующими userFields
            const mergedDetails = {
                ...initialDetails,
                ...data.userFields // Перезаписываем начальные данные сохраненными
            };
            
            setDetails(mergedDetails);
            
            // Также восстанавливаем extraInfo если есть
            if (data.userFields.extraInfo) {
                setExtraInfo(data.userFields.extraInfo);
            }

            if (data.propertyType) {
                setSelectedPropertyType({key: data.propertyType, label: propertyTypeDropdownItems.find((item) => item.key === data.propertyType)?.label || ''});
            }
            
            // Определяем какие поля были изменены (отличаются от начальных значений)
            const changed = new Set<string>();
            Object.keys(data.userFields).forEach(key => {
                const initialValue = initialDetails[key as keyof IPropertyDetails];
                const currentValue = data.userFields![key];
                
                // Считаем поле измененным если значение отличается от начального
                if (currentValue !== initialValue) {
                    changed.add(key);
                }
            });
            setChangedFields(changed);
        }
    }, [data.userFields, data.propertyType, isReady]);


    const handlePropertyTypeChange = (value: PropertyType) => {
        const propertyType = propertyTypeDropdownItems.find((item) => item.key === value);
        if (propertyType) {
            setSelectedPropertyType(propertyType);
            updatePropertyType(value);
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

    const handleExtraInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExtraInfo(e.target.value);
    };

    const handleExtraInfoBlur = () => {
        handleFieldChange(extraInfoField, extraInfo);
    };

    const canRenderField = (detailsId: keyof IPropertyDetails) => {
        return Object.hasOwnProperty.call(details, detailsId);
    }

    console.log('details', details);
    

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
                            <Select
                                key="propertyType"
                                value={selectedPropertyType.key || undefined}
                                onChange={(val) => handlePropertyTypeChange(val)}
                                placeholder="Select property type"
                                size="middle"
                                options={propertyTypeDropdownItems.map(p => ({ value: p.key, label: p.label }))}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Rooms</div>
                            <InputNumber
                                min={1}
                                value={details.rooms || undefined}
                                defaultValue={details.rooms || 1}
                                onChange={(value: number) => handleFieldChange('rooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Square meters</div>
                            <InputNumber
                                min={1}
                                value={details.squareMeters || undefined}
                                defaultValue={20}
                                onChange={(value: number) => handleFieldChange('squareMeters', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Bedrooms</div>
                            <InputNumber
                                min={0}
                                value={details.bedrooms || undefined}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('bedrooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Bathrooms</div>
                            <InputNumber
                                min={0}
                                value={details.bathrooms || undefined}
                                defaultValue={1}
                                onChange={(value: number) => handleFieldChange('bathrooms', value)}
                                style={{width: '100%'}}
                            />
                            <div className={styles['input-label']} style={{marginTop: '8px'}}>Levels</div>
                            <InputNumber
                                min={1}
                                value={details.levels || undefined}
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
                                    checked={details.elevator || false}
                                    onChange={(value: boolean) => handleFieldChange('elevator', value)}
                                />
                            </div>
                            <div className={styles['inline-view']} style={{marginTop: '8px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Floor</div>
                                    <InputNumber
                                        value={details.floor || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('floor', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Total floors</div>
                                    <InputNumber
                                        min={0}
                                        value={details.totalFloors || undefined}
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
                                            checked={details.balcony || false}
                                            onChange={(value: boolean) => handleFieldChange('balcony', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Balcony number</div>
                                        <InputNumber
                                            min={0}
                                            value={details.balconyNumber || undefined}
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
                                            value={details.balconySize || undefined}
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
                                            checked={details.terrace || false}
                                            onChange={(value: boolean) => handleFieldChange('terrace', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Terrace number</div>
                                        <InputNumber
                                            min={0}
                                            value={details.terraceNumber || undefined}
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
                                            value={details.terraceSize || undefined}
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
                                            checked={details.garden || false}
                                            onChange={(value: boolean) => handleFieldChange('garden', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Garden size</div>
                                        <InputNumber
                                            min={0}
                                            value={details.gardenSquareMeters || undefined}
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
                                    checked={details.cellar || false}
                                    onChange={(value: boolean) => handleFieldChange('cellar', value)}
                                />
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Parking</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.parking || false}
                                            onChange={(value: boolean) => handleFieldChange('parking', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['inline-view']} style={{gap: '24px'}}>
                                    <div className={styles['content-container']}>
                                        <div className={styles['input-label']}>Parking places</div>
                                        <InputNumber
                                            min={0}
                                            value={details.parkingPlaces || undefined}
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
                                            checked={details.water || false}
                                            onChange={(value: boolean) => handleFieldChange('water', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Electricity</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.electricity || false}
                                            onChange={(value: boolean) => handleFieldChange('electricity', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Gas</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.gas || false}
                                            onChange={(value: boolean) => handleFieldChange('gas', value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles['content-container']} style={{height: "57px", minWidth: "70px"}}>
                                    <div className={styles['input-label']}>Sewerage</div>
                                    <div style={{marginTop: "4px"}}>
                                        <Switch
                                            checked={details.sewerage || false}
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
                                value={details.energyConsumption || undefined}
                                defaultValue={0}
                                onChange={(value: number) => handleFieldChange('energyConsumption', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Financial</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Condo fees, €/month</div>
                            <InputNumber
                                min={0}
                                value={details.condoFees || undefined}
                                defaultValue={0}
                                onChange={(value: number) => handleFieldChange('condoFees', value)}
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className={styles['content-container']}></div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-property-details__section-content']} style={{marginTop: '8px'}}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Condition</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Condition</div>
                                    <Select
                                        key="condition"
                                        value={details.condition || undefined}
                                        onChange={(val) => handleFieldChange('condition', val)}
                                        placeholder="Select condition"
                                        size="middle"
                                        options={CONDITION_TYPES.map(c => ({ value: c.value, label: c.label }))}
                                    />
                                </div>
                                <div className={styles['content-container']}></div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Year built</div>
                                    <InputNumber
                                        min={0}
                                        value={details.yearBuilt || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('yearBuilt', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Year renovated</div>
                                    <InputNumber    
                                        min={0}
                                        value={details.yearRenovated || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('yearRenovated', value)}
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
                    <div className={styles['feature-name-container']}>Neighbourhood</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Metro station</div>
                                    <Input 
                                        size="middle"
                                        type="text"
                                        value={details.metroStation || undefined}
                                        onChange={(e) => handleFieldChange('metroStation', e.target.value)}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to metro, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistanceMetro || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistanceMetro', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Train station</div>
                                    <Input 
                                        size="middle"
                                        type="text"
                                        value={details.trainStation || undefined}
                                        onChange={(e) => handleFieldChange('trainStation', e.target.value)}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to train, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistanceTrain || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistanceTrain', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Bus station</div>
                                    <Input 
                                        size="middle"
                                        type="text"
                                        value={details.busStation || undefined}
                                        onChange={(e) => handleFieldChange('busStation', e.target.value)}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to bus, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistanceBus || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistanceBus', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Park</div>
                                    <Input 
                                        size="middle"
                                        type="text"
                                        value={details.parkName || undefined}
                                        onChange={(e) => handleFieldChange('parkName', e.target.value)}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to park, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistancePark || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistancePark', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </div>
                            <div className={styles['inline-view']} style={{alignItems: 'flex-start', marginTop: '12px'}}>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to shops, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistanceShops || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistanceShops', value)}
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div className={styles['content-container']}>
                                    <div className={styles['input-label']}>Walking distance to schools, min</div>
                                    <InputNumber
                                        min={0}
                                        value={details.walkingDistanceSchools || undefined}
                                        defaultValue={0}
                                        onChange={(value: number) => handleFieldChange('walkingDistanceSchools', value)}
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
                    <div className={styles['feature-name-container']}>Extra info</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Tell more about the property</div>
                            <TextArea 
                                value={details.extraInfo}
                                rows={6}
                                onChange={handleExtraInfoChange}
                                onBlur={handleExtraInfoBlur}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});