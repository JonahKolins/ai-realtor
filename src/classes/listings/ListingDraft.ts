import { EventEmitter } from "../../core/event/EventEmmiter";
import { EventHandle } from "../../core/event/EventHandle";
import { ListingType, ListingStatus, IListing, requestUpdateListing, requestCreateListingDraft, ICreateListingDraftResponse } from "../../api/network/listings";
import { PropertyType } from "@/classes/listings/Listing.types";

export interface IListingDraftData {
    // Основные данные
    type?: ListingType;
    propertyType?: PropertyType;
    title?: string;
    description?: string;
    price?: number;
    // Пользовательские поля
    userFields?: {
        city?: string;
        address?: string;
        floor?: number;
        rooms?: number;
        area?: number;
        balcony?: boolean;
        parking?: boolean;
        extraInfo?: string;
        [key: string]: any;
    };
    // Медиа файлы
    photos?: string[];
    documents?: string[];
}

export interface IDraftApiResponse {
    id: string;
    status: ListingStatus;
    data: IListingDraftData;
    createdAt: string;
    updatedAt: string;
}

export class ListingDraft {
    private _id: string | null = null;
    private _data: IListingDraftData = {};
    private _saving: boolean = false;
    private _saveError: string | null = null;
    private _autoSaveEnabled: boolean = true;
    private _autoSaveTimeout: NodeJS.Timeout | null = null;

    // События
    public readonly dataChanged: EventEmitter<IListingDraftData>;
    public readonly saved: EventEmitter<IDraftApiResponse>;
    public readonly published: EventEmitter<IListing>;
    public readonly errorOccurred: EventEmitter<string>;

    constructor(initialData: Partial<IListingDraftData> = {}) {
        this._data = { ...initialData };
        
        // Инициализация событий
        this.dataChanged = new EventEmitter('dataChanged');
        this.saved = new EventEmitter('saved');
        this.published = new EventEmitter('published');
        this.errorOccurred = new EventEmitter('errorOccurred');
    }

    /*
    *  Геттеры
    */

    public get id(): string | null {
        return this._id;
    }

    public get data(): IListingDraftData {
        return { ...this._data };
    }

    public get saving(): boolean {
        return this._saving;
    }

    public get saveError(): string | null {
        return this._saveError;
    }

    public get isComplete(): boolean {
        return !!(
            this._data.type &&
            this._data.propertyType &&
            this._data.title &&
            this._data.description &&
            this._data.price &&
            this._data.photos?.length
        );
    }

    public get autoSaveEnabled(): boolean {
        return this._autoSaveEnabled;
    }

    /*
    *  Методы для обновления данных
    */
    
    public updateListingType(type: ListingType): void {
        this._data.type = type;
        this._emitDataChanged();
        this._scheduleAutoSave();
    }

    public updatePropertyType(propertyType: PropertyType): void {
        this._data.propertyType = propertyType;
        this._emitDataChanged();
        this._scheduleAutoSave();
    }

    public updateBasicInfo(info: { title?: string; description?: string; price?: number }): void {
        Object.assign(this._data, info);
        this._emitDataChanged();
        this._scheduleAutoSave();
    }

    public updatePhotos(photos: string[]): void {
        this._data.photos = [...photos];
        this._emitDataChanged();
        this._scheduleAutoSave();
    }

    public updateUserFields(fields: Record<string, any>): void {
        this._data.userFields = { ...this._data.userFields, ...fields };
        this._emitDataChanged();
        this._scheduleAutoSave();
    }

    /*
    *  Управление автосохранением
    */

    public enableAutoSave(): void {
        this._autoSaveEnabled = true;
    }

    public disableAutoSave(): void {
        this._autoSaveEnabled = false;
        if (this._autoSaveTimeout) {
            clearTimeout(this._autoSaveTimeout);
            this._autoSaveTimeout = null;
        }
    }

    /*
    *  Методы для работы с сервером
    */

    // Метод для сохранения данных
    public async save(): Promise<IDraftApiResponse> {
        if (this._saving) {
            throw new Error('Already saving');
        }

        this._saving = true;
        this._saveError = null;

        try {
            // TODO: Реализовать API запрос для сохранения черновика
            const response = await this._saveDraftToServer();
            
            if (!this._id) {
                this._id = response.id;
            }
            
            this.saved.emit(response);
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this._saveError = errorMessage;
            this.errorOccurred.emit(errorMessage);
            throw error;
        } finally {
            this._saving = false;
        }
    }

