import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import Header from './components/header/Header';

// Ленивая загрузка страниц
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const CreateNewListingPage = React.lazy(() => import('./pages/CreatePage/CreateNewListingPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage/NotFoundPage'));

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <main>
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/create" element={<CreateNewListingPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </Router>
    );
};

export default App;
