import React, { useState, useCallback } from 'react';
import styles from './PreviewSection.module.sass';
import { IListingDraftData } from '../../../classes/listings/ListingDraft';
import Button from '@/designSystem/button/Button';
import CopyButton from '@/components/CopyButton';
import { IoChevronDown, IoChevronUp, IoCloseOutline, IoSparklesOutline } from 'react-icons/io5';
import { requestGenerateAIDescription, AILocale, AITone, AILength, IAIGenerationResponse } from '@/api/network/listings';
import classNames from 'classnames';

interface PreviewSectionProps {
    data?: IListingDraftData;
    onPublish?: () => void;
    onSaveDraft?: () => void;
    isComplete?: boolean;
    saving?: boolean;
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

    // AI Generation states
    const [generationState, setGenerationState] = useState<GenerationState>('idle');
    const [aiResult, setAiResult] = useState<IAIGenerationResponse | null>(null);
    const [generationError, setGenerationError] = useState<AIGenerationError | null>(null);
    const [showSEOSection, setShowSEOSection] = useState(false);
    
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

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Preview & AI Generation</h1>
            <div className={styles.description}>
                {isBasicMode ? 'Preview of your listing with AI-powered descriptions' : 'Review your listing and generate AI descriptions'}
            </div>

            {/* Basic Preview */}
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

            {/* AI Generation Section */}
            <div className={styles.aiSection}>
                <div className={styles.aiHeader}>
                    <h2 className={styles.sectionTitle}>
                        <IoSparklesOutline className={styles.icon} />
                        AI Description Generator
                    </h2>
                </div>

                {generationState === 'idle' && (
                    <div className={styles.aiForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Language</label>
                            <select 
                                value={settings.locale} 
                                onChange={(e) => setSettings(prev => ({...prev, locale: e.target.value as AILocale}))}
                                className={styles.select}
                            >
                                {localeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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

                        <Button 
                            onClick={handleGenerateAI}
                            className={styles.generateButton}
                            disabled={!data.id}
                        >
                            <IoSparklesOutline />
                            Genera descrizione
                        </Button>

                        {!data.id && (
                            <div className={styles.warning}>
                                Save draft first to enable AI generation
                            </div>
                        )}
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
                                    <span className={styles.charCount}>{aiResult.title.length} characters</span>
                                    <CopyButton text={aiResult.title} size="small" />
                                </div>
                            </div>
                            <div className={styles.blockContent}>
                                <p className={styles.titleText}>{aiResult.title}</p>
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
                                <CopyButton text={aiResult.description} size="small" />
                            </div>
                            <div className={styles.blockContent}>
                                <div className={styles.descriptionText}>
                                    {aiResult.description.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
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

                        {/* Disclaimer */}
                        <div className={styles.disclaimer}>
                            {aiResult.disclaimer}
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

export default PreviewSection;
