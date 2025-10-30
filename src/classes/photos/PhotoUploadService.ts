import { 
    requestPhotoUploads, 
    requestPhotoComplete, 
    requestDeletePhoto, 
    requestDeleteAllPhotos,
    requestListingPhotos,
    IRequestPhotoUploadsRequest,
    IPhotoUploadSlot,
    ICompletePhotoUploadRequest,
    ICompletePhotoUploadResponse,
    IListingPhoto,
    requestCreateListingDraft,
    ListingType
} from '../../api/network/listings';

// Поддерживаемые MIME типы
export const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/heic'
];

// Максимальные ограничения
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_PHOTOS_PER_LISTING = 30;

// Статусы загрузки фотографий
export type PhotoUploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'error';

// Интерфейс для отслеживания прогресса загрузки
export interface PhotoUploadProgress {
    photoId: string;
    file: File;
    status: PhotoUploadStatus;
    progress: number; // 0-100
    error?: string;
    assetId?: string;
    uploadedPhotoId?: string; // ID из API после завершения загрузки
    canRetry?: boolean; // Можно ли повторить загрузку
}

// Интерфейс для метаданных изображения
export interface ImageMetadata {
    width: number;
    height: number;
    size: number;
    mime: string;
    originalName: string;
}

// Обработчики событий
export interface PhotoUploadCallbacks {
    onProgress?: (photoId: string, progress: number) => void;
    onStatusChange?: (photoId: string, status: PhotoUploadStatus) => void;
    onError?: (photoId: string, error: string) => void;
    onComplete?: (photoId: string, uploadedPhotoId: string) => void;
    onAllComplete?: () => void;
}

export class PhotoUploadService {
    private uploads: Map<string, PhotoUploadProgress> = new Map();
    private callbacks: PhotoUploadCallbacks = {};
    private maxConcurrentUploads = 3;
    private pollingInterval: NodeJS.Timeout | null = null;
    private isPolling = false;
    private currentListingId: string | null = null;

    constructor(callbacks?: PhotoUploadCallbacks) {
        this.callbacks = callbacks || {};
    }

    /**
     * Валидация файла
     */
    public validateFile(file: File): string | null {
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            return `Неподдерживаемый тип файла "${file.name}". Поддерживаются: JPEG, PNG, WebP, HEIC.`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return `Файл "${file.name}" слишком большой. Максимальный размер: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`;
        }

