import React from 'react';
import PhotosSection from '@/pagesContent/createNewListing/photosSection/PhotosSection';
import styles from './EditPhotosPage.module.sass';

const EditPhotosPage: React.FC = () => {
    return (
        <div className={styles['edit-photos-page']}>
            <PhotosSection onPhotosChange={() => {}} />
        </div>
    );
};

export default EditPhotosPage;