import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingDraft, IListingDraftData, IUpdateListingInfo } from '../../classes/listings/ListingDraft';
import { ListingDraftManager } from '../../classes/listings/ListingDraftManager';
import { ListingType } from '../../api/network/listings';
import { PropertyType } from '@/classes/listings/Listing.types';

export interface UseListingDraftOptions {
    autoSave?: boolean;
    createOnMount?: boolean;
    initialData?: Partial<IListingDraftData>;
}

export interface UseListingDraftReturn {
    // Состояние
    draft: ListingDraft | null;
    data: IListingDraftData;
    saving: boolean;
    saveError: string | null;
    isComplete: boolean;
    
    // Методы обновления данных
    updatePrice: (price: number) => void;
    updateListingType: (type: ListingType) => void;
    updatePropertyType: (type: PropertyType) => void;
    updateBasicInfo: (info: IUpdateListingInfo) => void;
    updatePhotos: (photos: string[]) => void;
    updateUserFields: (fields: Record<string, any>) => void;
    
    // Управление черновиком
    createNewDraft: (initialData?: Partial<IListingDraftData>) => ListingDraft;
    saveDraft: () => Promise<void>;
    publishDraft: () => Promise<void>;
    deleteDraft: () => Promise<void>;
    clearDraft: () => void; // Метод для очистки локального черновика
    forceClearDraft: () => void; // Принудительная очистка через ref
    
    // Управление автосохранением
    enableAutoSave: () => void;
    disableAutoSave: () => void;
}

