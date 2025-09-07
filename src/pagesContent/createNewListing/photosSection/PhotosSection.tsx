import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';
import styles from './PhotosSection.module.sass';
import classNames from 'classnames';
import { PhotoFile, PhotoUploader } from '@/components/PhotoUploader';
import { IoChevronForward } from "react-icons/io5";

interface PhotosSectionProps {
    label: string;
    onPhotosChange: (photos: PhotoFile[]) => void;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ label, onPhotosChange }) => {
    const [photosEnabled, setPhotosEnabled] = useState<boolean>(false);
    const [photos, setPhotos] = useState<PhotoFile[]>([]);

    useEffect(() => {
        onPhotosChange(photos);
    }, [photos])

    const handlePhotosRadioChange = (checked: boolean) => {
        setPhotosEnabled(checked);
    };

    const handlePhotosChange = (photos: PhotoFile[]) => {
        setPhotos(photos);
    };

    return (
        <div className={styles['photos-section']}>
            <label htmlFor="photos" className={styles['photos-section-label']}>
                {label}
            </label>
            <div
                onClick={() => handlePhotosRadioChange(!photosEnabled)}
                className={classNames(styles['enable-photos-container'], photosEnabled && styles['_active'])}
            >
                <Switch 
                    size="small" 
                    checked={photosEnabled} 
                    className={styles['enable-photos-switch']}
                />
                <span>Upload photos</span>
            </div>
            {photosEnabled && (
                <div className={styles['photos-container']}>
                    <PhotoUploader 
                        onFilesChange={handlePhotosChange} 
                        maxFiles={10} 
                        maxFileSize={5 * 1024 * 1024} 
                        uploadZoneClassName={styles['photos-upload-zone']}
                        hidePreview={true}
                    />
                </div>
            )}
            {photosEnabled && !!photos.length && (
                <div className={styles['link-to-photos']}>
                    <span>Interact with photos</span>
                    <IoChevronForward size={18} />
                </div>
            )}
        </div>
    );
};

export default PhotosSection;