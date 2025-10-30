import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoCashOutline, IoImagesOutline, IoLayersOutline } from "react-icons/io5";
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ServicesPage.module.sass';
import classNames from 'classnames';

// Ленивая загрузка компонентов
const CreateNewListingPage = React.lazy(() => import('../CreatePage/CreateNewListingPage'));
const ListingsPage = React.lazy(() => import('../ListingsPage/ListingsPage'));
const EditPhotosPage = React.lazy(() => import('../EditPhotosPage/EditPhotosPage'));
const ListingDetailPage = React.lazy(() => import('../ListingDetailPage/ListingDetailPage'));

interface INavigationItem {
    title: string;
    path: string;
    icon: JSX.Element;
    description: string;
}

const navigationItems: INavigationItem[] = [
    {
        title: 'Create Listing',
        path: '/services/create',
        icon: <IoCashOutline size={22} />,
        description: 'Create a new property listing'
    },
    {
        title: 'All Listings',
        path: '/services/listings',
        icon: <IoLayersOutline size={22} />,
        description: 'Manage your existing listings'
    },
    {
        title: 'Edit Photos',
        path: '/services/edit-photos',
        icon: <IoImagesOutline size={22} />,
        description: 'Edit photos for your listings'
    }
];

const ServicesPage: React.FC = () => {
    const location = useLocation();

    const renderNavigation = () => {
        return navigationItems.map((item: INavigationItem) => (
            <Link
                key={item.path}
                to={item.path}
                className={classNames(
                    styles.navigationItem,
                    location.pathname === item.path && styles._active
                )}
            >
                <div className={styles.navigationItemContent}>
                    <div className={styles.navigationItemIcon}>
                        {item.icon}
                    </div>
                    <div className={styles.navigationItemTitle}>
                        {item.title}
                    </div>
                </div>
            </Link>
        ));
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.servicesPage}>
                {/* Боковая панель навигации */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <h1 className={styles.title}>Services</h1>
                        <div className={styles.description}>
                            Manage your property listings with our comprehensive tools
                        </div>
                        <nav className={styles.navigation}>
                            {renderNavigation()}
                        </nav>
                    </div>
                </div>

                {/* Основной контент */}
                <div className={styles.mainContent}>
                    <div className={styles.contentWrapper}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                {/* Редирект с /services на /services/create */}
                                <Route path="/" element={<Navigate to="/services/create" replace />} />
                                
                                {/* Подстраницы */}
                                <Route path="/create" element={<CreateNewListingPage />} />
                                <Route path="/listings" element={<ListingsPage />} />
                                <Route path="/listings/:id" element={<ListingDetailPage />} />
                                <Route path="/edit-photos" element={<EditPhotosPage />} />
                                
                                {/* Fallback для неизвестных роутов */}
                                <Route path="*" element={<Navigate to="/services/create" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
