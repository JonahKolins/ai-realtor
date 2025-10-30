import { EventEmitter } from '../../core/event/EventEmmiter';
import { PhotoFile } from '../../components/PhotoUploader/types';
import { IListingPhoto } from '../../api/network/listings/requests/GetListingPhotos';
import { requestListingPhotos } from '../../api/network/listings';

// Интерфейс для отображаемой фотографии (объединение загружаемой и загруженной)
export interface DisplayPhoto {
    id: string;                    // ID фотографии (может быть временным или серверным)
    uploadedPhotoId?: string;      // ID с сервера (когда загрузка завершена)
    url: string;                   // URL для отображения (blob или CDN)
    thumbnailUrl?: string;         // URL миниатюры
    isCover: boolean;              // Является ли обложкой
    isUploaded: boolean;           // Загружена ли на сервер
    sortOrder: number;             // Порядок сортировки
    status: 'pending' | 'uploading' | 'processing' | 'ready' | 'error';
    progress?: number;             // Прогресс загрузки (0-100)
    width?: number;                // Ширина изображения
    height?: number;               // Высота изображения
    mime?: string;                 // MIME тип
    error?: string;                // Ошибка загрузки
}

// События хранилища фотографий
export interface PhotoStorageEvents {
    'photos-updated': DisplayPhoto[];
    'cover-changed': DisplayPhoto | null;
}

/**
 * Хранилище фотографий для отображения в UI
 * Объединяет загружаемые фотографии (PhotoFile) и загруженные с сервера (IListingPhoto)
 */
export class ListingPhotoStorage {
    private photos: Map<string, DisplayPhoto> = new Map();
    private listingId: string | null = null;
    private _coverPhoto: DisplayPhoto | null = null;
    
    // События
    public readonly photosUpdated: EventEmitter<DisplayPhoto[]>;
    public readonly coverChanged: EventEmitter<DisplayPhoto | null>;

    constructor() {
        this.photosUpdated = new EventEmitter<DisplayPhoto[]>('photosUpdated');
        this.coverChanged = new EventEmitter<DisplayPhoto | null>('coverChanged');
    }

    /**
     * Установка ID листинга
     */
    public setListingId(listingId: string | null): void {
        this.listingId = listingId;
    }

    /**
     * Получение всех фотографий, отсортированных по sortOrder
     */
    public getPhotos(): DisplayPhoto[] {
        const photos = Array.from(this.photos.values());
        return photos.sort((a, b) => {
            // Обложка всегда первая
            if (a.isCover && !b.isCover) return -1;
            if (!a.isCover && b.isCover) return 1;
            // Затем по sortOrder
            return a.sortOrder - b.sortOrder;
        });
    }

    /**
     * Получение обложки
     */
    public getCoverPhoto(): DisplayPhoto | null {
        return this._coverPhoto;
    }

    /**
     * Получение фотографии по ID
     */
    public getPhoto(id: string): DisplayPhoto | null {
        return this.photos.get(id) || null;
    }

    /**
     * Добавление/обновление фотографии из PhotoUploader
     */
    public updatePhotoFromUploader(photoFile: PhotoFile): void {
        const existingPhoto = this.photos.get(photoFile.id);
        
        const displayPhoto: DisplayPhoto = {
            id: photoFile.id,
            uploadedPhotoId: photoFile.uploadedPhotoId,
            url: photoFile.preview, // Используем blob URL пока фото не загружено
            isCover: existingPhoto?.isCover ?? false,
            isUploaded: photoFile.status === 'completed',
            sortOrder: existingPhoto?.sortOrder ?? this.getNextSortOrder(),
            status: this.mapPhotoStatus(photoFile.status),
            progress: photoFile.progress,
            error: photoFile.error
        };

        this.photos.set(photoFile.id, displayPhoto);
        
        // Обновляем обложку если нужно
        this.updateCoverPhoto();
        this.photosUpdated.emit(this.getPhotos());
    }

    /**
     * Обновление фотографии с сервера
     */
    public updatePhotoFromServer(serverPhoto: IListingPhoto): void {
        // Находим локальную фотографию по uploadedPhotoId
        let localPhoto: DisplayPhoto | null = null;
        for (const photo of this.photos.values()) {
            if (photo.uploadedPhotoId === serverPhoto.id) {
                localPhoto = photo;
                break;
            }
        }

        const photoUrl = this.buildPhotoUrl(serverPhoto);
        const thumbnailUrl = this.buildThumbnailUrl(serverPhoto);

        if (localPhoto) {
            // Обновляем существующую фотографию
            localPhoto.url = photoUrl;
            localPhoto.thumbnailUrl = thumbnailUrl;
            localPhoto.isCover = serverPhoto.isCover;
            localPhoto.isUploaded = serverPhoto.status === 'READY';
            localPhoto.sortOrder = serverPhoto.sortOrder;
            localPhoto.status = this.mapServerStatus(serverPhoto.status);
            localPhoto.width = serverPhoto.width || undefined;
            localPhoto.height = serverPhoto.height || undefined;
            localPhoto.mime = serverPhoto.mime || undefined;
            
            this.photos.set(localPhoto.id, localPhoto);
        } else {
            // Создаем новую фотографию (может быть загружена в другом месте)
            const displayPhoto: DisplayPhoto = {
                id: `server_${serverPhoto.id}`,
                uploadedPhotoId: serverPhoto.id,
                url: photoUrl,
                thumbnailUrl: thumbnailUrl,
                isCover: serverPhoto.isCover,
                isUploaded: serverPhoto.status === 'READY',
                sortOrder: serverPhoto.sortOrder,
                status: this.mapServerStatus(serverPhoto.status),
                width: serverPhoto.width || undefined,
                height: serverPhoto.height || undefined,
                mime: serverPhoto.mime || undefined
            };
            
            this.photos.set(displayPhoto.id, displayPhoto);
        }

        this.updateCoverPhoto();
        this.photosUpdated.emit(this.getPhotos());
    }

