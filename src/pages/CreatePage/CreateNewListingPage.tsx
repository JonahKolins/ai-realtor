import React, { useEffect, useState } from 'react';
import { IoCashOutline, IoImagesOutline, IoDocumentOutline, IoReaderOutline } from "react-icons/io5";
import { useListingDraft } from '@/core/hooks/useListingDraft';
import { IUpdateListingInfo } from '@/classes/listings/ListingDraft';
import { ListingPreview } from '@/pagesContent/createNewListing/listingPreview/ListingPreview';
import { Tabs, TabsProps } from 'antd';
import { CreateListingPropertyDetails } from '@/pagesContent/createNewListing/createListingPropertyDetails/CreateListingPropertyDetails';
import { CreateListingDetails } from '@/pagesContent/createNewListing/createListingData/CreateListingDetails';
import PreviewSection from '@/pagesContent/createNewListing/previewSection/PreviewSection';
import styles from './CreateNewListingPage.module.sass';
import classNames from 'classnames';

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
    GENERATE = 'generate',
}

const tabItems: TabsProps['items'] = [
    {
        key: NavigationItemAlias.LISTING,
        label: 'Listing details',
    },
    {
        key: NavigationItemAlias.DETAILS,
        label: 'Property details',
    },
    {
        key: NavigationItemAlias.GENERATE,
        label: 'Generate',
    }
  ];

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
    const [selectedListingTab, setSelectedListingTab] = useState<NavigationItemAlias>(tabItems[0].key as NavigationItemAlias);
    const [createListingStarted, setCreateListingStarted] = useState<boolean>(false);

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

    const handleTabChange = (key: string) => {
        setSelectedListingTab(key as NavigationItemAlias);
    }

    const renderListingTabsContent = () => {
        switch (selectedListingTab) {
            case NavigationItemAlias.LISTING:
                return (
                    <CreateListingDetails
                        data={data}
                        onListingTypeChange={updateListingType}
                        onPriceChange={updatePrice} 
                        onPhotosChange={() => {}}
                    />
                )
            case NavigationItemAlias.DETAILS:
                return (
                    <CreateListingPropertyDetails 
                        data={data} 
                        updatePropertyType={updatePropertyType} 
                        onDetailsChange={handleDetailsChange}
                    />
                )
            case NavigationItemAlias.GENERATE:
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
                            <div className={styles['create-container__form-wrapper__header']}>
                                <div className={styles['create-container__form-wrapper__header__breadcrumbs']}>
                                    <div>Home - New Listing</div>
                                </div>
                                <div className={styles['create-container__form-wrapper__header__info']}>
                                    <div className={styles['info-container']}>
                                        <h1 className={styles['info-title']}>New Listing</h1>
                                        <Tabs 
                                            defaultActiveKey="photos" 
                                            items={tabItems}
                                            onChange={handleTabChange}
                                            tabBarStyle={{ marginBottom: '0px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {renderListingTabsContent()}
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