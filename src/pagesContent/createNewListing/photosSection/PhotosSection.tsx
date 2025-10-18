import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';
import { PhotoFile, PhotoUploader } from '@/components/PhotoUploader';
import styles from './PhotosSection.module.sass';
import classNames from 'classnames';

interface PhotosSectionProps {
    onPhotosChange: (photos: PhotoFile[]) => void;
    className?: string;
    labelEnabled?: boolean;
}

const PhotosSection = React.memo<PhotosSectionProps>(({ onPhotosChange, className, labelEnabled }) => {
    const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);
    const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState<boolean>(false);
    const [photos, setPhotos] = useState<PhotoFile[]>([]);

    useEffect(() => {
        onPhotosChange(photos);
    }, [photos])

    const handleAddDescriptionEnabledChange = (checked: boolean) => {
        setDescriptionEnabled(checked);
    };

    const handlePhotosChange = (photos: PhotoFile[]) => {
        setPhotos(photos);
    };

    const handleAiAnalysisEnabledChange = (checked: boolean) => {
        setAiAnalysisEnabled(checked);
    };

    return (
        <div className={classNames(styles['photos-section'], className)}>
            {labelEnabled && (
                <label htmlFor="photos" className={styles['photos-section-label']}>
                    Photos
                </label>
            )}
            <div className={styles['photos-container']}>
                <PhotoUploader 
                    onFilesChange={handlePhotosChange} 
                    maxFiles={10} 
                    maxFileSize={5 * 1024 * 1024} 
                    uploadZoneClassName={styles['photos-upload-zone']}
                />
            </div>
            <div
                onClick={() => handleAddDescriptionEnabledChange(!descriptionEnabled)}
                className={classNames(styles['switcher-container'], descriptionEnabled && styles['_active'])}
            >
                <Switch 
                    size="small" 
                    checked={descriptionEnabled} 
                    className={styles['switch']}
                />
                <div className={styles['switcher-content']}>
                    <div className={styles['switcher-caption']}>Add description to each photo</div>
                    <div className={styles['switcher-text']}>Description to each photo to help the buyer understand the property better.</div>
                </div>
            </div>
            <div
                onClick={() => handleAiAnalysisEnabledChange(!aiAnalysisEnabled)}
                className={classNames(styles['switcher-container'], aiAnalysisEnabled && styles['_active'])}
            >
                <Switch 
                    size="small" 
                    checked={aiAnalysisEnabled} 
                    className={styles['switch']}
                />
                <div className={styles['switcher-content']}>
                    <div className={styles['switcher-caption']}>Photo analysis</div>
                    <div className={styles['switcher-text']}>Analyzing the photos will help you write the best advertisement about the object.</div>
                </div>
            </div>
        </div>
    );
});

export default PhotosSection;