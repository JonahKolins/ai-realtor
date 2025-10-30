import React, { useState } from 'react';
import { message } from 'antd';
import styles from './PublishSection.module.sass';
import { IListingDraftData } from '@/classes/listings/ListingDraft';
import { IoCheckmarkCircleOutline, IoEyeOutline, IoShareSocialOutline } from 'react-icons/io5';
import classNames from 'classnames';

export interface PublishSectionProps {
    data: IListingDraftData;
    isLoading?: boolean;
    onPublish?: () => Promise<{ success: boolean; listingId?: string; status?: string }>;
    onGoToListing?: (listingId: string) => void;
}

export const PublishSection: React.FC<PublishSectionProps> = ({
    data,
    isLoading = false,
    onPublish,
    onGoToListing
}) => {
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const handlePublish = async () => {
        if (!onPublish || isPublishing) return;

        try {
            setIsPublishing(true);
            const result = await onPublish();
            
            // Проверяем, действительно ли публикация прошла успешно
            if (result.success && result.status === 'ready') {
                setIsPublished(true);
                message.success('Listing published successfully!');
            } else {
                message.error('Failed to publish listing. Status not changed.');
                console.error('Publish failed - unexpected result:', result);
            }
        } catch (error) {
            console.error('Error publishing listing:', error);
            message.error('Error publishing listing. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleGoToListing = () => {
        if (data.id && onGoToListing) {
            onGoToListing(data.id);
        }
    };

    const isDataComplete = () => {
        return !!(
            data.title &&
            data.description &&
            data.price &&
            data.type &&
            data.propertyType
        );
    };

    if (isPublished) {
        return (
            <div className={styles.container}>
                <div className={styles['success-section']}>
                    <div className={styles['success-icon']}>
                        <IoCheckmarkCircleOutline size={48} />
                    </div>
                    <h2 className={styles['success-title']}>Listing created successfully!</h2>
                    <p className={styles['success-description']}>
                        Your listing has been created and is ready to use.
                    </p>
                    
                    <div className={styles['success-actions']}>
                        <button
                            className={styles['primary-button']}
                            onClick={handleGoToListing}
                            disabled={!data.id}
                        >
                            <IoEyeOutline size={16} />
                            Go to listing
                        </button>
                        
                        <button
                            className={styles['secondary-button']}
                            disabled // Пока не реализовано
                        >
                            <IoShareSocialOutline size={16} />
                            Publish
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Publication of the listing</h2>
                <p className={styles.description}>
                    Check all the data before creating the listing. 
                    After creating you will be able to view it or publish it.
                </p>
            </div>

            {/* Summary of the listing */}
            <div className={styles.summary}>
                <h3>Brief information</h3>
                <div className={styles['summary-grid']}>
                    <div className={styles['summary-item']}>
                        <span className={styles.label}>Title:</span>
                        <span className={styles.value}>
                            {data.title || 'Title not specified'}
                        </span>
                    </div>
                    <div className={styles['summary-item']}>
                        <span className={styles.label}>Price:</span>
                        <span className={styles.value}>
                            {data.price ? `€ ${data.price.toLocaleString()}` : 'Not specified'}
                        </span>
                    </div>
                    <div className={styles['summary-item']}>
                        <span className={styles.label}>Type:</span>
                        <span className={styles.value}>
                            {data.type || 'Not specified'}
                        </span>
                    </div>
                    <div className={styles['summary-item']}>
                        <span className={styles.label}>Property type:</span>
                        <span className={styles.value}>
                            {data.propertyType || 'Not specified'}
                        </span>
                    </div>
                </div>
                
                {data.description && (
                    <div className={styles['summary-description']}>
                        <span className={styles.label}>Description:</span>
                        <p className={styles['description-text']}>
                            {data.description.length > 200 
                                ? `${data.description.substring(0, 200)}...` 
                                : data.description
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Validation warnings */}
            {!isDataComplete() && (
                <div className={styles.warnings}>
                    <h4>Attention</h4>
                    <ul>
                        {!data.title && <li>Title not specified</li>}
                        {!data.description && <li>Description not specified</li>}
                        {!data.price && <li>Price not specified</li>}
                        {!data.type && <li>Type not specified</li>}
                        {!data.propertyType && <li>Property type not specified</li>}
                    </ul>
                </div>
            )}

            {/* Publish button */}
            <div className={styles.actions}>
                <button
                    className={classNames(
                        styles['publish-button'],
                        (!isDataComplete() || isPublishing || isLoading) && styles.disabled
                    )}
                    onClick={handlePublish}
                    disabled={!isDataComplete() || isPublishing || isLoading}
                >
                    {(isPublishing || isLoading) ? (
                        <>
                            <div className={styles.spinner}></div>
                            Creating listing...
                        </>
                    ) : (
                        'Create listing'
                    )}
                </button>
            </div>
        </div>
    );
};