export function useListingDraft(options: UseListingDraftOptions = {}): UseListingDraftReturn {
    const {
        autoSave = true,
        createOnMount = true,
        initialData = {}
    } = options;

    const [draft, setDraft] = useState<ListingDraft | null>(null);
    const [data, setData] = useState<IListingDraftData>({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    
    const draftManagerRef = useRef(ListingDraftManager.instance);

    // Создание нового черновика
    const createNewDraft = useCallback((draftInitialData?: Partial<IListingDraftData>) => {
        const newDraft = draftManagerRef.current.createDraft(draftInitialData || initialData);
        
        if (!autoSave) {
            newDraft.disableAutoSave();
        }
        
        return newDraft;
    }, [autoSave, initialData]);

    // Подписка на изменения текущего черновика
    useEffect(() => {
        const manager = draftManagerRef.current;
        
        const handleCurrentDraftChanged = (currentDraft: ListingDraft | null) => {
            console.log('handleCurrentDraftChanged', currentDraft);
            
            setDraft(currentDraft);
            if (currentDraft) {
                setData(currentDraft.data);
            } else {
                setData({});
            }
        };

        const handle = manager.currentDraftChanged.subscribe(handleCurrentDraftChanged);
        
        // Устанавливаем текущий черновик при монтировании
        handleCurrentDraftChanged(manager.currentDraft);

        return () => {
            handle.dispose();
        };
    }, []);

    // Создание черновика при монтировании компонента
    useEffect(() => {
        if (createOnMount && !draft) {
            createNewDraft();
        }
    }, [createOnMount, draft, createNewDraft]);

    // Подписка на изменения данных в черновике
    useEffect(() => {
        if (!draft) return;

        const handleDataChanged = (newData: IListingDraftData) => {
            setData(newData);
        };

        const handleSaveStart = () => setSaving(true);
        const handleSaveEnd = () => setSaving(false);
        const handleSaveError = (error: string) => {
            setSaveError(error);
            setSaving(false);
        };

        const dataHandle = draft.dataChanged.subscribe(handleDataChanged);
        const savedHandle = draft.saved.subscribe(handleSaveEnd);
        const errorHandle = draft.errorOccurred.subscribe(handleSaveError);

        // Отслеживаем состояние сохранения
        if (draft.saving !== saving) {
            setSaving(draft.saving);
        }

        return () => {
            dataHandle.dispose();
            savedHandle.dispose();
            errorHandle.dispose();
        };
    }, [draft, saving]);

    /*
    *  Методы обновления данных
    */

    const updatePrice = useCallback((price: number) => {
        draft?.updatePrice(price);
    }, [draft]);

    const updateListingType = useCallback((type: ListingType) => {
        draft?.updateListingType(type);
    }, [draft]);

    const updatePropertyType = useCallback((type: PropertyType) => {
        draft?.updatePropertyType(type);
    }, [draft]);

    const updateBasicInfo = useCallback((info: IUpdateListingInfo) => {
        draft?.updateBasicInfo(info);
    }, [draft]);

    const updatePhotos = useCallback((photos: string[]) => {
        draft?.updatePhotos(photos);
    }, [draft]);

    const updateUserFields = useCallback((fields: Record<string, any>) => {
        draft?.updateUserFields(fields);
    }, [draft]);

    /*
    *  Управление черновиком
    */

    const saveDraft = useCallback(async () => {
        if (!draft) return;
        
        try {
            setSaving(true);
            setSaveError(null);
            await draft.save();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setSaveError(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [draft]);

    const publishDraft = useCallback(async () => {
        if (!draft) return;
        
        try {
            setSaving(true);
            setSaveError(null);
            await draft.publish();
            // После публикации черновик автоматически удаляется из менеджера
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setSaveError(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [draft]);

    const deleteDraft = useCallback(async () => {
        if (!draft) return;
        
        try {
            await draft.delete();
            // Удаляем из менеджера
            const draftIds = draftManagerRef.current.getActiveDraftIds();
            const currentDraftId = draftIds.find(id => 
                draftManagerRef.current.getDraft(id) === draft
            );
            if (currentDraftId) {
                draftManagerRef.current.removeDraft(currentDraftId);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setSaveError(errorMessage);
        }
    }, [draft]);

    const clearDraft = useCallback(() => {
        // Получаем актуальный draft через менеджер
        const currentDraft = draftManagerRef.current.currentDraft;
        console.log('clearDraft', currentDraft);
        
        if (!currentDraft) return;
        
        // Очищаем данные черновика (без обращения к серверу)
        currentDraft.clear();
        
        // Удаляем из менеджера
        const draftIds = draftManagerRef.current.getActiveDraftIds();
        const currentDraftId = draftIds.find(id => 
            draftManagerRef.current.getDraft(id) === currentDraft
        );
        if (currentDraftId) {
            draftManagerRef.current.removeDraft(currentDraftId);
        }
        
        // Очищаем ошибки
        setSaveError(null);
    }, []); // Убираем зависимость от draft, используя ref

    const enableAutoSave = useCallback(() => {
        draft?.enableAutoSave();
    }, [draft]);

    const disableAutoSave = useCallback(() => {
        draft?.disableAutoSave();
    }, [draft]);

    // Принудительная очистка - всегда работает с актуальным состоянием через ref
    const forceClearDraft = useCallback(() => {
        const manager = draftManagerRef.current;
        const currentDraft = manager.currentDraft;
        
        console.log('forceClearDraft', currentDraft);
        
        if (currentDraft) {
            // Очищаем данные черновика
            currentDraft.clear();
            
            // Удаляем из менеджера
            const draftIds = manager.getActiveDraftIds();
            const currentDraftId = draftIds.find(id => 
                manager.getDraft(id) === currentDraft
            );
            if (currentDraftId) {
                manager.removeDraft(currentDraftId);
            }
        }
        
        // Очищаем ошибки в любом случае
        setSaveError(null);
    }, []); // Стабильная функция без зависимостей

    return {
        // Состояние
        draft,
        data,
        saving,
        saveError,
        isComplete: draft?.isComplete || false,
        
        // Методы обновления данных
        updatePrice,
        updateListingType,
        updatePropertyType,
        updateBasicInfo,
        updatePhotos,
        updateUserFields,
        
        // Управление черновиком
        createNewDraft,
        saveDraft,
        publishDraft,
        deleteDraft,
        clearDraft,
        forceClearDraft,
        
        // Управление автосохранением
        enableAutoSave,
        disableAutoSave,
    };
}
