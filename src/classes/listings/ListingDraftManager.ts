import { Instance } from "../../core/entity";
import { EventEmitter } from "../../core/event/EventEmmiter";
import { ListingDraft, IListingDraftData } from "./ListingDraft";

export interface IDraftManagerState {
    activeDrafts: Map<string, ListingDraft>;
    currentDraftId: string | null;
}

/**
 * Менеджер для управления несколькими черновиками объявлений
 * Реализован как синглтон для централизованного управления
 */
export class ListingDraftManager {
    private _activeDrafts: Map<string, ListingDraft> = new Map();
    private _currentDraftId: string | null = null;

    // События
    public readonly draftCreated: EventEmitter<ListingDraft>;
    public readonly draftRemoved: EventEmitter<string>;
    public readonly currentDraftChanged: EventEmitter<ListingDraft | null>;

    constructor() {
        this.draftCreated = new EventEmitter('draftCreated');
        this.draftRemoved = new EventEmitter('draftRemoved');
        this.currentDraftChanged = new EventEmitter('currentDraftChanged');
    }

    // Синглтон
    public static get instance(): ListingDraftManager {
        return Instance.getOrCreate<ListingDraftManager>(ListingDraftManager, 'ListingDraftManager');
    }

    // Геттеры
    public get activeDrafts(): ListingDraft[] {
        return Array.from(this._activeDrafts.values());
    }

    public get currentDraft(): ListingDraft | null {
        return this._currentDraftId ? this._activeDrafts.get(this._currentDraftId) || null : null;
    }

    public get activeDraftsCount(): number {
        return this._activeDrafts.size;
    }

    // Создание нового черновика
    public createDraft(initialData?: Partial<IListingDraftData>): ListingDraft {
        const draft = new ListingDraft(initialData);
        const draftId = this._generateDraftId();
        
        this._activeDrafts.set(draftId, draft);
        this._currentDraftId = draftId;

        // Подписываемся на события черновика
        draft.published.subscribe(() => {
            this.removeDraft(draftId);
        });

        this.draftCreated.emit(draft);
        this.currentDraftChanged.emit(draft);
        
        return draft;
    }

    // Загрузка существующего черновика с сервера
    public async loadDraft(serverId: string): Promise<ListingDraft> {
        try {
            const draft = await ListingDraft.loadFromServer(serverId);
            const draftId = this._generateDraftId();
            
            this._activeDrafts.set(draftId, draft);
            this._currentDraftId = draftId;

            // Подписываемся на события черновика
            draft.published.subscribe(() => {
                this.removeDraft(draftId);
            });

            this.draftCreated.emit(draft);
            this.currentDraftChanged.emit(draft);
            
            return draft;
        } catch (error) {
            throw new Error(`Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Переключение на другой черновик
    public switchToDraft(draftId: string): boolean {
        if (this._activeDrafts.has(draftId)) {
            this._currentDraftId = draftId;
            this.currentDraftChanged.emit(this.currentDraft);
            return true;
        }
        return false;
    }

    // Получение черновика по ID
    public getDraft(draftId: string): ListingDraft | null {
        return this._activeDrafts.get(draftId) || null;
    }

    // Удаление черновика
    public removeDraft(draftId: string): boolean {
        const draft = this._activeDrafts.get(draftId);
        if (!draft) return false;

        // Очищаем ресурсы
        draft.dispose();
        this._activeDrafts.delete(draftId);

        // Если удаляем текущий черновик, переключаемся на другой или null
        if (this._currentDraftId === draftId) {
            const remainingDrafts = Array.from(this._activeDrafts.keys());
            this._currentDraftId = remainingDrafts.length > 0 ? remainingDrafts[0] : null;
            this.currentDraftChanged.emit(this.currentDraft);
        }

        this.draftRemoved.emit(draftId);
        return true;
    }

    // Удаление всех черновиков
    public removeAllDrafts(): void {
        const draftIds = Array.from(this._activeDrafts.keys());
        draftIds.forEach(id => this.removeDraft(id));
    }

    // Сохранение всех черновиков
    public async saveAllDrafts(): Promise<void> {
        const savePromises = this.activeDrafts.map(draft => 
            draft.save().catch(error => {
                console.error('Failed to save draft:', error);
                return null;
            })
        );
        
        await Promise.all(savePromises);
    }

    // Получение списка ID активных черновиков
    public getActiveDraftIds(): string[] {
        return Array.from(this._activeDrafts.keys());
    }

    // Проверка наличия незавершенных черновиков
    public hasIncompleteDrafts(): boolean {
        return this.activeDrafts.some(draft => !draft.isComplete);
    }

    // Очистка ресурсов
    public dispose(): void {
        this.removeAllDrafts();
    }

    // метод для генерации ID черновика
    private _generateDraftId(): string {
        return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
