import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from 'antd';
import styles from './PhotoModal.module.sass';
import { IoClose, IoChevronBack, IoChevronForward, IoDownload, IoShareSocial } from 'react-icons/io5';
import { DisplayPhoto } from '../../services/ListingPhotoStorage';
import classNames from 'classnames';

export interface PhotoModalProps {
    photos: DisplayPhoto[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
    onDownload?: (photo: DisplayPhoto) => void;
    onShare?: (photo: DisplayPhoto) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
    photos,
    initialIndex = 0,
    open,
    onClose,
    onDownload,
    onShare
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Обновляем индекс при изменении initialIndex
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [initialIndex, open]);

    const goToSlide = useCallback((index: number) => {
        if (index >= 0 && index < photos.length) {
            setCurrentIndex(index);
        }
    }, [photos.length]);

    const goToPrevious = useCallback(() => {
        const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
    }, [currentIndex, photos.length, goToSlide]);

    const goToNext = useCallback(() => {
        const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
        goToSlide(newIndex);
    }, [currentIndex, photos.length, goToSlide]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!open) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                goToPrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToNext();
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [open, goToPrevious, goToNext, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    };

    const handleImageLoadStart = () => {
        setIsImageLoading(true);
    };

    const handleDownload = () => {
        const currentPhoto = photos[currentIndex];
        if (currentPhoto && onDownload) {
            onDownload(currentPhoto);
        }
    };

    const handleShare = () => {
        const currentPhoto = photos[currentIndex];
        if (currentPhoto && onShare) {
            onShare(currentPhoto);
        }
    };

    if (!photos || photos.length === 0) {
        return null;
    }

    const currentPhoto = photos[currentIndex];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closable={false}
            width="100vw"
            style={{ 
                maxWidth: 'none', 
                margin: 0, 
                padding: 0,
                top: 0
            }}
            bodyStyle={{ 
                padding: 0, 
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.9)'
            }}
            className={styles['photo-modal']}
        >
            <div className={styles['modal-content']}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles['photo-info']}>
                        <span className={styles['photo-counter']}>
                            {currentIndex + 1} / {photos.length}
                        </span>
                        {currentPhoto.isCover && (
                            <span className={styles['cover-badge']}>
                                Copertina
                            </span>
                        )}
                    </div>
                    
                    <div className={styles.actions}>
                        {onDownload && (
                            <button
                                className={styles['action-button']}
                                onClick={handleDownload}
                                title="Scarica foto"
                            >
                                <IoDownload />
                            </button>
                        )}
                        {onShare && (
                            <button
                                className={styles['action-button']}
                                onClick={handleShare}
                                title="Condividi foto"
                            >
                                <IoShareSocial />
                            </button>
                        )}
                        <button
                            className={styles['close-button']}
                            onClick={onClose}
                            title="Chiudi"
                        >
                            <IoClose />
                        </button>
                    </div>
                </div>

                {/* Main photo area */}
                <div className={styles['photo-container']}>
                    <img
                        src={currentPhoto.url}
                        alt={`Foto ${currentIndex + 1}`}
                        className={classNames(styles.image, isImageLoading && styles.loading)}
                        onLoad={handleImageLoad}
                        onLoadStart={handleImageLoadStart}
                    />

                    {/* Loading overlay */}
                    {isImageLoading && (
                        <div className={styles['loading-overlay']}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                className={classNames(styles['nav-button'], styles.previous)}
                                onClick={goToPrevious}
                                title="Foto precedente"
                            >
                                <IoChevronBack />
                            </button>
                            <button
                                className={classNames(styles['nav-button'], styles.next)}
                                onClick={goToNext}
                                title="Foto successiva"
                            >
                                <IoChevronForward />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                    <div className={styles.thumbnails}>
                        <div className={styles['thumbnails-container']}>
                            {photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className={classNames(
                                        styles.thumbnail,
                                        index === currentIndex && styles.active
                                    )}
                                    onClick={() => goToSlide(index)}
                                >
                                    <img
                                        src={photo.thumbnailUrl || photo.url}
                                        alt={`Miniatura ${index + 1}`}
                                    />
                                    {photo.isCover && (
                                        <div className={styles['thumbnail-badge']}>
                                            C
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
