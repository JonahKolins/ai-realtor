import React, { useState, useEffect } from "react";
import styles from "./ListingPreview.module.sass";
import { IListingDraftData } from "@/classes/listings/ListingDraft";
import { IListingUserFields } from "@/classes/listings/ListingUserFields";
import { PropertyMap } from "@/components/PropertyMap";
import { 
    IoImageOutline, 
    IoBedOutline, 
    IoCarOutline, 
    IoHomeOutline,
    IoSpeedometerOutline,
    IoWalkOutline,
    IoFlashOutline,
    IoMapOutline,
    IoInformationCircleOutline,
    IoLeafOutline,
    IoDocumentTextOutline
} from "react-icons/io5";
import { Segmented } from "antd";
import classNames from "classnames";
import { listingPhotoStorage, DisplayPhoto } from "@/services/ListingPhotoStorage";
import { PhotoSlider } from "@/components/PhotoSlider";
import { PhotoModal } from "@/components/PhotoModal";

interface ListingPreviewProps {
    data: IListingDraftData;
}

type ViewMode = 'desktop' | 'mobile';

// Группы полей для структурированного отображения
interface DetailGroup {
    title: string;
    icon: React.ReactNode;
    fields: { key: keyof IListingUserFields; label: string; unit?: string; format?: (value: any) => string }[];
}

const detailGroups: DetailGroup[] = [
    {
        title: "Caratteristiche principali",
        icon: <IoHomeOutline />,
        fields: [
            { key: 'squareMeters', label: 'Superficie', unit: 'm²' },
            { key: 'rooms', label: 'Locali' },
            { key: 'bedrooms', label: 'Camere' },
            { key: 'bathrooms', label: 'Bagni' },
            { key: 'floor', label: 'Piano' },
            { key: 'totalFloors', label: 'Piani totali' },
            { key: 'elevator', label: 'Ascensore', format: (val: boolean) => val ? 'Sì' : 'No' }
        ]
    },
    {
        title: "Spazi esterni e comfort",
        icon: <IoLeafOutline />,
        fields: [
            { key: 'balcony', label: 'Balcone', format: (val: boolean) => val ? 'Sì' : 'No' },
            { key: 'balconySize', label: 'Superficie balcone', unit: 'm²' },
            { key: 'terrace', label: 'Terrazza', format: (val: boolean) => val ? 'Sì' : 'No' },
            { key: 'terraceSize', label: 'Superficie terrazza', unit: 'm²' },
            { key: 'garden', label: 'Giardino', format: (val: boolean) => val ? 'Sì' : 'No' },
            { key: 'gardenSquareMeters', label: 'Superficie giardino', unit: 'm²' },
            { key: 'parking', label: 'Posto auto', format: (val: boolean) => val ? 'Sì' : 'No' },
            { key: 'cellar', label: 'Cantina', format: (val: boolean) => val ? 'Sì' : 'No' }
        ]
    },
    {
        title: "Riscaldamento e energia",
        icon: <IoFlashOutline />,
        fields: [
            { key: 'heating', label: 'Riscaldamento' },
            { key: 'energyClass', label: 'Classe energetica' },
            { key: 'energyConsumption', label: 'Consumo energetico', unit: 'kWh' }
        ]
    },
    {
        title: "Trasporti e servizi",
        icon: <IoWalkOutline />,
        fields: [
            { key: 'walkingDistanceMetro', label: 'Metro a piedi', unit: 'min' },
            { key: 'metroStation', label: 'Stazione metro' },
            { key: 'walkingDistanceTrain', label: 'Treno a piedi', unit: 'min' },
            { key: 'walkingDistanceBus', label: 'Autobus a piedi', unit: 'min' },
            { key: 'walkingDistancePark', label: 'Parco a piedi', unit: 'min' },
            { key: 'walkingDistanceShops', label: 'Negozi a piedi', unit: 'min' },
            { key: 'walkingDistanceSchools', label: 'Scuole a piedi', unit: 'min' }
        ]
    },
    {
        title: "Informazioni aggiuntive",
        icon: <IoInformationCircleOutline />,
        fields: [
            { key: 'condoFees', label: 'Spese condominiali', unit: '€/mese' },
            { key: 'condition', label: 'Stato' },
            { key: 'yearBuilt', label: 'Anno costruzione' },
            { key: 'yearRenovated', label: 'Anno ristrutturazione' }
        ]
    }
];