    // Метод для публикации данных
    public async publish(): Promise<IListing> {
        if (!this.isComplete) {
            throw new Error('Draft is not complete. Cannot publish.');
        }

        // Сначала сохраняем черновик
        await this.save();

        try {
            // TODO: Реализовать API запрос для публикации
            const publishedListing = await this._publishDraftToServer();
            this.published.emit(publishedListing);
            return publishedListing;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish';
            this.errorOccurred.emit(errorMessage);
            throw error;
        }
    }

    
    // Метод для удаления данных
    public async delete(): Promise<void> {
        if (!this._id) {
            return; // Нечего удалять
        }

        try {
            // TODO: Реализовать API запрос для удаления черновика
            await this._deleteDraftFromServer();
            this._id = null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete';
            this.errorOccurred.emit(errorMessage);
            throw error;
        }
    }

    // Метод для очистки локального черновика (не сохраненного на сервере)
    public clear(): void {
        // Останавливаем автосохранение
        this.disableAutoSave();
        
        // Очищаем данные
        this._data = {};
        this._id = null;
        this._saving = false;
        this._saveError = null;
        
        // Уведомляем об изменении данных
        this._emitDataChanged();
    }

    // Статический метод для загрузки существующего черновика
    public static async loadFromServer(draftId: string): Promise<ListingDraft> {
        try {
            // TODO: Реализовать API запрос для загрузки черновика
            const draftData = await ListingDraft._loadDraftFromServer(draftId);
            
            const draft = new ListingDraft(draftData.data);
            draft._id = draftData.id;
            
            return draft;
        } catch (error) {
            throw new Error(`Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Очистка ресурсов
    public dispose(): void {
        this.disableAutoSave();
        // EventEmitter не имеет метода dispose в данной реализации
        // Подписчики должны сами вызывать handle.dispose()
    }

    /*
    *  Приватные методы
    */

    private _emitDataChanged(): void {
        this.dataChanged.emit(this.data);
    }

    private _scheduleAutoSave(): void {
        if (!this._autoSaveEnabled) return;

        if (this._autoSaveTimeout) {
            clearTimeout(this._autoSaveTimeout);
        }

        this._autoSaveTimeout = setTimeout(() => {
            this.save().catch(error => {
                console.warn('Auto-save failed:', error);
            });
        }, 2000); // Автосохранение через 2 секунды после последнего изменения
    }

    private async _saveDraftToServer(): Promise<IDraftApiResponse> {
        if (!this._id) {
            // Создаем новый черновик
            if (!this._data.type || !this._data.propertyType) {
                throw new Error('Type and propertyType are required for creating a new draft');
            }
            
            const response = await requestCreateListingDraft({
                type: this._data.type,
                propertyType: this._data.propertyType
            });
            
            return response;
        } else {
            // Обновляем существующий черновик
            const updateData: any = {};
            
            if (this._data.title !== undefined) updateData.title = this._data.title;
            if (this._data.price !== undefined) updateData.price = this._data.price;
            if (this._data.type !== undefined) updateData.type = this._data.type;
            if (this._data.propertyType !== undefined) updateData.propertyType = this._data.propertyType;
            if (this._data.userFields !== undefined) updateData.userFields = this._data.userFields;
            
            // Статус остается draft при обновлении
            updateData.status = 'draft' as ListingStatus;
            
            const response = await requestUpdateListing({
                id: this._id,
                ...updateData
            });
            
            // Преобразуем IListing в IDraftApiResponse
            const draftResponse: IDraftApiResponse = {
                id: response.id,
                status: response.status,
                data: {
                    type: response.type,
                    propertyType: this._data.propertyType,
                    title: response.title,
                    description: this._data.description,
                    price: response.price,
                    userFields: response.userFields,
                    photos: this._data.photos,
                    documents: this._data.documents
                },
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            };
            
            return draftResponse;
        }
    }

    private async _publishDraftToServer(): Promise<IListing> {
        if (!this._id) {
            throw new Error('Cannot publish: draft has no ID');
        }
        
        // Изменяем статус на 'ready' для публикации
        const response = await requestUpdateListing({
            id: this._id,
            status: 'ready' as ListingStatus
        });
        
        return response;
    }

    private async _deleteDraftFromServer(): Promise<void> {
        if (!this._id) {
            return; // Нечего удалять
        }
        
        // Изменяем статус на 'archived' вместо физического удаления
        await requestUpdateListing({
            id: this._id,
            status: 'archived' as ListingStatus
        });
    }

    private static async _loadDraftFromServer(draftId: string): Promise<IDraftApiResponse> {
        // TODO: Реализовать загрузку конкретного черновика
        // Можно использовать requestListings с фильтром по ID
        throw new Error('Loading specific draft not implemented yet');
    }
}