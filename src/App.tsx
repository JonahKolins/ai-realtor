import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import Header from './components/header/Header';
import AuthGuard from './components/AuthGuard/AuthGuard';
import './App.modile.sass';
import { ConfigProvider } from 'antd';

// Ленивая загрузка страниц
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const CreateNewListingPage = React.lazy(() => import('./pages/CreatePage/CreateNewListingPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage/NotFoundPage'));
const ListingsPage = React.lazy(() => import('./pages/ListingsPage/ListingsPage'));
const EditPhotosPage = React.lazy(() => import('./pages/EditPhotosPage/EditPhotosPage'));

const App: React.FC = () => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        itemSelectedColor: 'rgb(0, 0, 0)',
                        itemHoverColor: 'rgb(0, 0, 0)',
                        colorPrimary: 'rgb(0, 0, 0)'
                    },
                    Select: {
                        optionSelectedColor: 'rgb(0, 0, 0)',
                        colorPrimary: 'rgb(0, 0, 0)',
                        hoverBorderColor: 'rgb(0, 0, 0)'
                    },
                    Input: {
                        colorPrimary: 'rgb(0, 0, 0)',
                        hoverBorderColor: 'rgb(0, 0, 0)'
                    },
                    InputNumber: {
                        colorPrimary: 'rgb(0, 0, 0)',
                        hoverBorderColor: 'rgb(0, 0, 0)'
                    },
                    Switch: {
                        colorPrimary: 'rgb(0, 0, 0)',
                        colorPrimaryHover: 'rgb(0, 0, 0)'
                    },
                }
            }}
        >
            <AuthGuard>
                <Router>
                    <div className="app">
                        <Header />
                        <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/create" element={<CreateNewListingPage />} />
                                <Route path="/listings" element={<ListingsPage />} />
                                <Route path="/edit-photos" element={<EditPhotosPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Suspense>
                    </div>
                </Router>
            </AuthGuard>
        </ConfigProvider>
    );
};

export default App;
