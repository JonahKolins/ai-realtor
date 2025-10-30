import { PhotoUploadStatus } from '../../services/PhotoUploadService';

export interface PhotoFile {
    id: string;
    file: File;
    preview: string;
    status: PhotoUploadStatus;
    progress: number; // 0-100
    error?: string;
    assetId?: string;
    uploadedPhotoId?: string; // ID из API после завершения загрузки
    canRetry?: boolean; // Можно ли повторить загрузку
}

export interface PhotoUploaderProps {
    listingId?: string; // ID объявления (может быть undefined для новых объявлений)
    onFilesChange?: (files: PhotoFile[]) => void;
    onListingIdChange?: (listingId: string) => void; // Callback для уведомления о создании черновика
    maxFiles?: number;
    maxFileSize?: number; // в байтах
    uploadZoneClassName?: string;
    hidePreview?: boolean;
    allowRetry?: boolean; // Разрешить повторную загрузку неудачных файлов
    showProgress?: boolean; // Показывать прогресс загрузки
}
