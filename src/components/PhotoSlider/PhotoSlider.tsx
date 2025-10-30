import React, { useState, useCallback } from 'react';
import styles from './PhotoSlider.module.sass';
import { IoChevronBack, IoChevronForward, IoExpand } from 'react-icons/io5';
import { DisplayPhoto } from '../../classes/photos/ListingPhotoStorage';
import classNames from 'classnames';

export interface PhotoSliderProps {
    photos: DisplayPhoto[];
    className?: string;
    showThumbnails?: boolean;
    onPhotoClick?: (photo: DisplayPhoto, index: number) => void;
    autoHeight?: boolean;
}

export const PhotoSlider: React.FC<PhotoSliderProps> = ({
    photos,
    className,
    showThumbnails = true,
    onPhotoClick,
    autoHeight = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isImageLoading, setIsImageLoading] = useState(false);

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

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        }
    }, [goToPrevious, goToNext]);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    };

    const handleImageLoadStart = () => {
        setIsImageLoading(true);
    };

    const handlePhotoClick = () => {
        const currentPhoto = photos[currentIndex];
        if (currentPhoto && onPhotoClick) {
            onPhotoClick(currentPhoto, currentIndex);
        }
    };

    if (!photos || photos.length === 0) {
        return (
            <div className={classNames(styles.slider, className)}>
                <div className={styles['empty-state']}>
                    <div className={styles['empty-message']}>Nessuna foto disponibile</div>
                </div>
            </div>
        );
    }

    const currentPhoto = photos[currentIndex];

    return (
        <div 
            className={classNames(styles.slider, className, autoHeight && styles['auto-height'])}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Main photo */}
            <div className={styles['main-photo']}>
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
                            aria-label="Foto precedente"
                        >
                            <IoChevronBack />
                        </button>
                        <button
                            className={classNames(styles['nav-button'], styles.next)}
                            onClick={goToNext}
                            aria-label="Foto successiva"
                        >
                            <IoChevronForward />
                        </button>
                    </>
                )}

                {/* Expand button */}
                {onPhotoClick && (
                    <button
                        className={styles['expand-button']}
                        onClick={handlePhotoClick}
                        aria-label="Espandi foto"
                    >
                        <IoExpand />
                    </button>
                )}

                {/* Photo counter */}
                {photos.length > 1 && (
                    <div className={styles['photo-counter']}>
                        {currentIndex + 1} / {photos.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {showThumbnails && photos.length > 1 && (
                <div className={styles.thumbnails}>
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
                        </div>
                    ))}
                </div>
            )}

            {/* Dots indicator (alternative to thumbnails) */}
            {!showThumbnails && photos.length > 1 && (
                <div className={styles.dots}>
                    {photos.map((_, index) => (
                        <button
                            key={index}
                            className={classNames(
                                styles.dot,
                                index === currentIndex && styles.active
                            )}
                            onClick={() => goToSlide(index)}
                            aria-label={`Vai alla foto ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
