import React, { useState } from "react"
import styles from "./CreateListingPhotos.module.sass";
import PhotosSection from "../photosSection/PhotosSection";
import classNames from "classnames";
import { Switch } from "antd";
import { PhotoFile } from "@/components/PhotoUploader";

interface CreateListingPhotosProps {
    onPhotosChange: (photos: PhotoFile[]) => void;
}

export const CreateListingPhotos = React.memo<CreateListingPhotosProps>(({onPhotosChange}) => {

    const [photosEnabled, setPhotosEnabled] = useState<boolean>(false);

    const handlePhotosChange = (photos: PhotoFile[]) => {
        onPhotosChange(photos);
    }
    
    return (
        <div className={styles['create-listing-photos']}>
            <div className={styles['create-listing-photos__section']}>
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
                <PhotosSection 
                    onPhotosChange={handlePhotosChange} 
                    className={styles['create-listing-photos__photos-section']} 
                    labelEnabled={false}
                />
            </div>
        </div>
    )
})  