        return null;
    }

    /**
     * Валидация множественных файлов
     */
    public validateFiles(files: File[], currentPhotoCount: number = 0): string[] {
        const errors: string[] = [];

        if (currentPhotoCount + files.length > MAX_PHOTOS_PER_LISTING) {
            errors.push(`Превышен лимит фотографий. Максимум ${MAX_PHOTOS_PER_LISTING} фотографий на объявление.`);
            return errors;
        }

        files.forEach(file => {
            const error = this.validateFile(file);
            if (error) {
                errors.push(error);
            }
        });

        return errors;
    }

    /**
     * Извлечение метаданных изображения
     */
    public async extractImageMetadata(file: File): Promise<ImageMetadata> {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('Файл не является изображением'));
                return;
            }

            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    size: file.size,
                    mime: file.type,
                    originalName: file.name
                });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Не удалось загрузить изображение'));
            };

            img.src = url;
        });
    }

    /**
     * Загрузка файла в S3 по pre-signed URL
     */
    private async uploadToS3(file: File, uploadUrl: string, onProgress?: (progress: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Ошибка загрузки в S3: ${xhr.status} ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Ошибка сети при загрузке в S3'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Загрузка отменена'));
            });

            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    }

    /**
     * Загрузка одного файла
     */
    private async uploadSingleFile(
        listingId: string, 
        file: File, 
        slot: IPhotoUploadSlot, 
        photoId: string
    ): Promise<void> {
        try {
            // Обновляем статус
            this.updateUploadStatus(photoId, 'uploading', 0);

            // Загружаем в S3
            await this.uploadToS3(file, slot.uploadUrl, (progress) => {
                this.updateUploadProgress(photoId, progress);
            });

            // Обновляем статус на обработку
            this.updateUploadStatus(photoId, 'processing', 100);

            // Извлекаем метаданные
            const metadata = await this.extractImageMetadata(file);

            // Подтверждаем загрузку
            const completeRequest: ICompletePhotoUploadRequest = {
                assetId: slot.assetId,
                key: slot.key,
                size: metadata.size,
                width: metadata.width,
                height: metadata.height,
                originalName: metadata.originalName,
                mime: metadata.mime
            };

            const response = await requestPhotoComplete(listingId, completeRequest);

            console.log(`[Upload] Complete response для ${photoId}:`, response);

            // Обновляем данные загрузки
            const upload = this.uploads.get(photoId);
            if (upload) {
                const updatedUpload = { 
                    ...upload, 
                    uploadedPhotoId: response.photoId
                };

                // Если статус PROCESSING, оставляем processing и запускаем polling
                if (response.status === 'PROCESSING') {
                    updatedUpload.status = 'processing';
                    console.log(`[Upload] Статус PROCESSING для ${photoId}, запускаем polling`);
                    this.startPolling(listingId);
                } else {
                    updatedUpload.status = 'completed'; 
                    console.log(`[Upload] Статус completed для ${photoId}`);
                }
                
                this.uploads.set(photoId, updatedUpload);
                console.log(`[Upload] Сохранили данные для ${photoId}:`, updatedUpload);
            }

            // Всегда вызываем onComplete для установки uploadedPhotoId
            console.log(`[Upload] Вызываем onComplete для ${photoId} с uploadedPhotoId ${response.photoId}`);
            this.callbacks.onComplete?.(photoId, response.photoId);
            
            // Вызываем callback для статуса
            if (response.status !== 'PROCESSING') {
                console.log(`[Upload] Вызываем onStatusChange completed для ${photoId}`);
                this.callbacks.onStatusChange?.(photoId, 'completed');
            } else {
                console.log(`[Upload] Вызываем onStatusChange processing для ${photoId}`);
                this.callbacks.onStatusChange?.(photoId, 'processing');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            this.updateUploadError(photoId, errorMessage);
            throw error;
        }
    }

    /**
     * Обновление прогресса загрузки
     */
    private updateUploadProgress(photoId: string, progress: number): void {
        const upload = this.uploads.get(photoId);
        if (upload) {
            upload.progress = progress;
            this.uploads.set(photoId, upload);
            this.callbacks.onProgress?.(photoId, progress);
        }
    }

    /**
     * Обновление статуса загрузки
     */
    private updateUploadStatus(photoId: string, status: PhotoUploadStatus, progress?: number): void {
        const upload = this.uploads.get(photoId);
        if (upload) {
            upload.status = status;
            if (progress !== undefined) {
                upload.progress = progress;
            }
            this.uploads.set(photoId, upload);
            this.callbacks.onStatusChange?.(photoId, status);
            if (progress !== undefined) {
                this.callbacks.onProgress?.(photoId, progress);
            }
        }
    }

    /**
     * Обновление ошибки загрузки
     */
    private updateUploadError(photoId: string, error: string): void {
        const upload = this.uploads.get(photoId);
        if (upload) {
            upload.status = 'error';
            upload.error = error;
            this.uploads.set(photoId, upload);
            this.callbacks.onError?.(photoId, error);
            this.callbacks.onStatusChange?.(photoId, 'error');
        }
    }

    /**
     * Создание черновика, если его нет
     */
    private async ensureDraftExists(listingId?: string): Promise<string> {
        if (listingId) {
            return listingId;
        }

        // Создаем новый черновик
        const response = await requestCreateListingDraft({type: "sale" as ListingType});
        return response.id;
    }

    /**
     * Основной метод загрузки фотографий
     */
    public async uploadPhotos(files: File[], listingId?: string, photoIds?: string[]): Promise<string> {
        // Проверяем валидацию
        const errors = this.validateFiles(files);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Убеждаемся, что черновик существует
        const actualListingId = await this.ensureDraftExists(listingId);

        // Используем переданные ID или создаем новые
        const actualPhotoIds: string[] = photoIds || [];
        if (!photoIds) {
            files.forEach(() => {
                const photoId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                actualPhotoIds.push(photoId);
            });
        }

        // Создаем записи прогресса для каждого файла
        files.forEach((file, index) => {
            const photoId = actualPhotoIds[index];
            
            this.uploads.set(photoId, {
                photoId,
                file,
                status: 'pending',
                progress: 0
            });
        });

        try {
            // Запрашиваем слоты загрузки
            const uploadsRequest: IRequestPhotoUploadsRequest = {
                count: files.length,
                mimeTypes: files.map(f => f.type)
            };

            const uploadsResponse = await requestPhotoUploads(actualListingId, uploadsRequest);

            // Привязываем слоты к файлам
            const uploadTasks = files.map((file, index) => {
                const photoId = actualPhotoIds[index];
                const slot = uploadsResponse.items[index];
                
                // Сохраняем assetId
                const upload = this.uploads.get(photoId);
                if (upload) {
                    upload.assetId = slot.assetId;
                    this.uploads.set(photoId, upload);
                }

                return { file, slot, photoId };
            });

            // Запускаем загрузки с ограничением по количеству
            const uploadPromises: Promise<void>[] = [];
            
            for (let i = 0; i < uploadTasks.length; i += this.maxConcurrentUploads) {
                const batch = uploadTasks.slice(i, i + this.maxConcurrentUploads);
                
                const batchPromises = batch.map(({ file, slot, photoId }) => 
                    this.uploadSingleFile(actualListingId, file, slot, photoId)
                );

                uploadPromises.push(...batchPromises);

                // Ждем завершения текущего батча перед следующим
                if (i + this.maxConcurrentUploads < uploadTasks.length) {
                    await Promise.allSettled(batchPromises);
                }
            }

            // Ждем завершения всех загрузок
            const results = await Promise.allSettled(uploadPromises);

            // Проверяем результаты
            const errors: string[] = [];
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    errors.push(`Файл ${files[index].name}: ${result.reason}`);
                }
            });

            if (errors.length > 0) {
                throw new Error(`Ошибки при загрузке:\n${errors.join('\n')}`);
            }

            // Все загрузки завершены успешно
            this.callbacks.onAllComplete?.();

        } catch (error) {
            // Отмечаем все неудачные загрузки как ошибочные
            actualPhotoIds.forEach(photoId => {
                const upload = this.uploads.get(photoId);
                if (upload && upload.status !== 'completed') {
                    this.updateUploadError(photoId, error instanceof Error ? error.message : 'Неизвестная ошибка');
                }
            });
            
            throw error;
        }

        return actualListingId;
    }

    /**
     * Удаление фотографии
     */
    public async deletePhoto(listingId: string, photoId: string): Promise<boolean> {
        try {
            const response = await requestDeletePhoto(listingId, photoId);
            return response.deleted;
        } catch (error) {
            console.error('Ошибка при удалении фотографии:', error);
            return false;
        }
    }

    /**
     * Удаление всех фотографий объявления
     */
    public async deleteAllPhotos(listingId: string): Promise<number> {
        try {
            const response = await requestDeleteAllPhotos(listingId);
            return response.deleted;
        } catch (error) {
            console.error('Ошибка при удалении всех фотографий:', error);
            return 0;
        }
    }

    /**
     * Получение статуса загрузки
     */
    public getUploadStatus(photoId: string): PhotoUploadProgress | undefined {
        return this.uploads.get(photoId);
    }

    /**
     * Получение всех загрузок
     */
    public getAllUploads(): PhotoUploadProgress[] {
        return Array.from(this.uploads.values());
    }

    /**
     * Очистка завершенных загрузок
     */
    public clearCompletedUploads(): void {
        for (const [photoId, upload] of this.uploads.entries()) {
            if (upload.status === 'completed' || upload.status === 'error') {
                this.uploads.delete(photoId);
            }
        }
    }

    /**
     * Отмена всех активных загрузок
     */
    public cancelAllUploads(): void {
        this.stopPolling();
        this.uploads.clear();
    }

    /**
     * Запуск polling для отслеживания статуса обработки фотографий
     */
    private startPolling(listingId: string): void {
        // Если polling уже запущен для этого листинга, не запускаем еще один
        if (this.isPolling && this.currentListingId === listingId) {
            console.log(`[Polling] Уже запущен для листинга ${listingId}`);
            return;
        }

        // Останавливаем предыдущий polling если он был для другого листинга
        if (this.isPolling && this.currentListingId !== listingId) {
            console.log(`[Polling] Останавливаем polling для ${this.currentListingId}, запускаем для ${listingId}`);
            this.stopPolling();
        }

        this.isPolling = true;
        this.currentListingId = listingId;

        console.log(`[Polling] Запуск polling для листинга ${listingId}`);
        console.log(`[Polling] Количество активных загрузок: ${this.uploads.size}`);

        // Запускаем polling каждые 2 секунды
        this.pollingInterval = setInterval(async () => {
            try {
                await this.pollPhotoStatuses(listingId);
            } catch (error) {
                console.error('Ошибка при polling статусов фотографий:', error);
                // Продолжаем polling даже при ошибках, но с предупреждением
            }
        }, 2000);

        // Первый запрос сразу (с небольшой задержкой чтобы uploadedPhotoId успел установиться)
        setTimeout(() => {
            this.pollPhotoStatuses(listingId).catch(error => {
                console.error('Ошибка при первом polling запросе:', error);
            });
        }, 1000);
    }

    /**
     * Остановка polling
     */
    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.isPolling = false;
        this.currentListingId = null;
        console.log('Polling остановлен');
    }

    /**
     * Polling статусов фотографий
     */
    private async pollPhotoStatuses(listingId: string): Promise<void> {
        try {
            const photos = await requestListingPhotos(listingId);
            let allCompleted = true;
            let hasProcessing = false;

            console.log(`[Polling] Получено ${photos.length} фотографий с сервера для листинга ${listingId}`);
            console.log(`[Polling] Активных загрузок: ${this.uploads.size}`);

            // Обновляем статусы загрузок на основе данных с сервера
            for (const [photoId, upload] of this.uploads.entries()) {
                console.log(`[Polling] Проверяем фото ${photoId}, uploadedPhotoId: ${upload.uploadedPhotoId}, status: ${upload.status}`);
                
                if (!upload.uploadedPhotoId) {
                    console.log(`[Polling] Пропускаем фото ${photoId} - нет uploadedPhotoId`);
                    continue;
                }

                // Находим соответствующую фотографию на сервере
                const serverPhoto = photos.find(p => p.id === upload.uploadedPhotoId);
                if (!serverPhoto) {
                    console.log(`[Polling] Фото ${upload.uploadedPhotoId} не найдено на сервере`);
                    continue;
                }

                console.log(`[Polling] Найдена серверная фотография ${serverPhoto.id} со статусом ${serverPhoto.status}`);

                const newStatus = this.mapServerStatusToUploadStatus(serverPhoto.status);
                
                // Обновляем статус если он изменился
                if (upload.status !== newStatus) {
                    console.log(`[Polling] Статус изменился с ${upload.status} на ${newStatus} для фото ${photoId}`);
                    
                    // Создаем обновленный объект
                    const updatedUpload = { 
                        ...upload, 
                        status: newStatus,
                        progress: (newStatus === 'completed' || newStatus === 'error') ? 100 : upload.progress
                    };
                    
                    this.uploads.set(photoId, updatedUpload);
                    
                    // Уведомляем о смене статуса
                    console.log(`[Polling] Вызываем onStatusChange для ${photoId} со статусом ${newStatus}`);
                    this.callbacks.onStatusChange?.(photoId, newStatus);
                    
                    // Обновляем прогресс для UI
                    if (newStatus === 'completed' || newStatus === 'error') {
                        console.log(`[Polling] Вызываем onProgress для ${photoId} с прогрессом 100%`);
                        this.callbacks.onProgress?.(photoId, 100);
                    }
                    
                    // Если фотография готова, вызываем onComplete
                    if (newStatus === 'completed') {
                        console.log(`[Polling] Вызываем onComplete для ${photoId}`);
                        this.callbacks.onComplete?.(photoId, upload.uploadedPhotoId);
                    } else if (newStatus === 'error') {
                        const errorMessage = serverPhoto.status === 'FAILED' 
                            ? 'Ошибка обработки фотографии на сервере' 
                            : 'Неизвестная ошибка обработки';
                        
                        // Для ошибок обработки разрешаем повтор
                        const finalUpdatedUpload = { ...updatedUpload, canRetry: true, error: errorMessage };
                        this.uploads.set(photoId, finalUpdatedUpload);
                        
                        console.log(`[Polling] Вызываем onError для ${photoId} с сообщением: ${errorMessage}`);
                        this.callbacks.onError?.(photoId, errorMessage);
                    }
                } else {
                    console.log(`[Polling] Статус не изменился для фото ${photoId}: ${upload.status}`);
                }

                // Проверяем общий статус
                if (newStatus === 'processing') {
                    hasProcessing = true;
                    allCompleted = false;
                } else if (newStatus !== 'completed') {
                    allCompleted = false;
                }
            }

            // Если все фотографии обработаны (нет processing статусов), останавливаем polling
            if (!hasProcessing) {
                this.stopPolling();
                
                // Если все завершены успешно, вызываем onAllComplete
                if (allCompleted) {
                    this.callbacks.onAllComplete?.();
                }
            }

        } catch (error) {
            console.error('Ошибка при получении статусов фотографий:', error);
            
            // При критических ошибках (например, 404 листинга) останавливаем polling
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                    console.warn('Листинг не найден, останавливаем polling');
                    this.stopPolling();
                }
            }
            
            throw error; // Пробрасываем ошибку для логирования выше
        }
    }

    /**
     * Маппинг статуса с сервера в статус загрузки
     */
    private mapServerStatusToUploadStatus(serverStatus: IListingPhoto['status']): PhotoUploadStatus {
        switch (serverStatus) {
            case 'UPLOADING':
                return 'uploading';
            case 'PROCESSING':
                return 'processing';
            case 'READY':
                return 'completed';
            case 'FAILED':
                return 'error';
            default:
                return 'error';
        }
    }

    /**
     * Принудительная остановка polling (публичный метод)
     */
    public stopPhotoPolling(): void {
        this.stopPolling();
    }

    /**
     * Проверка, активен ли polling
     */
    public isPollingActive(): boolean {
        return this.isPolling;
    }

    /**
     * Перезапуск polling для повторной обработки фотографий
     */
    public restartPollingForProcessing(listingId: string): void {
        if (this.currentListingId !== listingId || !this.isPolling) {
            this.startPolling(listingId);
        }
    }
}
