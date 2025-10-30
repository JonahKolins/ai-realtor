import React, { useState } from "react";
import { IListingDraftData } from "@/classes/listings/ListingDraft";
import styles from "./CreateListingInfo.module.sass";
import { IoChevronDown } from "react-icons/io5";
import { Button, Dropdown, Input, Switch } from "antd";
import { PropertyType } from "@/classes/listings/Listing.types";
import PhotosSection from "../photosSection/PhotosSection";
import classNames from "classnames";
import { CreateListingPropertyDetails } from "../createListingPropertyDetails/CreateListingPropertyDetails";

interface CreateListingInfoProps {
    data: IListingDraftData;
    saveDraft: () => void;
}

const listingTypeDropdownItems = [
    {
        key: 'sell',
        label: 'Sell',
    },
    {
        key: 'rent',
        label: 'Rent',
    }
];

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

export const CreateListingInfo = React.memo<CreateListingInfoProps>(({ data, saveDraft }) => {
    const [selectedListingType, setSelectedListingType] = useState<string>('Sell');
    const [selectedPropertyType, setSelectedPropertyType] = useState<string>("House");
    const [photosEnabled, setPhotosEnabled] = useState<boolean>(false);

    const handleListingTypeChange = (value: string) => {
        const listingType = listingTypeDropdownItems.find((item) => item.key === value);
        if (listingType) {
            setSelectedListingType(listingType.label);
        }
    }

    const handlePropertyTypeChange = (value: string) => {
        const propertyType = propertyTypeDropdownItems.find((item) => item.key === value);
        if (propertyType) {
            setSelectedPropertyType(propertyType.label);
        }
    }


    return (
        <div className={styles['create-listing-info']}>
            <div className={styles['create-listing-info__section']}>
                <div className={styles['section-title']}>Photos</div>
                <div
                    onClick={() => setPhotosEnabled(!photosEnabled)}
                    className={classNames(styles['switcher-container'], photosEnabled && styles['_active'])}
                >
                    <Switch 
                        size="small" 
                        checked={photosEnabled} 
                        className={styles['switch']}
                    />
                    <div className={styles['switcher-content']}>
                        <div className={styles['switcher-caption']}>Add photos to the listing</div>
                        <div className={styles['switcher-text']}>Add photos to the listing to help the buyer understand the property better.</div>
                    </div>
                </div>
                {/* {photosEnabled && (
                    <PhotosSection 
                        onPhotosChange={() => {}} 
                        className={styles['create-listing-info__photos-section']} 
                        labelEnabled={false}
                    />
                )} */}
            </div>
            <div className={styles['create-listing-info__section']}>
                {/* <div className={styles['section-title']}>Property details</div> */}
                {/* <CreateListingPropertyDetails /> */}
            </div>
            <div className={styles['create-listing-info__section']}>
                <div className={styles['section-title']}>Listing</div>
                <div className={styles['section-content']}>
                    <div className={styles['listing-info-container']}>
                        <div className={styles['listing-info-label']}>Listing type</div>
                        <Dropdown menu={{ items: listingTypeDropdownItems, onClick: ({ key }) => handleListingTypeChange(key) }} trigger={['click']}>
                            <div className={styles['listing-dropdown']}>
                                {selectedListingType}
                                <IoChevronDown />
                            </div>
                        </Dropdown>
                    </div>
                    <div className={styles['listing-info-container']}>
                        <div className={styles['listing-info-label']}>Property type</div>
                        <Dropdown menu={{ items: propertyTypeDropdownItems, onClick: ({ key }) => handlePropertyTypeChange(key) }} trigger={['click']}>
                            <div className={styles['listing-dropdown']}>
                                {selectedPropertyType}
                                <IoChevronDown />
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
});