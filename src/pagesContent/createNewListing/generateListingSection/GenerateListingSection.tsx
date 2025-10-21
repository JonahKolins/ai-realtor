import React, { useState, useCallback, useEffect } from 'react';
import styles from './GenerateListingSection.module.sass';
import { IListingDraftData, IUpdateListingInfo } from '../../../classes/listings/ListingDraft';
import Button from '@/designSystem/button/Button';
import CopyButton from '@/components/CopyButton';
import { IoChevronDown, IoChevronUp, IoCloseOutline, IoSparklesOutline, IoCreateOutline, IoSaveOutline, IoAddOutline } from 'react-icons/io5';
import { requestGenerateAIDescription, AILocale, AITone, AILength, IAIGenerationResponse } from '@/api/network/listings';
import { IPropertyDetails } from '@/classes/listings/propertyDetails';
import classNames from 'classnames';
import { Select, Input } from 'antd';

const { TextArea } = Input;

interface GenerateListingSectionProps {
    data?: IListingDraftData;
    isLoading: boolean;
    onPublish?: () => void;
    updateInfo: (info: IUpdateListingInfo) => void;
    updateUserFields?: (fields: Record<string, any>) => void;
    saveDraft: () => void;
    saveError?: string | null;
}

type GenerationState = 'idle' | 'loading' | 'success' | 'error';

interface AIGenerationSettings {
    locale: AILocale;
    tone: AITone;
    length: AILength;
}

interface AIGenerationError {
    code: string;
    message: string;
    retryAfter?: number;
}