export const ListingPreview = React.memo<ListingPreviewProps>(({ data }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

    // Подписка на изменения фотографий в хранилище
    useEffect(() => {
        const updatePhotos = (newPhotos: DisplayPhoto[]) => {
            // Показываем только готовые фотографии (с завершенной загрузкой)
            const readyPhotos = newPhotos.filter(photo => 
                photo.status === 'ready' && photo.isUploaded
            );
            setPhotos(readyPhotos);
        };

        // Получаем текущие фотографии
        updatePhotos(listingPhotoStorage.getPhotos());

        // Подписываемся на обновления
        const handle = listingPhotoStorage.photosUpdated.subscribe(updatePhotos);

        return () => {
            handle.dispose();
        };
    }, []);

    const handlePhotoClick = (photo: DisplayPhoto, index: number) => {
        setModalPhotoIndex(index);
        setPhotoModalOpen(true);
    };

    const handlePhotoDownload = (photo: DisplayPhoto) => {
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `photo-${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePhotoShare = async (photo: DisplayPhoto) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Foto della proprietà',
                    text: 'Guarda questa foto della proprietà',
                    url: photo.url
                });
            } catch (error) {
                console.log('Condivisione annullata');
            }
        } else {
            // Fallback: copia URL negli appunti
            try {
                await navigator.clipboard.writeText(photo.url);
                // Qui si potrebbe aggiungere una notifica toast
                console.log('URL copiato negli appunti');
            } catch (error) {
                console.error('Errore nella copia dell\'URL:', error);
            }
        }
    };

    const renderPhotosDesktop = () => {        
        if (photos.length === 0) {
            return (
                <div className={styles['photos-gallery']}>
                    <div className={styles['photo-placeholder']}>
                        <IoImageOutline className={styles['placeholder-icon']} />
                        <span className={styles['placeholder-text']}>Nessuna foto disponibile</span>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles['photos-gallery']}>
                <PhotoSlider
                    photos={photos}
                    showThumbnails={true}
                    onPhotoClick={handlePhotoClick}
                    className={styles['desktop-slider']}
                />
            </div>
        );
    };

    const renderPhotosMobile = () => {        
        if (photos.length === 0) {
            return (
                <div className={styles['photos-gallery']}>
                    <div className={styles['photo-placeholder']}>
                        <IoImageOutline className={styles['placeholder-icon']} />
                        <span className={styles['placeholder-text']}>Nessuna foto disponibile</span>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles['photos-gallery']}>
                <PhotoSlider
                    photos={photos}
                    showThumbnails={false}
                    onPhotoClick={handlePhotoClick}
                    className={styles['mobile-slider']}
                />
            </div>
        );
    };

    const renderDetailsGroup = (group: DetailGroup) => {
        const userFields = data.userFields || {};
        const visibleFields = group.fields.filter(field => {
            const value = userFields[field.key];
            return value !== undefined && value !== null && value !== '';
        });

        if (visibleFields.length === 0) return null;

        return (
            <div key={group.title} className={styles['details-section']}>
                <div className={styles['section-title']}>
                    <span className={styles['section-icon']}>{group.icon}</span>
                    {group.title}
                </div>
                <div className={styles['details-list']}>
                    {visibleFields.map(field => {
                        const value = userFields[field.key];
                        let displayValue = value;
                        
                        if (field.format) {
                            displayValue = field.format(value);
                        } else if (field.unit) {
                            displayValue = `${value} ${field.unit}`;
                        }

                        return (
                            <div key={field.key} className={styles['detail-item']}>
                                <span className={styles['detail-text']}>
                                    {field.label}: {displayValue}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDesktopView = () => (
        <div className={styles['desktop-view']}>
            {renderPhotosDesktop()}
            
            <div className={styles['listing-info']}>
                <h2 className={styles['listing-title']}>
                    {data.title || 'Titolo dell\'annuncio'}
                </h2>
                <div className={styles['price']}>
                    {data.price ? `€ ${data.price.toLocaleString()}` : '€ Prezzo da definire'}
                </div>
            </div>

            <div className={styles['details-grid']}>
                <div>
                    {detailGroups.slice(0, Math.ceil(detailGroups.length / 2)).map(renderDetailsGroup)}
                </div>
                <div>
                    {detailGroups.slice(Math.ceil(detailGroups.length / 2)).map(renderDetailsGroup)}
                </div>
            </div>

            <div className={styles['description-section']}>
                <div className={styles['section-title']}>
                    <IoMapOutline className={styles['section-icon']} />
                    <span className={styles['section-text']}>Posizione</span>
                </div>
                <div className={styles['description-text']}>
                    {[
                        data.userFields?.address,
                        data.userFields?.postalCode,
                        data.userFields?.city
                    ].filter(Boolean).join(', ') || 'Posizione da specificare'}
                </div>
                <div className={styles['map-container']}>
                    <PropertyMap 
                        address={data.userFields?.address}
                        postalCode={data.userFields?.postalCode}
                        city={data.userFields?.city}
                        height="250px"
                    />
                </div>
            </div>

            <div className={styles['description-section']}>
                <div className={styles['section-title']}>
                    <IoDocumentTextOutline className={styles['section-icon']} />
                    <span className={styles['section-text']}>Descrizione</span>
                </div>
                <div className={styles['description-text']}>
                    {data.description ? (
                        data.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                        <p className={styles['empty-state']}>
                            Splendida proprietà in posizione strategica...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderMobileView = () => (
        <div className={styles['mobile-view']}>
            {renderPhotosMobile()}
            
            <div className={styles['listing-info']}>
                <h2 className={styles['listing-title']}>
                    {data.title || 'Titolo dell\'annuncio'}
                </h2>
                <div className={styles['price']}>
                    {data.price ? `€ ${data.price.toLocaleString()}` : '€ Prezzo da definire'}
                </div>
            </div>

            <div className={styles['details-sections']}>
                {detailGroups.map(renderDetailsGroup)}
            </div>

            <div className={styles['description-section']}>
                <div className={styles['section-title']}>
                    <IoMapOutline className={styles['section-icon']} />
                    <span className={styles['section-text']}>Posizione</span>
                </div>
                <div className={styles['description-text']}>
                    <p>{[
                        data.userFields?.address,
                        data.userFields?.postalCode,
                        data.userFields?.city
                    ].filter(Boolean).join(', ') || 'Posizione da specificare'}</p>
                </div>
                <div className={styles['map-container']}>
                    <PropertyMap 
                        address={data.userFields?.address}
                        postalCode={data.userFields?.postalCode}
                        city={data.userFields?.city}
                        height="200px"
                    />
                </div>
            </div>

            <div className={styles['description-section']}>
                <div className={styles['section-title']}>
                    <IoDocumentTextOutline className={styles['section-icon']} />
                    <span className={styles['section-text']}>Descrizione</span>
                </div>
                <div className={styles['description-text']}>
                    {data.description ? (
                        data.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                        <p className={styles['empty-state']}>
                            Splendida proprietà in posizione strategica...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles['listing-preview']}>
            <div className={styles['preview-header']}>
                <h3>Anteprima Annuncio</h3>
                <div>
                    Tipo: {data.propertyType || 'Non specificato'} • 
                    Categoria: {data.type || 'Non specificata'}
                </div>
            </div>

            <div className={styles['view-mode-toggle']}>
                <Segmented
                    value={viewMode}
                    onChange={(value) => setViewMode(value as ViewMode)}
                    options={['desktop', 'mobile']}
                />
            </div>

            <div className={classNames(styles['preview-container'], viewMode === 'mobile' && styles._mobile)}>
                {viewMode === 'desktop' ? renderDesktopView() : renderMobileView()}
            </div>

            {/* Photo Modal */}
            <PhotoModal
                photos={photos}
                initialIndex={modalPhotoIndex}
                open={photoModalOpen}
                onClose={() => setPhotoModalOpen(false)}
                onDownload={handlePhotoDownload}
                onShare={handlePhotoShare}
            />
        </div>
    );
});