import React, { useState } from "react";
import {IListingDraftData} from "@/classes/listings/ListingDraft";
import { InputNumber, Select, Switch } from "antd";
import { ListingType } from "@/api/network/listings/requests/GetListingsRequest";
import { PhotoFile } from "@/components/PhotoUploader";
import PhotosSection from "../photosSection/PhotosSection";
import styles from "./CreateListingDetails.module.sass";
import classNames from "classnames";


interface CreateListingDetailsProps {
    data: IListingDraftData;
    onListingTypeChange: (value: ListingType) => void;
    onPriceChange: (value: number) => void;
    onPhotosChange: (photos: PhotoFile[]) => void;
}

const listingTypeDropdownItems = [
    {
        value: 'sale',
        label: 'Sale',
    },
    {
        value: 'rent',
        label: 'Rent',
    }
]

export const CreateListingDetails = React.memo<CreateListingDetailsProps>(({data, onListingTypeChange, onPriceChange, onPhotosChange}) => {
    console.log('data', data);
    
    const [selectedListingType, setSelectedListingType] = useState<ListingType>(data.type || null);
    const [price, setPrice] = useState<number>(data.price || 0);
    const [photosEnabled, setPhotosEnabled] = useState<boolean>(false);

    const handleListingTypeChange = (value: ListingType) => {
        setSelectedListingType(value);
        onListingTypeChange(value);
    }

    const handlePriceChange = (value: number) => {
        setPrice(value);
        onPriceChange(value);
    }

    const handlePhotosChange = (photos: PhotoFile[]) => {
        onPhotosChange(photos);
    }

    return (
        <div className={styles['create-listing-details']}>
            <div className={styles['create-listing-details__section-main-title']}>Listing details</div>
            <div className={styles['create-listing-details__section-content']}>
                <div className={styles['inline-content']}>
                    <div className={styles['feature-name-container']}>Listing</div>
                    <div className={styles['feature-container']}>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Type</div>
                            <Select
                                key="listingType"
                                value={selectedListingType || undefined}
                                onChange={(val) => handleListingTypeChange(val)}
                                placeholder="Select listing type"
                                size="middle"
                                defaultValue={data.type || null}
                                options={listingTypeDropdownItems.map(h => ({ value: h.value, label: h.label }))}
                                style={{minWidth: '120px'}}
                            />
                        </div>
                        <div className={styles['content-container']}>
                            <div className={styles['input-label']}>Price</div>
                            <InputNumber
                                min={0}
                                defaultValue={1000}
                                step={500}
                                value={price || undefined}
                                onChange={(value: number) => handlePriceChange(value)}
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['create-listing-details__section-main-title']} style={{marginTop: '16px'}}>Photos</div>
            <div className={styles['create-listing-details__section-content']}>
                <div className={styles['content-container']}>
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
                    {photosEnabled && (
                        <PhotosSection 
                            onPhotosChange={handlePhotosChange} 
                            className={styles['create-listing-details__photos-section']} 
                            labelEnabled={false}
                        />
                    )}
                </div>
            </div>
        </div>
    )
})