export const GenerateListingSection: React.FC<GenerateListingSectionProps> = ({
    data = {},
    isLoading,
    onPublish,
    updateInfo,
    updateUserFields,
    saveDraft,
    saveError = null
}) => {
    // Если нет обработчиков, показываем базовый превью
    const isBasicMode = !onPublish && !updateInfo;

    // AI Generation states
    const [generationState, setGenerationState] = useState<GenerationState>('idle');
    const [aiResult, setAiResult] = useState<IAIGenerationResponse | null>(null);
    const [generationError, setGenerationError] = useState<AIGenerationError | null>(null);
    const [showSEOSection, setShowSEOSection] = useState(false);
    
    // Editing states
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    
    // AI wishes state
    const [showWishesForm, setShowWishesForm] = useState(false);
    const [aiWishes, setAiWishes] = useState(data.userFields?.aiGenerationWishes || '');
    
    // Синхронизируем пожелания при изменении данных
    useEffect(() => {
        if (data.userFields?.aiGenerationWishes !== undefined) {
            setAiWishes(data.userFields.aiGenerationWishes);
        }
    }, [data.userFields?.aiGenerationWishes]);
    
    // AI Generation settings
    const [settings, setSettings] = useState<AIGenerationSettings>({
        locale: 'it-IT',
        tone: 'professionale',
        length: 'medium'
    });

    // Locale options
    const localeOptions = [
        { value: 'it-IT' as AILocale, label: 'Italiano' },
        { value: 'ru-RU' as AILocale, label: 'Русский' },
        { value: 'en-US' as AILocale, label: 'English' }
    ];

    // Tone options
    const toneOptions = [
        { value: 'professionale' as AITone, label: 'Professionale' },
        { value: 'informale' as AITone, label: 'Informale' },
        { value: 'premium' as AITone, label: 'Premium' }
    ];

    // Length options
    const lengthOptions = [
        { value: 'short' as AILength, label: 'Breve' },
        { value: 'medium' as AILength, label: 'Medio' },
        { value: 'long' as AILength, label: 'Dettagliato' }
    ];

    // AI Generation handlers
    const handleGenerateAI = useCallback(async () => {
        if (!data.id) {
            setGenerationError({
                code: 'NO_LISTING_ID',
                message: 'Listing ID is required for AI generation'
            });
            return;
        }

        setGenerationState('loading');
        setGenerationError(null);

        try {
            const result = await requestGenerateAIDescription({
                listingId: data.id,
                ...settings
            });

            setAiResult(result);
            setGenerationState('success');
        } catch (error: any) {
            console.error('AI generation error:', error);
            
            let generationError: AIGenerationError = {
                code: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred'
            };

            // Handle specific error types
            if (error.response) {
                const { status, data: errorData } = error.response;
                
                switch (status) {
                    case 400:
                        generationError = {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid parameters provided'
                        };
                        break;
                    case 404:
                        generationError = {
                            code: 'LISTING_NOT_FOUND',
                            message: 'Listing not found'
                        };
                        break;
                    case 429:
                        generationError = {
                            code: 'RATE_LIMIT_EXCEEDED',
                            message: 'Too many requests. Please try again later.',
                            retryAfter: errorData?.retryAfter || 60
                        };
                        break;
                    case 502:
                        generationError = {
                            code: 'AI_PROVIDER_ERROR',
                            message: 'AI service is temporarily unavailable. Please try again later.'
                        };
                        break;
                    case 500:
                        generationError = {
                            code: 'SERVER_ERROR',
                            message: 'Internal server error. Please try again later.'
                        };
                        break;
                    default:
                        generationError = {
                            code: 'UNKNOWN_ERROR',
                            message: `Error: ${status}`
                        };
                }
            }

            setGenerationError(generationError);
            setGenerationState('error');
        }
    }, [data.id, settings]);

    const handleCancelGeneration = useCallback(() => {
        setGenerationState('idle');
        setGenerationError(null);
    }, []);

    const handleResetGeneration = useCallback(() => {
        setGenerationState('idle');
        setAiResult(null);
        setGenerationError(null);
    }, []);

    const handleCopyAll = useCallback(() => {
        if (!aiResult) return;
        
        const fullText = [
            `Title: ${aiResult.title}`,
            `Summary: ${aiResult.summary}`,
            `Description: ${aiResult.description}`,
            `Highlights: ${aiResult.highlights.join(', ')}`,
            `Keywords: ${aiResult.seo.keywords.join(', ')}`,
            `Meta Description: ${aiResult.seo.metaDescription}`,
            `Disclaimer: ${aiResult.disclaimer}`
        ].join('\n\n');

        navigator.clipboard.writeText(fullText);
    }, [aiResult]);

    const handleSaveInfo = useCallback(() => {
        if (updateInfo && aiResult) {
            updateInfo({
                title: aiResult.title,
                summary: aiResult.summary,
                description: aiResult.description,
                highlights: aiResult.highlights,
                keywords: aiResult.seo.keywords,
                metaDescription: aiResult.seo.metaDescription
            });
            saveDraft();
        }
    }, [updateInfo, aiResult]);

    // Editing handlers
    const handleEditTitle = useCallback(() => {
        if (aiResult) {
            setEditedTitle(aiResult.title);
            setIsEditingTitle(true);
        }
    }, [aiResult]);

    const handleSaveTitle = useCallback(() => {
        if (updateInfo && aiResult) {
            const updatedResult = { ...aiResult, title: editedTitle };
            setAiResult(updatedResult);
            updateInfo({
                title: editedTitle
            });
            setIsEditingTitle(false);
            saveDraft();
        }
    }, [updateInfo, aiResult, editedTitle, saveDraft]);

    const handleCancelEditTitle = useCallback(() => {
        setIsEditingTitle(false);
        setEditedTitle('');
    }, []);

    const handleEditDescription = useCallback(() => {
        if (aiResult) {
            setEditedDescription(aiResult.description);
            setIsEditingDescription(true);
        }
    }, [aiResult]);

    const handleSaveDescription = useCallback(() => {
        if (updateInfo && aiResult) {
            const updatedResult = { ...aiResult, description: editedDescription };
            setAiResult(updatedResult);
            updateInfo({
                description: editedDescription
            });
            setIsEditingDescription(false);
            saveDraft();
        }
    }, [updateInfo, aiResult, editedDescription, saveDraft]);

    const handleCancelEditDescription = useCallback(() => {
        setIsEditingDescription(false);
        setEditedDescription('');
    }, []);

    // AI wishes handlers
    const handleShowWishesForm = useCallback(() => {
        setShowWishesForm(true);
    }, []);

    const handleSaveWishes = useCallback(() => {
        if (updateUserFields) {
            updateUserFields({ aiGenerationWishes: aiWishes });
            saveDraft();
        }
        setShowWishesForm(false);
    }, [updateUserFields, aiWishes, saveDraft]);

    const handleCancelWishes = useCallback(() => {
        setAiWishes(data.userFields?.aiGenerationWishes || '');
        setShowWishesForm(false);
    }, [data.userFields?.aiGenerationWishes]);

    const handleGenerateWithWishes = useCallback(async () => {
        if (!data.id) {
            setGenerationError({
                code: 'NO_LISTING_ID',
                message: 'Listing ID is required for AI generation'
            });
            return;
        }

        // Сначала сохраняем пожелания
        if (updateUserFields && aiWishes.trim()) {
            updateUserFields({ aiGenerationWishes: aiWishes });
        }

        setGenerationState('loading');
        setGenerationError(null);

        try {
            const result = await requestGenerateAIDescription({
                listingId: data.id,
                ...settings
            });

            setAiResult(result);
            setGenerationState('success');
            setShowWishesForm(false);
        } catch (error: any) {
            console.error('AI generation error:', error);
            
            let generationError: AIGenerationError = {
                code: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred'
            };

            // Handle specific error types (same as original handleGenerateAI)
            if (error.response) {
                const { status, data: errorData } = error.response;
                
                switch (status) {
                    case 400:
                        generationError = {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid parameters provided'
                        };
                        break;
                    case 404:
                        generationError = {
                            code: 'LISTING_NOT_FOUND',
                            message: 'Listing not found'
                        };
                        break;
                    case 429:
                        generationError = {
                            code: 'RATE_LIMIT_EXCEEDED',
                            message: 'Too many requests. Please try again later.',
                            retryAfter: errorData?.retryAfter || 60
                        };
                        break;
                    case 502:
                        generationError = {
                            code: 'AI_PROVIDER_ERROR',
                            message: 'AI service is temporarily unavailable. Please try again later.'
                        };
                        break;
                    case 500:
                        generationError = {
                            code: 'SERVER_ERROR',
                            message: 'Internal server error. Please try again later.'
                        };
                        break;
                    default:
                        generationError = {
                            code: 'UNKNOWN_ERROR',
                            message: `Error: ${status}`
                        };
                }
            }

            setGenerationError(generationError);
            setGenerationState('error');
        }
    }, [data.id, settings, aiWishes, updateUserFields]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Generate listing</h1>
            {/* AI Generation Section */}
            <div className={styles.aiSection}>
                <div className={styles.aiHeader}>
                    <h2 className={styles.sectionTitle}>
                        <IoSparklesOutline className={styles.icon} />
                        AI Description Generator
                    </h2>
                </div>
                <div>{isLoading && 'Loading...'}</div>

                {generationState === 'idle' && (
                    <div className={styles.aiForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Language</label>
                            <Select
                                options={localeOptions}
                                value={settings.locale}
                                onChange={(value) => setSettings(prev => ({...prev, locale: value as AILocale}))}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tone</label>
                            <div className={styles.radioGroup}>
                                {toneOptions.map(option => (
                                    <label key={option.value} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="tone"
                                            value={option.value}
                                            checked={settings.tone === option.value}
                                            onChange={(e) => setSettings(prev => ({...prev, tone: e.target.value as AITone}))}
                                            className={styles.radio}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Length</label>
                            <div className={styles.radioGroup}>
                                {lengthOptions.map(option => (
                                    <label key={option.value} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="length"
                                            value={option.value}
                                            checked={settings.length === option.value}
                                            onChange={(e) => setSettings(prev => ({...prev, length: e.target.value as AILength}))}
                                            className={styles.radio}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {!data.id && (
                            <div className={styles.warning}>
                                Save draft first to enable AI generation
                            </div>
                        )}
                        <div className={styles.generateButtonContainer}>
                            <Button 
                                onClick={handleGenerateAI}
                                className={classNames(styles.generateButton, !data.id && styles._disabled)}
                                disabled={!data.id}
                            >
                                <IoSparklesOutline />
                                Generate listing content
                            </Button>
                        </div>
                    </div>
                )}

                {generationState === 'loading' && (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>Generazione in corso...</p>
                        <p className={styles.loadingSubtext}>This may take 3-10 seconds</p>
                        <Button 
                            onClick={handleCancelGeneration}
                            className={styles.cancelButton}
                        >
                            <IoCloseOutline />
                            Cancel
                        </Button>
                    </div>
                )}

                {generationState === 'error' && generationError && (
                    <div className={styles.errorState}>
                        <div className={styles.errorMessage}>
                            <strong>Error:</strong> {generationError.message}
                        </div>
                        {generationError.retryAfter && (
                            <div className={styles.retryInfo}>
                                Please retry after {generationError.retryAfter} seconds
                            </div>
                        )}
                        <div className={styles.errorActions}>
                            <Button onClick={handleGenerateAI} className={styles.retryButton}>
                                Try Again
                            </Button>
                            <Button onClick={handleResetGeneration} className={styles.resetButton}>
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

                {generationState === 'success' && aiResult && (
                    <div className={styles.aiResult}>
                        <div className={styles.resultHeader}>
                            <h3 className={styles.resultTitle}>Generated Description</h3>
                            <div className={styles.resultActions}>
                                <button 
                                    onClick={handleCopyAll} 
                                    className={styles.copyAllButton}
                                >
                                    Copy All
                                </button>
                                <Button onClick={handleShowWishesForm} className={styles.wishesButton}>
                                    <IoAddOutline />
                                    Generate with Wishes
                                </Button>
                                <Button onClick={handleResetGeneration} className={styles.newGenerationButton}>
                                    Generate New
                                </Button>
                            </div>
                        </div>

                        {/* Title */}
                        <div className={styles.resultBlock}>
                            <div className={styles.blockHeader}>
                                <h4 className={styles.blockTitle}>Title</h4>
                                <div className={styles.blockMeta}>
                                    <span className={styles.charCount}>{isEditingTitle ? editedTitle.length : aiResult.title.length} characters</span>
                                    {!isEditingTitle && (
                                        <button 
                                            onClick={handleEditTitle}
                                            className={styles.editButton}
                                            title="Edit title"
                                        >
                                            <IoCreateOutline />
                                        </button>
                                    )}
                                    <CopyButton text={isEditingTitle ? editedTitle : aiResult.title} size="small" />
                                </div>
                            </div>
                            <div className={styles.blockContent}>
                                {isEditingTitle ? (
                                    <div className={styles.editingContainer}>
                                        <Input
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            className={styles.editInput}
                                            autoFocus
                                        />
                                        <div className={styles.editActions}>
                                            <button 
                                                onClick={handleSaveTitle}
                                                className={styles.saveButton}
                                                title="Save changes"
                                            >
                                                <IoSaveOutline />
                                                Save
                                            </button>
                                            <button 
                                                onClick={handleCancelEditTitle}
                                                className={styles.cancelButton}
                                                title="Cancel editing"
                                            >
                                                <IoCloseOutline />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.titleText}>{aiResult.title}</p>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className={styles.resultBlock}>
                            <div className={styles.blockHeader}>
                                <h4 className={styles.blockTitle}>Summary</h4>
                                <CopyButton text={aiResult.summary} size="small" />
                            </div>
                            <div className={classNames(styles.blockContent, styles.summaryContent)}>
                                <p>{aiResult.summary}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className={styles.resultBlock}>
                            <div className={styles.blockHeader}>
                                <h4 className={styles.blockTitle}>Full Description</h4>
                                <div className={styles.blockMeta}>
                                    {!isEditingDescription && (
                                        <button 
                                            onClick={handleEditDescription}
                                            className={styles.editButton}
                                            title="Edit description"
                                        >
                                            <IoCreateOutline />
                                        </button>
                                    )}
                                    <CopyButton text={isEditingDescription ? editedDescription : aiResult.description} size="small" />
                                </div>
                            </div>
                            <div className={styles.blockContent}>
                                {isEditingDescription ? (
                                    <div className={styles.editingContainer}>
                                        <TextArea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            className={styles.editTextArea}
                                            rows={6}
                                            autoFocus
                                        />
                                        <div className={styles.editActions}>
                                            <button 
                                                onClick={handleSaveDescription}
                                                className={styles.saveButton}
                                                title="Save changes"
                                            >
                                                <IoSaveOutline />
                                                Save
                                            </button>
                                            <button 
                                                onClick={handleCancelEditDescription}
                                                className={styles.cancelButton}
                                                title="Cancel editing"
                                            >
                                                <IoCloseOutline />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.descriptionText}>
                                        {aiResult.description.split('\n').map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className={styles.resultBlock}>
                            <div className={styles.blockHeader}>
                                <h4 className={styles.blockTitle}>Highlights</h4>
                                <CopyButton text={aiResult.highlights.join(', ')} size="small" />
                            </div>
                            <div className={styles.blockContent}>
                                <div className={styles.highlightsList}>
                                    {aiResult.highlights.map((highlight, index) => (
                                        <div key={index} className={styles.highlightChip}>
                                            {highlight}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className={styles.resultBlock}>
                            <div 
                                className={styles.blockHeader}
                                onClick={() => setShowSEOSection(!showSEOSection)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h4 className={styles.blockTitle}>
                                    SEO Data
                                    {showSEOSection ? <IoChevronUp /> : <IoChevronDown />}
                                </h4>
                            </div>
                            
                            {showSEOSection && (
                                <div className={styles.blockContent}>
                                    <div className={styles.seoBlock}>
                                        <div className={styles.seoHeader}>
                                            <span className={styles.seoLabel}>Keywords</span>
                                            <CopyButton text={aiResult.seo.keywords.join(', ')} size="small" />
                                        </div>
                                        <div className={styles.keywordsList}>
                                            {aiResult.seo.keywords.map((keyword, index) => (
                                                <div key={index} className={styles.keywordTag}>
                                                    {keyword}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.seoBlock}>
                                        <div className={styles.seoHeader}>
                                            <span className={styles.seoLabel}>Meta Description</span>
                                            <CopyButton text={aiResult.seo.metaDescription} size="small" />
                                        </div>
                                        <p className={styles.metaDescription}>{aiResult.seo.metaDescription}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.resultBlock}>
                            <div className={styles.blockContent}>
                                <Button onClick={handleSaveInfo} className={styles.saveAllButton}>
                                    Save All
                                </Button>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className={styles.disclaimer}>
                            {aiResult.disclaimer}
                        </div>
                    </div>
                )}

                {/* AI Wishes Form */}
                {showWishesForm && (
                    <div className={styles.wishesForm}>
                        <div className={styles.wishesHeader}>
                            <h3 className={styles.wishesTitle}>
                                <IoAddOutline className={styles.icon} />
                                Add Your Wishes for New Generation
                            </h3>
                            <p className={styles.wishesSubtitle}>
                                Tell AI what you'd like to see different or emphasize in the new description
                            </p>
                        </div>
                        
                        <div className={styles.wishesContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    Your wishes and preferences:
                                </label>
                                <TextArea
                                    value={aiWishes}
                                    onChange={(e) => setAiWishes(e.target.value)}
                                    placeholder="Example: Emphasize the modern renovations, mention the quiet neighborhood, add more details about natural light, etc."
                                    rows={4}
                                    className={styles.wishesTextArea}
                                />
                            </div>
                            
                            {data.userFields?.aiGenerationWishes && (
                                <div className={styles.savedWishes}>
                                    <span className={styles.savedWishesLabel}>Previous wishes:</span>
                                    <span className={styles.savedWishesText}>"{data.userFields.aiGenerationWishes}"</span>
                                </div>
                            )}
                            
                            <div className={styles.wishesActions}>
                                <Button 
                                    onClick={handleGenerateWithWishes}
                                    className={styles.generateWithWishesButton}
                                    disabled={!data.id}
                                >
                                    <IoSparklesOutline />
                                    Generate with Wishes
                                </Button>
                                <Button 
                                    onClick={handleSaveWishes}
                                    className={styles.saveWishesButton}
                                >
                                    <IoSaveOutline />
                                    Save Wishes Only
                                </Button>
                                <button 
                                    onClick={handleCancelWishes}
                                    className={styles.cancelWishesButton}
                                >
                                    <IoCloseOutline />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {saveError && (
                <div className={styles.error}>
                    Error: {saveError}
                </div>
            )}

            {!isBasicMode && (
                <>
                    <div className={styles.actions}>
                        {/* Removed save/publish buttons as requested */}
                    </div>
                </>
            )}
        </div>
    );
};