    /**
     * Загрузка фотографий с сервера
     */
    public async loadPhotosFromServer(listingId: string): Promise<void> {
        try {
            const serverPhotos = await requestListingPhotos(listingId);
            
            // Очищаем старые серверные фотографии (которые начинаются с 'server_')
            for (const [id, photo] of this.photos.entries()) {
                if (id.startsWith('server_')) {
                    this.photos.delete(id);
                }
            }

            // Добавляем новые фотографии с сервера
            serverPhotos.forEach(serverPhoto => {
                this.updatePhotoFromServer(serverPhoto);
            });

        } catch (error) {
            console.error('Ошибка при загрузке фотографий с сервера:', error);
        }
    }

    /**
     * Удаление фотографии
     */
    public removePhoto(id: string): void {
        const photo = this.photos.get(id);
        if (photo) {
            // Освобождаем blob URL если это локальная фотография
            if (photo.url.startsWith('blob:')) {
                URL.revokeObjectURL(photo.url);
            }
            
            this.photos.delete(id);
            this.updateCoverPhoto();
            this.photosUpdated.emit(this.getPhotos());
        }
    }

    /**
     * Установка обложки
     */
    public setCoverPhoto(id: string): void {
        // Сбрасываем флаг isCover у всех фотографий
        for (const photo of this.photos.values()) {
            photo.isCover = false;
        }

        // Устанавливаем новую обложку
        const photo = this.photos.get(id);
        if (photo) {
            photo.isCover = true;
        }

        this.updateCoverPhoto();
        this.photosUpdated.emit(this.getPhotos());
        this.coverChanged.emit(this._coverPhoto);
    }

    /**
     * Изменение порядка фотографий
     */
    public reorderPhotos(photoIds: string[]): void {
        photoIds.forEach((id, index) => {
            const photo = this.photos.get(id);
            if (photo) {
                photo.sortOrder = index;
            }
        });

        this.photosUpdated.emit(this.getPhotos());
    }

    /**
     * Очистка хранилища
     */
    public clear(): void {
        // Освобождаем все blob URLs
        for (const photo of this.photos.values()) {
            if (photo.url.startsWith('blob:')) {
                URL.revokeObjectURL(photo.url);
            }
        }

        this.photos.clear();
        this._coverPhoto = null;
        this.photosUpdated.emit([]);
        this.coverChanged.emit(null);
    }

    /**
     * Получение следующего порядкового номера
     */
    private getNextSortOrder(): number {
        let maxOrder = -1;
        for (const photo of this.photos.values()) {
            if (photo.sortOrder > maxOrder) {
                maxOrder = photo.sortOrder;
            }
        }
        return maxOrder + 1;
    }

    /**
     * Обновление обложки
     */
    private updateCoverPhoto(): void {
        const photos = this.getPhotos();
        const coverPhoto = photos.find(p => p.isCover) || photos[0] || null;
        
        if (this._coverPhoto !== coverPhoto) {
            this._coverPhoto = coverPhoto;
            this.coverChanged.emit(coverPhoto);
        }
    }

    /**
     * Маппинг статуса PhotoUploadStatus в DisplayPhoto status
     */
    private mapPhotoStatus(status: string): DisplayPhoto['status'] {
        switch (status) {
            case 'pending':
                return 'pending';
            case 'uploading':
                return 'uploading';
            case 'processing':
                return 'processing';
            case 'completed':
                return 'ready';
            case 'error':
                return 'error';
            default:
                return 'pending';
        }
    }

    /**
     * Маппинг серверного статуса в DisplayPhoto status
     */
    private mapServerStatus(status: IListingPhoto['status']): DisplayPhoto['status'] {
        switch (status) {
            case 'UPLOADING':
                return 'uploading';
            case 'PROCESSING':
                return 'processing';
            case 'READY':
                return 'ready';
            case 'FAILED':
                return 'error';
            default:
                return 'error';
        }
    }

    /**
     * Построение URL фотографии
     */
    private buildPhotoUrl(serverPhoto: IListingPhoto): string {
        if (!serverPhoto.variants) {
            return '';
        }

        // Предпочитаем WebP, затем AVIF
        const variant = serverPhoto.variants.webp || serverPhoto.variants.avif;
        if (!variant) {
            return '';
        }

        // Выбираем подходящий размер (предпочитаем w1024 для основного отображения)
        const key = variant.w1024 || variant.w1600 || variant.w512;
        if (!key) {
            return '';
        }

        return `${serverPhoto.cdnBaseUrl}${key}`;
    }

    /**
     * Построение URL миниатюры
     */
    private buildThumbnailUrl(serverPhoto: IListingPhoto): string {
        if (!serverPhoto.variants) {
            return '';
        }

        // Для миниатюр используем самый маленький размер
        const variant = serverPhoto.variants.webp || serverPhoto.variants.avif;
        if (!variant) {
            return '';
        }

        const key = variant.w512 || variant.w1024 || variant.w1600;
        if (!key) {
            return '';
        }

        return `${serverPhoto.cdnBaseUrl}${key}`;
    }
}

// Глобальный экземпляр хранилища (синглтон)
export const listingPhotoStorage = new ListingPhotoStorage();
