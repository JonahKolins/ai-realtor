import React, { useState, useCallback } from 'react';
import { PhotoPreview } from './PhotoPreview';
import styles from './PhotoUploader.module.sass';
import { IoCloudUploadOutline } from 'react-icons/io5';

export interface PhotoFile {
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

interface PhotoUploaderProps {
    onFilesChange?: (files: PhotoFile[]) => void;
    maxFiles?: number;
    maxFileSize?: number; // в байтах
}

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
];

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
    onFilesChange,
    maxFiles = 10,
    maxFileSize = 5 * 1024 * 1024 // 5MB по умолчанию
}) => {
    const [photos, setPhotos] = useState<PhotoFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return `Файл "${file.name}" не является изображением. Поддерживаются только фотографии.`;
        }
        
        if (file.size > maxFileSize) {
            return `Файл "${file.name}" слишком большой. Максимальный размер: ${Math.round(maxFileSize / 1024 / 1024)}MB.`;
        }

        return null;
    }, [maxFileSize]);

    const uploadFile = async (photoFile: PhotoFile): Promise<void> => {
        // Заглушка для загрузки на сервер
        return new Promise((resolve, reject) => {
            // Имитация загрузки с случайным результатом
            setTimeout(() => {
                const random = Math.random();
                if (random > 0.8) {
                    reject(new Error('Ошибка загрузки на сервер'));
                } else {
                    resolve();
                }
            }, 2000 + Math.random() * 3000); // 2-5 секунд
        });
    };

    const processFiles = useCallback(async (fileList: FileList) => {
        const newErrors: string[] = [];
        const validFiles: File[] = [];

        // Проверка лимита файлов
        if (photos.length + fileList.length > maxFiles) {
            newErrors.push(`Можно загрузить не более ${maxFiles} фотографий.`);
            setErrors(newErrors);
            return;
        }

        // Валидация файлов
        Array.from(fileList).forEach(file => {
            const error = validateFile(file);
            if (error) {
                newErrors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setTimeout(() => setErrors([]), 5000); // Убираем ошибки через 5 секунд
        }

        if (validFiles.length === 0) return;

        // Создаем объекты фотографий
        const newPhotos: PhotoFile[] = validFiles.map(file => ({
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            status: 'uploading'
        }));

        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        onFilesChange?.(updatedPhotos);

        // Запускаем загрузку для каждого файла
        newPhotos.forEach(async (photoFile) => {
            try {
                await uploadFile(photoFile);
                
                setPhotos(prev => {
                    const updated = prev.map(p => 
                        p.id === photoFile.id 
                            ? { ...p, status: 'success' as const }
                            : p
                    );
                    onFilesChange?.(updated);
                    return updated;
                });
            } catch (error) {
                setPhotos(prev => {
                    const updated = prev.map(p => 
                        p.id === photoFile.id 
                            ? { ...p, status: 'error' as const, error: (error as Error).message }
                            : p
                    );
                    onFilesChange?.(updated);
                    return updated;
                });
            }
        });
    }, [photos, maxFiles, validateFile, onFilesChange]);

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

    const handleRemovePhoto = useCallback((photoId: string) => {
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === photoId);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.preview);
            }
            
            const updated = prev.filter(p => p.id !== photoId);
            onFilesChange?.(updated);
            return updated;
        });
    }, [onFilesChange]);

    return (
        <div className={styles.container}>
            {/* Зона загрузки */}
            <div 
                className={`${styles.uploadZone} ${isDragOver ? styles._dragOver : ''}`}
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
                    <IoCloudUploadOutline size={48} className={styles.uploadIcon} />
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
                            onRemove={handleRemovePhoto}
                        />
                    ))}
                </div>
            )}

            {/* Информация */}
            <div className={styles.info}>
                <div>Uploaded: {photos.length} / {maxFiles}</div>
                <div>Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB</div>
            </div>
        </div>
    );
};

export default PhotoUploader;
