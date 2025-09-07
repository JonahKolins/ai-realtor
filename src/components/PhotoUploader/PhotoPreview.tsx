import React from 'react';
import { PhotoFile } from './PhotoUploader';
import styles from './PhotoPreview.module.sass';
import { 
    IoImageOutline, 
    IoCloseOutline, 
    IoCheckmarkCircleOutline, 
    IoAlertCircleOutline 
} from 'react-icons/io5';

interface PhotoPreviewProps {
    photo: PhotoFile;
    onRemove: (photoId: string) => void;
    hidePreview?: boolean;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({ photo, onRemove, hidePreview }) => {
    const getFileExtension = (filename: string): string => {
        return filename.split('.').pop()?.toUpperCase() || '';
    };

    const getFileName = (filename: string): string => {
        const extension = '.' + filename.split('.').pop();
        return filename.replace(extension, '');
    };

    const handleRemove = () => {
        onRemove(photo.id);
    };

    const renderStatusIcon = () => {
        switch (photo.status) {
            case 'uploading':
                return <div className={styles.loadingSpinner}></div>;
            case 'success':
                return <IoCheckmarkCircleOutline className={styles.successIcon} size={16} />;
            case 'error':
                return <IoAlertCircleOutline className={styles.errorIcon} size={16} />;
            default:
                return null;
        }
    };

    return (
        <div className={`${styles.preview} ${styles[`_${photo.status}`]}`}>
            {/* Кнопка удаления */}
            <button 
                className={styles.removeButton}
                onClick={handleRemove}
                type="button"
                aria-label="Удалить фотографию"
            >
                <IoCloseOutline size={14} />
            </button>

            {/* Превью изображения */}
            {!hidePreview && (
                <div className={styles.imageContainer}>
                    <img 
                        src={photo.preview} 
                        alt={photo.file.name}
                        className={styles.image}
                    />
                    <div className={styles.overlay}>
                        <IoImageOutline size={24} className={styles.imageIcon} />
                    </div>
                </div>
            )}

            {/* Информация о файле */}
            <div className={styles.fileInfo}>
                <div className={styles.fileName}>
                    {getFileName(photo.file.name)}
                </div>
                <div className={styles.fileDetails}>
                    <span className={styles.extension}>
                        {getFileExtension(photo.file.name)}
                    </span>
                    <span className={styles.size}>
                        {(photo.file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                </div>
            </div>

            {/* Статус загрузки */}
            <div className={styles.status}>
                {renderStatusIcon()}
                {photo.status === 'error' && photo.error && (
                    <div className={styles.errorMessage} title={photo.error}>
                        Ошибка загрузки
                    </div>
                )}
            </div>
        </div>
    );
};
