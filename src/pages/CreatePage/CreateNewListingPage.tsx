import React, { useEffect, useState } from 'react';
import { useListingDraft } from '@/core/hooks/useListingDraft';
import { IUpdateListingInfo } from '@/classes/listings/ListingDraft';
import { ListingPreview } from '@/pagesContent/createNewListing/listingPreview/ListingPreview';
import { CreateListingPropertyDetails } from '@/pagesContent/createNewListing/createListingPropertyDetails/CreateListingPropertyDetails';
import { CreateListingDetails } from '@/pagesContent/createNewListing/createListingData/CreateListingDetails';
import { GenerateListingSection } from '@/pagesContent/createNewListing/generateListingSection/GenerateListingSection';
import { IoCheckmarkCircleOutline, IoChevronForward } from 'react-icons/io5';
import styles from './CreateNewListingPage.module.sass';
import classNames from 'classnames';

enum NavigationItemAlias {
    LISTING = 'listing',
    DETAILS = 'details',
    GENERATE = 'generate',
    PREVIEW = 'preview',
    PUBLISH = 'publish',
}

interface StepInfo {
    key: NavigationItemAlias;
    title: string;
    isCompleted: boolean;
    isActive: boolean;
}



const CreateNewListingPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<NavigationItemAlias>(NavigationItemAlias.LISTING);

    const {draft, data, saving, updateListingType, updatePropertyType, updateUserFields, updateBasicInfo, updatePrice, saveDraft, forceClearDraft} = useListingDraft({
        autoSave: true,
        createOnMount: true,
        initialData: {}
    });

    useEffect(() => {
        return () => {
            // очищаем черновик при размонтировании компонента
            // используем forceClearDraft для гарантированной очистки
            forceClearDraft();
        }
    }, [forceClearDraft])

    // обработка изменений деталей недвижимости
    const handleDetailsChange = (details: any, changedFields: Set<string>) => {
        console.log('Details changed:', details, Array.from(changedFields));
        
        // Сохраняем только измененные поля в userFields
        const changedData: any = {};
        changedFields.forEach(field => {
            changedData[field] = details[field];
        });
        
        // Обновляем userFields в черновике
        updateUserFields(changedData);
    };

    // обработка изменений основных данных
    const handleUpdateBasicInfo = (info: IUpdateListingInfo) => {
        console.log('Basic info changed:', info);
        updateBasicInfo(info);
    }

    // проверка готовности шага "Listing details"
    const isListingDetailsCompleted = (): boolean => {
        return !!data?.type;
    };

    // проверка готовности шага "Property details"
    const isPropertyDetailsCompleted = (): boolean => {
        if (!data?.userFields) return false;
        // Проверяем ключевые поля из "Area and layout"
        const requiredFields = ['area', 'rooms', 'floor']; // Примерные поля
        return requiredFields.some(field => data.userFields[field] != null && data.userFields[field] !== '');
    };

    // проверка готовности шага "Generate"
    const isGenerateCompleted = (): boolean => {
        return !!(data?.title || data?.description || data?.summary);
    };

    // получение информации о всех шагах
    const getStepsInfo = (): StepInfo[] => {
        return [
            {
                key: NavigationItemAlias.LISTING,
                title: 'Listing details',
                isCompleted: isListingDetailsCompleted(),
                isActive: currentStep === NavigationItemAlias.LISTING
            },
            {
                key: NavigationItemAlias.DETAILS,
                title: 'Property details',
                isCompleted: isPropertyDetailsCompleted(),
                isActive: currentStep === NavigationItemAlias.DETAILS
            },
            {
                key: NavigationItemAlias.GENERATE,
                title: 'Generate',
                isCompleted: isGenerateCompleted(),
                isActive: currentStep === NavigationItemAlias.GENERATE
            },
            {
                key: NavigationItemAlias.PREVIEW,
                title: 'Preview',
                isCompleted: false, // Всегда доступен без проверки
                isActive: currentStep === NavigationItemAlias.PREVIEW
            },
            {
                key: NavigationItemAlias.PUBLISH,
                title: 'Publish',
                isCompleted: false, // Всегда доступен без проверки
                isActive: currentStep === NavigationItemAlias.PUBLISH
            }
        ];
    };

    // переход к следующему шагу
    const goToNextStep = () => {
        const steps = Object.values(NavigationItemAlias);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    // переход к конкретному шагу
    const goToStep = (step: NavigationItemAlias) => {
        setCurrentStep(step);
    };


    const renderCurrentStepContent = () => {
        switch (currentStep) {
            case NavigationItemAlias.LISTING:
                return (
                    <div>
                        <CreateListingDetails
                            data={data}
                            onListingTypeChange={updateListingType}
                            onPriceChange={updatePrice} 
                            onPhotosChange={() => {}}
                        />
                        <div className={styles['step-actions']}>
                            <button 
                                className={styles['next-button']}
                                onClick={goToNextStep}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            case NavigationItemAlias.DETAILS:
                return (
                    <div>
                        <CreateListingPropertyDetails 
                            data={data} 
                            updatePropertyType={updatePropertyType} 
                            onDetailsChange={handleDetailsChange}
                        />
                        <div className={styles['step-actions']}>
                            <button 
                                className={styles['next-button']}
                                onClick={goToNextStep}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            case NavigationItemAlias.GENERATE:
                return (
                    <div>
                        <GenerateListingSection 
                            data={data}
                            isLoading={saving}
                            updateInfo={handleUpdateBasicInfo}
                            updateUserFields={updateUserFields}
                            saveDraft={saveDraft}
                        />
                        <div className={styles['step-actions']}>
                            <button 
                                className={styles['next-button']}
                                onClick={goToNextStep}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            case NavigationItemAlias.PREVIEW:
                return (
                    <div>
                        <ListingPreview data={data} />
                        <div className={styles['step-actions']}>
                            <button 
                                className={styles['next-button']}
                                onClick={goToNextStep}
                            >
                                Next to publish
                            </button>
                        </div>
                    </div>
                )
            case NavigationItemAlias.PUBLISH:
                return (
                    <div className={styles['publish-step']}>
                        <h2>Publish listing</h2>
                        <p>Your listing is ready to be published. Check all the data and publish it.</p>
                        <div className={styles['step-actions']}>
                            <button 
                                className={styles['publish-button']}
                                onClick={() => {
                                    // Логика публикации
                                    console.log('Publishing listing...', data);
                                }}
                            >
                                Publish
                            </button>
                        </div>
                    </div>
                )
            default: return null;
        }
    }

    const renderCreateListingSteps = () => {
        const steps = getStepsInfo();
        
        return (
            <div className={styles['create-container__steps']}>
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    return (
                        <div 
                            key={step.key}
                            className={classNames(
                                styles['create-container__steps__item'],
                                step.isActive && styles['_active'],
                                step.isCompleted && styles['_completed']
                            )}
                            onClick={() => goToStep(step.key)}
                        >
                            {step.isCompleted && (
                                <div className={styles['create-container__steps__item__success-icon']}>
                                    <IoCheckmarkCircleOutline size={18} />
                                </div>
                            )}
                            <span>{step.title}</span>
                            {!isLast && (
                                <div className={styles['create-container__steps__item__icon']}>
                                    <IoChevronForward size={18} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['create-container']}>
                {renderCreateListingSteps()}
                <div className={styles['create-container__main-content']}>
                    <div className={styles['create-container__main-content__header']}>
                        <div className={styles['create-container__main-content__header__info']}>
                            <div className={styles['info-container']}>
                                <h1 className={styles['info-title']}>Create New Listing</h1>
                                <div className={styles['info-description']}>
                                    Create new listing step by step filling the form
                                </div>
                            </div>
                        </div>
                    </div>
                    {renderCurrentStepContent()}
                </div>
            </div>
        </div>
    );
};

export default CreateNewListingPage;