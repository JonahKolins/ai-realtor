import React from 'react';
import styles from './PreviewSection.module.sass';
import { IListingDraftData } from '../../../classes/listings/ListingDraft';
import Button from '@/designSystem/button/Button';

interface PreviewSectionProps {
    data?: IListingDraftData;
    onPublish?: () => void;
    onSaveDraft?: () => void;
    isComplete?: boolean;
    saving?: boolean;
    saveError?: string | null;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
    data = {},
    onPublish,
    onSaveDraft,
    isComplete = false,
    saving = false,
    saveError = null
}) => {
    // Если нет обработчиков, показываем базовый превью
    const isBasicMode = !onPublish && !onSaveDraft;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Preview</h1>
            <div className={styles.description}>
                {isBasicMode ? 'Preview of your listing' : 'Review your listing before publishing'}
            </div>

            <div className={styles.preview}>
                <div className={styles.field}>
                    <label className={styles.label}>Type:</label>
                    <span className={styles.value}>{data.type || 'Not selected'}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Property Type:</label>
                    <span className={styles.value}>{data.propertyType || 'Not selected'}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Title:</label>
                    <span className={styles.value}>{data.title || 'Not specified'}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Description:</label>
                    <span className={styles.value}>{data.description || 'Not specified'}</span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Price:</label>
                    <span className={styles.value}>
                        {data.price ? `$${data.price.toLocaleString()}` : 'Not specified'}
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Photos:</label>
                    <span className={styles.value}>
                        {data.photos?.length ? `${data.photos.length} photo(s)` : 'No photos'}
                    </span>
                </div>
            </div>

            {saveError && (
                <div className={styles.error}>
                    Error: {saveError}
                </div>
            )}

            {!isBasicMode && (
                <>
                    <div className={styles.actions}>
                        <Button 
                            onClick={onSaveDraft}
                            disabled={saving}
                            className={styles.saveButton}
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </Button>

                        <Button 
                            onClick={onPublish}
                            disabled={!isComplete || saving}
                            className={styles.publishButton}
                        >
                            {saving ? 'Publishing...' : 'Publish Listing'}
                        </Button>
                    </div>

                    {!isComplete && (
                        <div className={styles.warning}>
                            Please complete all required fields before publishing
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PreviewSection;
