import React, { useEffect, useState } from 'react';
import styles from './CreateNewListingPage.module.sass';
import { IoCashOutline, IoImagesOutline, IoDocumentOutline, IoReaderOutline } from "react-icons/io5";
import classNames from 'classnames';
import PhotosSection from '@/pagesContent/createNewListing/photosSection/PhotosSection';
import ListingTypeSection from '@/pagesContent/createNewListing/listingTypeSection/ListingTypeSection';
import DetailsSection from '@/pagesContent/createNewListing/detailsSection/DetailsSection';
import PreviewSection from '@/pagesContent/createNewListing/previewSection/PreviewSection';
import { PropertyType } from '@/classes/listings/Listing.types';
import { useListingDraft } from '@/core/hooks/useListingDraft';
import { IUpdateListingInfo } from '@/classes/listings/ListingDraft';
import { ListingPreview } from '@/pagesContent/createNewListing/listingPreview/ListingPreview';
import { CreateListingInfo } from '@/pagesContent/createNewListing/createListingInfo/CreateListingInfo';
import { Button } from 'antd';

interface INavigationItem {
    title: string;
    alias: NavigationItemAlias;
    icon: JSX.Element | null;
    initial: boolean;
}

enum NavigationItemAlias {
    LISTING = 'listing',
    PHOTOS = 'photos',
    DETAILS = 'details',
    PREVIEW = 'preview',
}

const navigationItems: INavigationItem[] = [
    {
        title: 'Listing',
        alias: NavigationItemAlias.LISTING,
        icon: <IoCashOutline size={22} />,
        initial: true,
    },
    {
        title: 'Photos',
        alias: NavigationItemAlias.PHOTOS,
        icon: <IoImagesOutline size={22} />,
        initial: false,
    },
    {
        title: 'Details',
        alias: NavigationItemAlias.DETAILS,
        icon: <IoDocumentOutline size={22} />,
        initial: false,
    },
    {
        title: 'Preview',
        alias: NavigationItemAlias.PREVIEW,
        icon: <IoReaderOutline size={22} />,
        initial: false,
    }
]

const CreateNewListingPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<NavigationItemAlias>(navigationItems[0].alias);
    const [createListingStarted, setCreateListingStarted] = useState<boolean>(false);

    const {draft, data, saving, updateListingType, updatePropertyType, updateUserFields, updateBasicInfo, saveDraft, forceClearDraft} = useListingDraft({
        autoSave: true,
        createOnMount: true,
        initialData: {
            type: 'sale',
            propertyType: PropertyType.HOUSE,
        },
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

    //
    const handleNextStep = (nextTab: NavigationItemAlias) => {
        setSelectedTab(nextTab);
    }

    // обработка нажатия на кнопку "Далее" в секции "Listing"
    const handleStartCreateListing = () => {
        setCreateListingStarted(true);
        handleNextStep(NavigationItemAlias.PHOTOS);
    }

    // обработка нажатия на кнопку "Далее" в секции "Details"
    const handleDetailsSectionNextStep = () => {
        handleNextStep(NavigationItemAlias.PREVIEW);
    }

    const renderNavigationTabs = () => {
        return navigationItems.map((item: INavigationItem) => (
            <div 
                key={item.alias} 
                className={classNames(
                    styles['navigation-item'],
                    selectedTab === item.alias && styles['_active'],
                    // !item.initial && !createListingStarted && styles['_disabled']
                )}
                onClick={() => setSelectedTab(item.alias)}
            >
                <div className={styles['navigation-item-content']}>
                    <div className={styles['navigation-item-icon']}>{item.icon}</div>
                    <div className={styles['navigation-item-title']}>{item.title}</div>
                </div>
                {/* {item.initial && createListingStarted && (
                    <div className={styles['navigation-item-completed']}>
                        <IoCheckmarkCircleOutline size={20} />
                    </div>
                )} */}
                {/* {!item.initial && !createListingStarted && (
                    <div className={styles['navigation-item-not-started']}>
                        <IoLockClosedOutline size={18} />
                    </div>
                )} */}
            </div>
        ))
    }

    const renderContentByTabId = () => {
        switch (selectedTab) {
            case NavigationItemAlias.LISTING:
                return (
                    <ListingTypeSection 
                        data={data}
                        updateListingType={updateListingType} 
                        updatePropertyType={updatePropertyType} 
                        onNextStep={handleStartCreateListing} 
                        saveDraft={saveDraft}
                    />
                )
            case NavigationItemAlias.PHOTOS:
                return (
                    <PhotosSection 
                        onPhotosChange={() => {}}
                    />
                )
            case NavigationItemAlias.DETAILS:
                return (
                    <DetailsSection 
                        data={data}
                        onDetailsChange={handleDetailsChange}
                        onNextStep={handleDetailsSectionNextStep}
                        saveDraft={saveDraft}
                    />
                )
            case NavigationItemAlias.PREVIEW:
                return (
                    <PreviewSection 
                        data={data}
                        isLoading={saving}
                        updateInfo={handleUpdateBasicInfo}
                        saveDraft={saveDraft}
                    />
                )
            default: return null;
        }
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['create-container']}>
                <div className={styles['create-container__navigation']}>
                    <h1 className={styles['title']}>Create a new listing</h1>
                    <div className={styles['description']}>Simple poll for creating a new listing with photos and details</div>
                    <div className={styles['navigation-tabs']}>
                        {renderNavigationTabs()}
                    </div>
                </div>
                <div className={styles['create-container__main-content']}>
                    <div className={styles['create-container__main-content__body']}>
                        <div className={styles['create-container__form-wrapper']}>
                            {/* {renderContentByTabId()} */}
                            <div className={styles['create-container__form-wrapper__header']}>
                                <div className={styles['create-container__form-wrapper__header__breadcrumbs']}>
                                    <div>Home - New Listing</div>
                                </div>
                                <div className={styles['create-container__form-wrapper__header__info']}>
                                    <div className={styles['info-container']}>
                                        <h1 className={styles['info-title']}>New Listing</h1>
                                        <div className={styles['info-description']}>Generate a new listing</div>
                                    </div>
                                    <div className={styles['create-container__form-wrapper__header__buttons']}>
                                        <Button>Save draft</Button>
                                        {/* <Button>Publish</Button> */}
                                    </div>
                                </div>
                            </div>
                            <CreateListingInfo data={data} saveDraft={saveDraft} />
                        </div>
                        <div className={styles['create-container__preview-wrapper']}>
                            <ListingPreview data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewListingPage;