import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { message, Breadcrumb } from 'antd';
import { IoHome, IoLayersOutline, IoEyeOutline, IoPricetagOutline } from 'react-icons/io5';
import styles from './ListingDetailPage.module.sass';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { requestListing, requestListingPhotos } from '../../api/network/listings';
import { IListing, ListingStatus } from '../../api/network/listings/requests/GetListingRequest';
import { IListingPhoto } from '../../api/network/listings/requests/GetListingPhotos';
import { PhotoSlider } from '../../components/PhotoSlider';
import { PhotoModal } from '../../components/PhotoModal';
import { DisplayPhoto } from '../../classes/photos/ListingPhotoStorage';

const ListingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<IListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

    // Функция для преобразования серверных фотографий в DisplayPhoto
    const convertServerPhotosToDisplayPhotos = (serverPhotos: IListingPhoto[]): DisplayPhoto[] => {
        return serverPhotos
            .filter(photo => photo.status === 'READY') // Показываем только готовые фотографии
            .sort((a, b) => {
                // Обложка всегда первая
                if (a.isCover && !b.isCover) return -1;
                if (!a.isCover && b.isCover) return 1;
                // Затем по sortOrder
                return a.sortOrder - b.sortOrder;
            })
            .map(photo => ({
                id: photo.id,
                uploadedPhotoId: photo.id,
                url: buildPhotoUrl(photo),
                thumbnailUrl: buildThumbnailUrl(photo),
                isCover: photo.isCover,
                isUploaded: true,
                sortOrder: photo.sortOrder,
                status: 'ready' as const,
                width: photo.width || undefined,
                height: photo.height || undefined,
                mime: photo.mime || undefined
            }));
    };

    // Построение URL фотографии
    const buildPhotoUrl = (serverPhoto: IListingPhoto): string => {
        if (!serverPhoto.variants) return '';
        
        const variant = serverPhoto.variants.webp || serverPhoto.variants.avif;
        if (!variant) return '';
        
        const key = variant.w1024 || variant.w1600 || variant.w512;
        if (!key) return '';
        
        return `${serverPhoto.cdnBaseUrl}${key}`;
    };

    // Построение URL миниатюры
    const buildThumbnailUrl = (serverPhoto: IListingPhoto): string => {
        if (!serverPhoto.variants) return '';
        
        const variant = serverPhoto.variants.webp || serverPhoto.variants.avif;
        if (!variant) return '';
        
        const key = variant.w512 || variant.w1024 || variant.w1600;
        if (!key) return '';
        
        return `${serverPhoto.cdnBaseUrl}${key}`;
    };

    // Загрузка фотографий
    const loadPhotos = async (listingId: string) => {
        try {
            setPhotosLoading(true);
            const serverPhotos = await requestListingPhotos(listingId);
            const displayPhotos = convertServerPhotosToDisplayPhotos(serverPhotos);
            setPhotos(displayPhotos);
        } catch (err) {
            console.error('Ошибка при загрузке фотографий:', err);
            // Не показываем ошибку для фотографий, просто логируем
        } finally {
            setPhotosLoading(false);
        }
    };

    useEffect(() => {
        const loadListing = async () => {
            if (!id) {
                setError('Listing ID not specified');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const listingData = await requestListing(id);
                setListing(listingData);
                
                // Параллельно загружаем фотографии
                loadPhotos(id);
            } catch (err) {
                console.error('Ошибка при загрузке объявления:', err);
                setError('Не удалось загрузить объявление');
                message.error('Ошибка при загрузке объявления');
            } finally {
                setLoading(false);
            }
        };

        loadListing();
    }, [id]);

    // Обработчики для фотографий
    const handlePhotoClick = (photo: DisplayPhoto, index: number) => {
        setModalPhotoIndex(index);
        setPhotoModalOpen(true);
    };

    const handlePhotoDownload = (photo: DisplayPhoto) => {
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
                    title: 'Property Photo',
                    text: 'Check out this property photo',
                    url: photo.url
                });
            } catch (error) {
                console.log('Sharing cancelled');
            }
        } else {
            try {
                await navigator.clipboard.writeText(photo.url);
                message.success('Photo URL copied to clipboard');
            } catch (error) {
                console.error('Error copying URL:', error);
            }
        }
    };

    const getStatusBadge = (status: ListingStatus) => {
        const statusConfig = {
            draft: { text: 'Draft', className: 'draft' },
            ready: { text: 'Ready', className: 'ready' },
            published: { text: 'Published', className: 'published' },
            archived: { text: 'Archived', className: 'archived' }
        };

        const config = statusConfig[status] || { text: status, className: 'unknown' };
        return <span className={`${styles.statusBadge} ${styles[config.className]}`}>{config.text}</span>;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Error</h2>
                    <p>{error || 'Listing not found'}</p>
                    <button 
                        className={styles.backButton}
                        onClick={() => navigate('/services/listings')}
                    >
                        Return to the list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <Link to="/services">
                                    <IoHome />
                                    <span>Services</span>
                                </Link>
                            )
                        },
                        {
                            title: (
                                <Link to="/services/listings">
                                    <IoLayersOutline />
                                    <span>Listings</span>
                                </Link>
                            )
                        },
                        {
                            title: (
                                <span>
                                    <IoEyeOutline />
                                    <span>View</span>
                                </span>
                            )
                        }
                    ]}
                />
            </div>

            {/* Listing Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        {listing.title || 'No title'}
                    </h1>
                    <div className={styles.headerMeta}>
                        {getStatusBadge(listing.status)}
                        <span className={styles.listingId}>ID: {listing.id}</span>
                    </div>
                </div>
            </div>

            {/* Photo Gallery */}
            <div className={styles.photoSection}>
                {photosLoading ? (
                    <div className={styles.photoLoading}>
                        <LoadingSpinner />
                        <span>Loading photos...</span>
                    </div>
                ) : photos.length > 0 ? (
                    <PhotoSlider
                        photos={photos}
                        showThumbnails={true}
                        onPhotoClick={handlePhotoClick}
                        className={styles.photoSlider}
                    />
                ) : (
                    <div className={styles.noPhotos}>
                        <span>No photos available</span>
                    </div>
                )}
            </div>

            {/* Listing Content */}
            <div className={styles.content}>
                {/* Main Info Card */}
                <div className={styles.infoCard}>
                    <h2>Main information</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Title:</span>
                            <span className={styles.value}>
                                {listing.title || 'Not specified'}
                            </span>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Price:</span>
                            <span className={`${styles.value} ${styles.price}`}>
                                <IoPricetagOutline />
                                {listing.price ? `€ ${listing.price.toLocaleString()}` : 'Not specified'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Type of listing:</span>
                            <span className={styles.value}>
                                {listing.type || 'Not specified'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Property type:</span>
                            <span className={styles.value}>
                                {listing.propertyType || 'Not specified'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.value}>
                                {getStatusBadge(listing.status)}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>ID:</span>
                            <span className={styles.value}>
                                {listing.id}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Created:</span>
                            <span className={styles.value}>
                                {new Date(listing.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Updated:</span>
                            <span className={styles.value}>
                                {new Date(listing.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                {listing.description && (
                    <div className={styles.infoCard}>
                        <h2>Description</h2>
                        <div className={styles.description}>
                            {listing.description.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                {listing.summary && (
                    <div className={styles.infoCard}>
                        <h2>Brief description</h2>
                        <p className={styles.summary}>{listing.summary}</p>
                    </div>
                )}

                {/* Highlights Card */}
                {listing.highlights && listing.highlights.length > 0 && (
                    <div className={styles.infoCard}>
                        <h2>Key features</h2>
                        <ul className={styles.highlights}>
                            {listing.highlights.map((highlight, index) => (
                                <li key={index}>{highlight}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button 
                    className={styles.backButton}
                    onClick={() => navigate('/services/listings')}
                >
                    Return to the list
                </button>
                
                {/* TODO: Добавить кнопки редактирования, удаления и т.д. */}
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
};

export default ListingDetailPage;
