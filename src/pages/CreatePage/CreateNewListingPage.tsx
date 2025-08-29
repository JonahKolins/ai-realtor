import React, { useState, useMemo, useEffect } from 'react';
import styles from './CreateNewListingPage.module.sass';
import { Dropdown, Segmented, MenuProps, Radio, RadioChangeEvent } from 'antd';
import { IoBedOutline, IoHomeOutline, IoBusinessOutline, IoCashOutline, IoCellularOutline } from "react-icons/io5";
import classNames from 'classnames';
import { PhotoUploader, PhotoFile } from '../../components/PhotoUploader';

enum ListingType {
    SELL = 'sell',
    RENT_OUT = 'rentOut',
}

interface IListingTypeData {
    label: string;
    value: ListingType;
    icon: JSX.Element;
}

const listingTypes: IListingTypeData[] = [
    {label: 'Sell', value: ListingType.SELL, icon: <IoCashOutline size={24} />},
    {label: 'Rent out', value: ListingType.RENT_OUT, icon: <IoCellularOutline size={24} />},
]

enum PropertyType {
    DEFAULT = 'default',
    HOUSE = 'house',
    APARTMENT = 'apartment',
    ROOM = 'room',
}

interface IPropertyData {
    caption: string;
    icon: JSX.Element | null;
    value: PropertyType;
}

const propertyTypes: IPropertyData[] = [
    {caption: 'Choose property type', icon: null, value: PropertyType.DEFAULT},
    {caption: 'House', icon: <IoHomeOutline size={22} />, value: PropertyType.HOUSE},
    {caption: 'Apartment', icon: <IoBusinessOutline size={22} />, value: PropertyType.APARTMENT},
]

const propertyTypesForRentOut: IPropertyData[] = [
    {caption: 'Choose property type', icon: null, value: PropertyType.DEFAULT},
    {caption: 'House', icon: <IoHomeOutline size={22} />, value: PropertyType.HOUSE},
    {caption: 'Apartment', icon: <IoBusinessOutline size={22} />, value: PropertyType.APARTMENT},
    {caption: 'Room', icon: <IoBedOutline size={22} />, value: PropertyType.ROOM},
]

enum PreviewTab {
    PREVIEW = 'preview',
    PHOTOS = 'photos',
}

const CreateNewListingPage: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: PropertyType.APARTMENT
    });

    const [listingType, setListingType] = useState<ListingType>(listingTypes[0].value);
    const [propertyType, setPropertyType] = useState<IPropertyData>(propertyTypes[0]);
    const [photosEnabled, setPhotosEnabled] = useState<boolean>(false);
    const [photos, setPhotos] = useState<PhotoFile[]>([]);
    const [activeTab, setActiveTab] = useState<PreviewTab>(PreviewTab.PREVIEW);

    useEffect(() => {
        if (listingType === ListingType.RENT_OUT && propertyType.value !== PropertyType.DEFAULT) {
            setPropertyType(propertyTypesForRentOut[0]);
        } else if (listingType === ListingType.SELL && propertyType.value !== PropertyType.DEFAULT) {
            setPropertyType(propertyTypes[0]);
        }
    }, [listingType])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleListingTypeChange = (value: ListingType) => {
        setListingType(value);
    };

    const handlePhotosChange = (newPhotos: PhotoFile[]) => {
        setPhotos(newPhotos);
    };

    const serviceDropdownItem = (icon: JSX.Element | null, caption: string, text: string, onClick?: () => void) => {
		return (
			<div onClick={onClick} className={styles['service-dropdown-item']}>
				<div className={styles['icon-container']}>{icon}</div>
				<div className={styles['content']}>
					<div className={styles['caption']}>{caption}</div>
					{!!text && <div className={styles['text']}>{text}</div>}
				</div>
			</div>
		)
	}

    // получение типов недвижимости в зависимости от типа объявления
    const propertyTypesByListingType = useMemo(() => {
        return listingType === ListingType.RENT_OUT ? propertyTypesForRentOut : propertyTypes;
    }, [listingType])

    // обработка выбора типа недвижимости
    const handlePropertyTypeChange = (value: string) => {
        const propertyType = propertyTypesByListingType.find(type => type.value === value);
        if (propertyType) {
            setPropertyType(propertyType);
        }
    }

    // @ts-ignore
	const propertyTypesMenu = useMemo<MenuProps["items"]>(() => {
        const items = propertyTypesByListingType.map((item, index) => {
            if (item.value === PropertyType.DEFAULT) return null;
            return {
                label: serviceDropdownItem(item.icon, item.caption, '', () => handlePropertyTypeChange(item.value)),
                key: index,
            }
        })
		return items;
	}, [propertyTypesByListingType, handlePropertyTypeChange])

    const handleOpenDropDown = () => {
        console.log('open');
    };

    const handlePhotosRadioChange = (e: RadioChangeEvent) => {        
        setPhotosEnabled(e.target.checked);
        if (e.target.checked) {
            setActiveTab(PreviewTab.PHOTOS);
        }
    };

    return (
        <div className={styles['page-container']}>
            <div className={styles['create-container']}>
                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Create a new listing</h1>
                    <div className={styles.field}>
                        <label htmlFor="listing-type" className={styles.label}>
                            Listing type
                        </label>
                        <div className={styles['listing-types-container']}>
                            {listingTypes.map((item: IListingTypeData) => (
                                <div 
                                    key={item.value}
                                    className={classNames(styles['listing-type-item'], listingType === item.value && styles['_active'])}
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
                    <div className={styles.field}>
                        <label htmlFor="type" className={styles.label}>
                            Property type
                        </label>
                        <Dropdown
                            onOpenChange={handleOpenDropDown}
                            menu={{
                                items: propertyTypesMenu,
                            }}
                            trigger={['hover']}
                            autoAdjustOverflow
                            placement='bottomLeft'
                            rootClassName={styles['drop-link']} //not work
                        >
                            <div 
                                className={classNames(
                                    styles['property-type-caption'],
                                    propertyType.value !== 'default' && styles['_active']
                                )}
                            >
                                {propertyType.caption}
                            </div>
                        </Dropdown>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="photos" className={styles.label}>
                            Photos
                        </label>
                        <Radio 
                            checked={photosEnabled}
                            onChange={handlePhotosRadioChange}
                            className={classNames(styles['photos-radio'], photosEnabled && styles['_active'])}
                        >
                            Upload photos
                        </Radio>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="description" className={styles.label}>
                            Details
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Tell us about the property..."
                            rows={5}
                            required
                        />
                    </div>
                </div>
            </div>
            <div className={styles['preview-container']}>
                <div className={styles['preview-header']}>
                    <div 
                        className={classNames(
                            styles['preview-tab'],
                            activeTab === PreviewTab.PREVIEW && styles['_active']
                        )}
                        onClick={() => setActiveTab(PreviewTab.PREVIEW)}
                    >
                        Preview
                    </div>
                    <div 
                        className={classNames(
                            styles['preview-tab'],
                             activeTab === PreviewTab.PHOTOS && styles['_active']
                        )}
                        onClick={() => setActiveTab(PreviewTab.PHOTOS)}
                    >
                        Photos
                    </div>
                </div>
                {photosEnabled && activeTab == PreviewTab.PHOTOS && (       
                    <PhotoUploader 
                        onFilesChange={handlePhotosChange}
                        maxFiles={10}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                    />
                )}
            </div>
        </div>
    );
};

export default CreateNewListingPage;