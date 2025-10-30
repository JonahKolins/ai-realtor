import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PhotoPreview } from './PhotoPreview';
import styles from './PhotoUploader.module.sass';
import { IoCloudUploadOutline } from 'react-icons/io5';
import classNames from 'classnames';
import { PhotoFile, PhotoUploaderProps } from './types';
import { 
    PhotoUploadService, 
    SUPPORTED_IMAGE_TYPES, 
    MAX_FILE_SIZE, 
    MAX_PHOTOS_PER_LISTING,
    PhotoUploadCallbacks
} from '../../classes/photos/PhotoUploadService';
import { listingPhotoStorage } from '../../classes/photos/ListingPhotoStorage';

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
    listingId,
    onFilesChange,
    onListingIdChange,
    maxFiles = MAX_PHOTOS_PER_LISTING,
    maxFileSize = MAX_FILE_SIZE,
    uploadZoneClassName,
    hidePreview,
    allowRetry = true,
    showProgress = true
}) => {
    const [photos, setPhotos] = useState<PhotoFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const uploadServiceRef = useRef<PhotoUploadService | null>(null);

    // Инициализация сервиса загрузки
    useEffect(() => {
        const callbacks: PhotoUploadCallbacks = {
            onProgress: (photoId, progress) => {
                console.log(`[PhotoUploader] onProgress вызван для ${photoId} с прогрессом ${progress}%`);
                setPhotos(prev => prev.map(p => 
                    p.id === photoId ? { ...p, progress } : p
                ));
            },
            onStatusChange: (photoId, status) => {
                console.log(`[PhotoUploader] onStatusChange вызван для ${photoId} со статусом ${status}`);
                setPhotos(prev => {
                    console.log(`[PhotoUploader] Текущие фото до обновления:`, prev.map(p => ({ id: p.id, status: p.status })));
                    const updated = prev.map(p => 
                        p.id === photoId ? { ...p, status, canRetry: status === 'error' } : p
                    );
                    console.log(`[PhotoUploader] Фото после обновления:`, updated.map(p => ({ id: p.id, status: p.status })));
                    
                    // Обновляем глобальное хранилище
                    const photoFile = updated.find(p => p.id === photoId);
                    if (photoFile) {
                        listingPhotoStorage.updatePhotoFromUploader(photoFile);
                    }
                    
                    onFilesChange?.(updated);
                    return updated;
                });
            },
            onError: (photoId, error) => {
                setPhotos(prev => {
                    const updated = prev.map(p => 
                        p.id === photoId ? { ...p, error, canRetry: true } : p
                    );
                    
                    // Обновляем глобальное хранилище
                    const photoFile = updated.find(p => p.id === photoId);
                    if (photoFile) {
                        listingPhotoStorage.updatePhotoFromUploader(photoFile);
                    }
                    
                    onFilesChange?.(updated);
                    return updated;
                });
            },
            onComplete: (photoId, uploadedPhotoId) => {
                console.log(`[PhotoUploader] onComplete вызван для ${photoId} с uploadedPhotoId ${uploadedPhotoId}`);
                setPhotos(prev => {
                    const updated = prev.map(p => 
                        p.id === photoId ? { ...p, uploadedPhotoId } : p
                    );
                    
                    // Обновляем глобальное хранилище
                    const photoFile = updated.find(p => p.id === photoId);
                    if (photoFile) {
                        listingPhotoStorage.updatePhotoFromUploader(photoFile);
                    }
                    
                    onFilesChange?.(updated);
                    return updated;
                });
            },
            onAllComplete: () => {
                setIsUploading(false);
            }
        };

        uploadServiceRef.current = new PhotoUploadService(callbacks);

        return () => {
            uploadServiceRef.current?.cancelAllUploads();
            uploadServiceRef.current?.stopPhotoPolling();
        };
    }, [onFilesChange]);

    // Устанавливаем listingId в хранилище при изменении
    useEffect(() => {
        if (listingId) {
            listingPhotoStorage.setListingId(listingId);
        }
    }, [listingId]);

    const validateFiles = useCallback((files: File[]): string[] => {
        if (!uploadServiceRef.current) return [];
        return uploadServiceRef.current.validateFiles(files, photos.length);
    }, [photos.length]);

    const processFiles = useCallback(async (fileList: FileList) => {
        const files = Array.from(fileList);
        
        // Валидация файлов
        const validationErrors = validateFiles(files);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setTimeout(() => setErrors([]), 5000); // Убираем ошибки через 5 секунд
            return;
        }

        // Создаем объекты фотографий для отображения
        const newPhotos: PhotoFile[] = files.map(file => ({
            id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',
            progress: 0,
            canRetry: false
        }));

        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        onFilesChange?.(updatedPhotos);

        // Добавляем новые фотографии в глобальное хранилище
        newPhotos.forEach(photo => {
            listingPhotoStorage.updatePhotoFromUploader(photo);
        });

        // Запускаем загрузку
        setIsUploading(true);
        try {
            if (!uploadServiceRef.current) {
                throw new Error('Сервис загрузки не инициализирован');
            }
            console.log('uploadPhotos -> listingId', listingId);
            
            // Передаем ID фотографий в сервис
            const photoIds = newPhotos.map(p => p.id);
            const actualListingId = await uploadServiceRef.current.uploadPhotos(files, listingId, photoIds);
            
            // Если listingId не был передан, уведомляем о создании черновика
            if (!listingId && actualListingId) {
                listingPhotoStorage.setListingId(actualListingId);
                onListingIdChange?.(actualListingId);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setErrors([errorMessage]);
            setTimeout(() => setErrors([]), 5000);
            setIsUploading(false);
        }
    }, [photos, validateFiles, listingId, onFilesChange, onListingIdChange]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
        // Сбрасываем input для возможности загрузки тех же файлов повторно
        e.target.value = '';
    }, [processFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleRemovePhoto = useCallback(async (photoId: string) => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) return;

        // Если фотография была успешно загружена, удаляем с сервера
        if (photo.uploadedPhotoId && listingId && uploadServiceRef.current) {
            try {
                await uploadServiceRef.current.deletePhoto(listingId, photo.uploadedPhotoId);
            } catch (error) {
                console.error('Ошибка при удалении фотографии с сервера:', error);
                // Продолжаем удаление из UI даже если серверное удаление не удалось
            }
        }

        // Удаляем из UI и глобального хранилища
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === photoId);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.preview);
            }
            
            const updated = prev.filter(p => p.id !== photoId);
            onFilesChange?.(updated);
            
            // Удаляем из глобального хранилища
            listingPhotoStorage.removePhoto(photoId);
            
            return updated;
        });
    }, [photos, listingId, onFilesChange]);

    const handleRetryPhoto = useCallback(async (photoId: string) => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo || !uploadServiceRef.current) return;

        // Сбрасываем состояние фотографии
        setPhotos(prev => prev.map(p => 
            p.id === photoId 
                ? { ...p, status: 'pending', progress: 0, error: undefined, canRetry: false }
                : p
        ));

        try {
            setIsUploading(true);
            
            // Если у фотографии есть uploadedPhotoId, это означает ошибку обработки
            // В этом случае нужно попробовать повторно обработать, а не загружать заново
            if (photo.uploadedPhotoId) {
                // Для повтора обработки просто перезапускаем polling
                // Сервер может автоматически повторить обработку при запросе
                console.log('Повтор обработки фотографии:', photo.uploadedPhotoId);
                
                // Устанавливаем статус processing и запускаем polling
                setPhotos(prev => prev.map(p => 
                    p.id === photoId 
                        ? { ...p, status: 'processing', progress: 50 }
                        : p
                ));
                
                if (uploadServiceRef.current && listingId) {
                    // Перезапускаем polling для отслеживания повторной обработки
                    uploadServiceRef.current.restartPollingForProcessing(listingId);
                }
            } else {
                // Обычная повторная загрузка файла
                await uploadServiceRef.current.uploadPhotos([photo.file], listingId, [photoId]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setErrors([errorMessage]);
            setTimeout(() => setErrors([]), 5000);
            setIsUploading(false);
        }
    }, [photos, listingId]);

    console.log('photos', photos);
    console.log('photos[0].status', photos[0]?.status);
    

    return (
        <div className={styles.container}>
            {/* Зона загрузки */}
            <div 
                className={classNames(
                    styles['uploadZone'],
                    isDragOver && styles['_dragOver'],
                    uploadZoneClassName
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className={styles.fileInput}
                    id="photo-upload"
                />
                <label htmlFor="photo-upload" className={styles.uploadLabel}>
                    <IoCloudUploadOutline size={36} className={styles.uploadIcon} />
                    <div className={styles.uploadText}>
                        <div>Drag and drop photos here</div>
                        <div>or <span className={styles.clickText}>click to select</span></div>
                    </div>
                </label>
            </div>

            {/* Ошибки */}
            {errors.length > 0 && (
                <div className={styles.errors}>
                    {errors.map((error, index) => (
                        <div key={index} className={styles.error}>
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Превью фотографий */}
            {photos.length > 0 && (
                <div className={styles.photosGrid}>
                    {photos.map(photo => (
                        <PhotoPreview
                            key={photo.id}
                            photo={photo}
                            status={photo.status}
                            onRemove={handleRemovePhoto}
                            onRetry={allowRetry ? handleRetryPhoto : undefined}
                            hidePreview={hidePreview}
                            showProgress={showProgress}
                        />
                    ))}
                </div>
            )}

            {/* Информация */}
            <div className={styles.info}>
                <div>
                    Фотографий: {photos.length} / {maxFiles}
                    {isUploading && (
                        <span className={styles.uploadingIndicator}> • Загрузка...</span>
                    )}
                </div>
                <div>Макс. размер: {Math.round(maxFileSize / 1024 / 1024)}MB</div>
                <div>Форматы: JPEG, PNG, WebP, HEIC</div>
            </div>
        </div>
    );
};

export default PhotoUploader;
