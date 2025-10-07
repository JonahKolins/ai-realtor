import React, { useEffect, useState, useCallback } from 'react';
import styles from './DetailsSection.module.sass';
import { propertyInitialDetails, IPropertyDetails } from '@/classes/listings/propertyDetails';
import { PropertyType } from '@/classes/listings/Listing.types';
import { IListingDraftData } from '@/classes/listings/ListingDraft';
import { HEATING_TYPES, ENERGY_CLASSES, CONDITION_TYPES } from '@/classes/listings/ListingUserFields';
import NumberInput from './components/NumberInput';
import ToggleInput from './components/ToggleInput';
import TextInput from './components/TextInput';
import SquareMeterInput from './components/SquareMeterInput';
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import classNames from 'classnames';
import Button from '@/designSystem/button/Button';
import { Input, Select } from 'antd';

// Маппинг полей к их отображаемым названиям
const fieldLabels: Partial<Record<keyof IPropertyDetails, string>> = {
    // Локация
    street: 'Street, Building',
    flatNumber: 'Flat Number',
    postalCode: 'CAP',
    community: 'Communa',
    province: 'Province',
    city: 'City',
    neighborhood: 'Neighborhood',
    address: 'Full Address',
    // Площадь и планировка
    squareMeters: 'Square Meters',
    levels: 'Levels',
    rooms: 'Total Rooms',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    floor: 'Floor',
    totalFloors: 'Total Floors',
    // Удобства
    cellar: 'Cellar',
    balcony: 'Balcony',
    balconyNumber: 'Balcony Number',
    balconySize: 'Balcony Size (m²)',
    terrace: 'Terrace',
    terraceSize: 'Terrace Size (m²)',
    parking: 'Parking',
    parkingPlaces: 'Parking Places',
    garden: 'Garden',
    gardenSquareMeters: 'Garden Area (m²)',
    elevator: 'Elevator',
    // Коммуникации
    heating: 'Heating Type',
    heatingType: 'Heating Type (alt)',
    water: 'Water',
    electricity: 'Electricity',
    gas: 'Gas',
    sewerage: 'Sewerage',
    // Энергоэффективность
    energyClass: 'Energy Class',
    // Расстояния
    walkingDistanceMetro: 'Walk to Metro (min)',
    metroStation: 'Metro Station',
    walkingDistancePark: 'Walk to Park (min)',
    parkName: 'Park Name',
    walkingDistanceShops: 'Walk to Shops (min)',
    walkingDistanceSchools: 'Walk to Schools (min)',
    // Финансы
    condoFees: 'Condo Fees (€/month)',
    // Состояние
    condition: 'Condition',
    yearBuilt: 'Year Built',
    yearRenovated: 'Year Renovated',
    // Дополнительно
    extraInfo: 'Extra Info'
};

interface DetailsSectionProps {
    data: IListingDraftData;
    onNextStep: () => void;
    saveDraft: () => void;
    onDetailsChange?: (details: IPropertyDetails, changedFields: Set<string>) => void;
}

// Группируем поля
const addressFields = ['street', 'flatNumber', 'postalCode', 'community', 'province', 'city', 'neighborhood'];
const mainFields = ['squareMeters', 'levels', 'rooms', 'bedrooms', 'bathrooms', 'floor', 'totalFloors'];
const amenityFields = ['cellar', 'balcony', 'balconyNumber', 'balconySize', 'parking', 'parkingPlaces', 'terrace', 'terraceSize'];
const outdoorFields = ['garden', 'gardenSquareMeters'];
const facilitiesFields = ['elevator', 'heating', 'water', 'electricity', 'gas', 'sewerage'];
const energyFinanceFields = ['energyClass', 'condoFees'];
const locationDetailsFields = ['walkingDistanceMetro', 'metroStation', 'walkingDistancePark', 'parkName', 'walkingDistanceShops', 'walkingDistanceSchools'];
const conditionFields = ['condition', 'yearBuilt', 'yearRenovated'];
const extraInfoField = 'extraInfo';

