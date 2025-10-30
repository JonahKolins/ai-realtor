import React from 'react';
import styles from './PhotoPreview.module.sass';
import { 
    IoImageOutline, 
    IoCloseOutline, 
    IoCheckmarkCircleOutline, 
    IoAlertCircleOutline,
    IoRefreshOutline,
    IoCloudUploadOutline
} from 'react-icons/io5';
import { PhotoFile } from './types';
import { PhotoUploadStatus } from '@/classes/photos/PhotoUploadService';

export interface PhotoPreviewProps {
    photo: PhotoFile;
    status: PhotoUploadStatus;
    onRemove: (photoId: string) => void;
    onRetry?: (photoId: string) => void;
    hidePreview?: boolean;
    showProgress?: boolean;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({ 
    photo, 
    status,
    onRemove, 
    onRetry, 
    hidePreview, 
    showProgress = true 
}) => {
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
        switch (status) {
            case 'pending':
                return <IoCloudUploadOutline className={styles.pendingIcon} size={16} />;
            case 'uploading':
                return <div className={styles.loadingSpinner}></div>;
            case 'processing':
                return <div className={styles.processingSpinner}></div>;
            case 'completed':
                return <IoCheckmarkCircleOutline className={styles.successIcon} size={16} />;
            case 'error':
                return <IoAlertCircleOutline className={styles.errorIcon} size={16} />;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'pending':
                return 'Waiting';
            case 'uploading':
                return `Uploading ${photo.progress}%`;
            case 'processing':
                return photo.progress > 90 ? 'Finalization' : 'Processing';
            case 'completed':
                return 'Completed';
            case 'error':
                return photo.uploadedPhotoId ? 'Processing error' : 'Upload error';
            default:
                return '';
        }
    };

    return (
        <div className={`${styles.preview} ${styles[`_${photo.status}`]}`}>
            {/* Кнопка удаления */}
            <button 
                className={styles.removeButton}
                onClick={handleRemove}
                type="button"
                aria-label="Delete photo"
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
                    
                    {/* Оверлей для завершенных фотографий */}
                    {photo.status === 'completed' && (
                        <div className={styles.completedOverlay}>
                            <IoCheckmarkCircleOutline size={32} className={styles.completedIcon} />
                        </div>
                    )}
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

            {/* Прогресс-бар */}
            {showProgress && (photo.status === 'uploading' || photo.status === 'processing') && (
                <div className={styles.progressContainer}>
                    <div 
                        className={`${styles.progressBar} ${photo.status === 'processing' ? styles.processingBar : ''}`}
                        style={{ width: `${photo.progress}%` }}
                    ></div>
                </div>
            )}

            {/* Статус загрузки */}
            <div className={styles.status}>
                <div className={styles.statusContent}>
                    {renderStatusIcon()}
                    <span className={styles.statusText}>{getStatusText()}</span>
                </div>
                
                {photo.status === 'error' && (
                    <>
                        {photo.canRetry && onRetry && (
                            <button 
                                className={styles.retryButton}
                                onClick={() => onRetry(photo.id)}
                                type="button"
                                title="Retry upload"
                            >
                                <IoRefreshOutline size={14} />
                            </button>
                        )}
                        
                        {/* Показываем кнопку повтора всегда для ошибок обработки */}
                        {!photo.canRetry && photo.uploadedPhotoId && onRetry && (
                            <button 
                                className={styles.retryButton}
                                onClick={() => onRetry(photo.id)}
                                type="button"
                                title="Retry processing"
                            >
                                <IoRefreshOutline size={14} />
                            </button>
                        )}
                    </>
                )}
                
                {photo.status === 'error' && photo.error && (
                    <div className={styles.errorMessage} title={photo.error}>
                        {photo.error.length > 50 ? photo.error.substring(0, 50) + '...' : photo.error}
                    </div>
                )}
            </div>
        </div>
    );
};
