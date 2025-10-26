import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import Header from './components/header/Header';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute/PrivateRoute';
import './App.modile.sass';
import { ConfigProvider } from 'antd';

// Ленивая загрузка страниц
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage/ServicesPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage/NotFoundPage'));

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
            <AuthProvider>
                <Router>
                    <div className="app">
                        <Header />
                        <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                {/* Публичная главная страница */}
                                <Route path="/" element={<HomePage />} />
                                
                                {/* Защищенная страница Services со всеми подстраницами */}
                                <Route 
                                    path="/services/*" 
                                    element={
                                        <PrivateRoute>
                                            <ServicesPage />
                                        </PrivateRoute>
                                    } 
                                />
                                
                                {/* 404 страница */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Suspense>
                    </div>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
