import React, { useEffect, useState, useCallback } from 'react';
import styles from './DetailsSection.module.sass';
import { propertyInitialDetails, IPropertyDetails } from '@/classes/listings/propertyDetails';
import { PropertyType } from '@/classes/listings/Listing.types';
import { IListingDraftData } from '@/classes/listings/ListingDraft';
import NumberInput from './components/NumberInput';
import ToggleInput from './components/ToggleInput';
import TextInput from './components/TextInput';
import SquareMeterInput from './components/SquareMeterInput';
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import classNames from 'classnames';
import Button from '@/designSystem/button/Button';
import { Input } from 'antd';

// Маппинг полей к их отображаемым названиям
const fieldLabels: Record<keyof IPropertyDetails, string> = {
    street: 'Street, Building',
    flatNumber: 'Flat Number',
    postalCode: 'CAP',
    community: 'Communa',
    province: 'Province',
    squareMeters: 'Square Meters',
    levels: 'Levels',
    rooms: 'Rooms',
    floor: 'Floor',
    cellar: 'Cellar',
    balcony: 'Balcony',
    balconyNumber: 'Balcony Number',
    terrace: 'Terrace',
    parking: 'Parking',
    parkingPlaces: 'Parking Places',
    garden: 'Garden',
    gardenSquareMeters: 'Garden Area',
    elevator: 'Elevator',
    heating: 'Heating',
    water: 'Water',
    electricity: 'Electricity',
    gas: 'Gas',
    sewerage: 'Sewerage',
    extraInfo: 'Extra Info'
};

interface DetailsSectionProps {
    data: IListingDraftData;
    onNextStep: () => void;
    saveDraft: () => void;
    onDetailsChange?: (details: IPropertyDetails, changedFields: Set<string>) => void;
}

// Группируем поля
const addressFields = ['street', 'flatNumber', 'postalCode', 'community', 'province'];
const mainFields = ['squareMeters', 'levels', 'rooms', 'floor'];
const amenityFields = ['cellar', 'balcony', 'balconyNumber', 'parking', 'parkingPlaces', 'terrace'];
const outdoorFields = ['garden', 'gardenSquareMeters'];
const facilitiesFields = ['elevator', 'heating', 'water', 'electricity', 'gas', 'sewerage'];
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
        
        setChangedFields(prev => new Set(prev).add(fieldName));
        
        // Вызываем callback с обновленными данными
        if (onDetailsChange) {
            const updatedDetails = { ...details, [fieldName]: value };
            const updatedChangedFields = new Set(changedFields).add(fieldName);
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

    const renderFieldComponent = (fieldName: keyof IPropertyDetails, fieldValue: any) => {
        let target = null;
        let label = fieldLabels[fieldName];
        
        switch (fieldName) {
            case 'street':
            case 'flatNumber':
            case 'postalCode':
            case 'community':
            case 'province': {
                target = (
                    <Input
                        key={fieldName}
                        placeholder={label}
                        type='text'
                        size='large'
                        value={fieldValue || ''}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        autoComplete={
                            fieldName === 'street' ? 'street-address' :
                            fieldName === 'flatNumber' ? 'flat' :
                            fieldName === 'postalCode' ? 'postal-code' :
                            fieldName === 'community' ? 'community' :
                            fieldName === 'province' ? 'province' : 'off'
                        }
                    />
                );
                break;
            }
            case 'squareMeters':
            case 'gardenSquareMeters': {
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
            case 'levels':
            case 'rooms':
            case 'floor':
            case 'balconyNumber':
            case 'parkingPlaces': {
                target = (
                    <NumberInput
                        key={fieldName}
                        value={fieldValue || 0}
                        onChange={(val) => handleFieldChange(fieldName, val)}
                        min={fieldName === 'floor' ? -5 : 0}
                        max={fieldName === 'floor' ? 99 : fieldName === 'levels' ? 10 : 20}
                    />
                );
                break;
            }
            case 'cellar':
            case 'balcony':
            case 'parking':
            case 'garden':
            case 'elevator':
            case 'heating':
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
                            return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
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
                                    // return renderFieldComponent(fieldName as keyof IPropertyDetails, details[fieldName]);
                                    return (
                                        <div 
                                            key={fieldName}
                                            className={classNames(styles['property-type-item'], !!details[fieldName] && styles['_active'])}
                                            onClick={() => handleFieldChange(fieldName as keyof IPropertyDetails, !!details[fieldName] ? false : true)}
                                        >
                                            {!!details[fieldName] ? <IoBookmark size={22} /> : <IoBookmarkOutline size={22} />}
                                            <div>{fieldName}</div>
                                        </div>
                                    )
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