const DetailsSection: React.FC<DetailsSectionProps> = ({
    data,
    onDetailsChange,
    onNextStep,
    saveDraft
}) => {
    const [details, setDetails] = useState<IPropertyDetails>({});
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
    const [extraInfo, setExtraInfo] = useState<string>('');
    const [isReady, setIsReady] = useState(false);

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

    const handleExtraChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExtraInfo(e.target.value);
    };

    const handleExtraInfoBlur = () => {
        handleFieldChange(extraInfoField, extraInfo);
    };

    const handleNextStep = () => {
        saveDraft();
        onNextStep();
    };

    const renderFieldComponent = (fieldName: keyof IPropertyDetails, fieldValue: any, style?: React.CSSProperties) => {
        let target = null;
        let label = fieldLabels[fieldName];
        
        switch (fieldName) {
            // Строковые поля (текстовые инпуты)
            case 'street':
            case 'flatNumber':
            case 'postalCode':
            case 'community':
            case 'province':
            case 'city':
            case 'neighborhood':
            case 'address':
            case 'metroStation':
            case 'parkName': {
                target = (
                    <Input
                        key={fieldName}
                        placeholder={label}
                        type='text'
                        size='large'
                        value={fieldValue || ''}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        style={{width: '50%', ...style}}
                    />
                );
                break;
            }
            
            // Площади (специальные инпуты для м²)
            case 'squareMeters':
            case 'gardenSquareMeters':
            case 'balconySize':
            case 'terraceSize': {
                target = (
                    <SquareMeterInput
                        key={fieldName}
                        value={fieldValue}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        inputWrapperClassName={styles['property-details-input-wrapper']}
                    />
                );
                break;
            }
            
            // Числовые поля
            case 'levels':
            case 'rooms':
            case 'bedrooms':
            case 'bathrooms':
            case 'floor':
            case 'totalFloors':
            case 'balconyNumber':
            case 'parkingPlaces':
            case 'walkingDistanceMetro':
            case 'walkingDistancePark':
            case 'walkingDistanceShops':
            case 'walkingDistanceSchools':
            case 'condoFees':
            case 'yearBuilt':
            case 'yearRenovated': {
                const minValue = fieldName === 'floor' ? -5 : 0;
                const maxValue = 
                    fieldName === 'floor' ? 99 :
                    fieldName === 'totalFloors' ? 99 :
                    fieldName === 'levels' ? 10 :
                    fieldName === 'yearBuilt' || fieldName === 'yearRenovated' ? 2030 :
                    fieldName === 'condoFees' ? 10000 :
                    fieldName.startsWith('walkingDistance') ? 120 :
                    20;
                    
                target = (
                    <NumberInput
                        key={fieldName}
                        value={fieldValue || 0}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        min={minValue}
                        max={maxValue}
                    />
                );
                break;
            }
            
            // Boolean поля (toggle)
            case 'cellar':
            case 'balcony':
            case 'parking':
            case 'garden':
            case 'elevator':
            case 'water':
            case 'electricity':
            case 'gas':
            case 'sewerage': {
                target = (
                    <ToggleInput
                        key={fieldName}
                        value={fieldValue}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        containerClassName={styles['property-details-toggle']}
                    />
                );
                break;
            }
            
            // Heating (select)
            case 'heating':
            case 'heatingType': {
                target = (
                    <Select
                        key={fieldName}
                        value={fieldValue || undefined}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        placeholder="Select heating type"
                        size="large"
                        style={{ width: '50%' }}
                        options={HEATING_TYPES.map(h => ({ value: h.value, label: h.label }))}
                    />
                );
                break;
            }
            
            // Energy Class (select)
            case 'energyClass': {
                target = (
                    <Select
                        key={fieldName}
                        value={fieldValue || undefined}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        placeholder="Select energy class"
                        size="large"
                        style={{ width: '50%' }}
                        options={ENERGY_CLASSES.map(e => ({ value: e.value, label: e.label }))}
                    />
                );
                break;
            }
            
            // Condition (select)
            case 'condition': {
                target = (
                    <Select
                        key={fieldName}
                        value={fieldValue || undefined}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        placeholder="Select condition"
                        size="large"
                        style={{ width: '50%' }}
                        options={CONDITION_TYPES.map(c => ({ value: c.value, label: c.label }))}
                    />
                );
                break;
            }
            
            default:
                target = null;
                break;
        }

        if (!target) return null;

        return (
            <div key={fieldName} className={styles['property-details-field-wrapper']}>
                {label && <label className={styles['label']}>{label}</label>}
                {target}
            </div>
        )
    };

    if (!isReady || !data.propertyType || data.propertyType === PropertyType.DEFAULT) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Details</h2>
                <p className={styles.notice}>Please select a property type first</p>
            </div>
        );
    }

    return (
        <div className={styles['details-section']}>
            <h2 className={styles['title']}>Property Details</h2>
            
            <div className={styles['sections']}>

                {/* Адресс */}
                <div className={styles['section']}>
                    <h3 className={styles['sectionTitle']}>Address</h3>
                    <div className={styles['inputs-container']}>
                        {addressFields.map(fieldName => {
                            return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName], { width: '100%' });
                        })}
                    </div>
                </div>
                
                {/* Основные характеристики */}
                <div className={styles['section']}>
                    <h3 className={styles['sectionTitle']}>Main Features</h3>
                    <div className={styles['fields']}>
                        {mainFields.map(fieldName => {
                            if (details.hasOwnProperty(fieldName)) {
                                return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName])
                            }
                            return null;
                        })}
                    </div>
                </div>

                {/* Удобства */}
                <div className={styles['section']}>
                    <h3 className={styles['sectionTitle']}>Amenities</h3>
                    <div className={styles['fields']}>
                        <div className={styles['property-types-container']}>
                            {amenityFields.map(fieldName => {
                                if (details.hasOwnProperty(fieldName)) {
                                    return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                                    // return (
                                    //     <div 
                                    //         key={fieldName}
                                    //         className={classNames(styles['property-type-item'], !!details[fieldName] && styles['_active'])}
                                    //         onClick={() => handleFieldChange(fieldName as keyof IPropertyDetails, !!details[fieldName] ? false : true)}
                                    //     >
                                    //         {!!details[fieldName] ? <IoBookmark size={22} /> : <IoBookmarkOutline size={22} />}
                                    //         <div>{fieldName}</div>
                                    //     </div>
                                    // )
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>

                {/* Внешние удобства */}
                {outdoorFields.some(field => details.hasOwnProperty(field)) && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Outdoor</h3>
                        <div className={styles.fields}>
                            {outdoorFields.map(fieldName => {
                                if (details.hasOwnProperty(fieldName)) {
                                    return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                {/* Коммуникации */}
                {facilitiesFields.some(field => details.hasOwnProperty(field)) && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Facilities</h3>
                        <div className={styles.fields}>
                            {facilitiesFields.map(fieldName => {
                                if (details.hasOwnProperty(fieldName)) {
                                    return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                {/* Локация - детали (ВАЖНО для AI качества!) */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        Location Details
                        <span className={styles.priority}>⭐ High Priority for AI</span>
                    </h3>
                    <div className={styles.fields}>
                        {locationDetailsFields.map(fieldName => {
                            return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                        })}
                    </div>
                </div>

                {/* Энергоэффективность и финансы */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Energy & Finance</h3>
                    <div className={styles.fields}>
                        {energyFinanceFields.map(fieldName => {
                            return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                        })}
                    </div>
                </div>

                {/* Состояние и год постройки */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Condition & Year</h3>
                    <div className={styles.fields}>
                        {conditionFields.map(fieldName => {
                            return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                        })}
                    </div>
                </div>

                {/* Описание */}
                <div className={styles['section']}>
                    <h3 className={styles['sectionTitle']}>Extra</h3>
                    <textarea
                        id="extra"
                        name="extra"
                        value={extraInfo || ''}
                        onChange={handleExtraChange}
                        className={styles['textarea']}
                        placeholder="Tell more about the property..."
                        onBlur={handleExtraInfoBlur}
                        rows={5}
                    />
                </div>

                {/* Отладочная информация */}
                {/* {process.env.NODE_ENV === 'development' && (
                    <div className={styles.debug}>
                        <h4>Debug Info:</h4>
                        <p><strong>Changed fields:</strong> {changedFields.size > 0 ? Array.from(changedFields).join(', ') : 'none'}</p>
                        <p><strong>Has userFields:</strong> {data.userFields ? 'yes' : 'no'}</p>
                        <p><strong>Property type:</strong> {data.propertyType}</p>
                    </div>
                )} */}

                <div className={styles['section']}>
                    <div className={styles['fields']}>
                        <div className={styles['buttons']}>
                            <Button 
                                onClick={handleNextStep}
                                className={styles['next-button']}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsSection;
