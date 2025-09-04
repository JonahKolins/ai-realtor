import React, { useState, useEffect } from 'react';
import styles from './AuthGuard.module.sass';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Проверяем режим разработки - если development, то аутентификация отключена
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Данные для входа из переменных окружения (Webpack заменит эти значения при сборке)
    const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || 'test';
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'nicecock99';

    useEffect(() => {
        // В режиме разработки аутентификация отключена
        if (isDevelopment) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
        }

        // В продакшене проверяем сохраненную сессию
        const savedAuth = sessionStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [isDevelopment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
        } else {
            setError('wrong login or password');
            setPassword('');
        }
    };

    if (isLoading) {
        return (
            <div className={styles.authLoading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // В режиме разработки аутентификация пропускается
    if (!isAuthenticated && !isDevelopment) {
        return (
            <div className={styles.authGuard}>
                <div className={styles.authModal}>
                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Login:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="login"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="password"
                            />
                        </div>
                        {error && <div className={styles.authError}>{error}</div>}
                        <button type="submit" className={styles.authSubmit}>
                            Login
                        </button>
                    </form>
                    <div className={styles.authFooter}>
                        <small>Temporary site protection</small>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Кнопка выхода только в продакшене
            {!isDevelopment && (
                <div className={styles.logoutContainer}>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                        Logout
                    </button>
                </div>
            )} */}
            {/* В режиме разработки показываем индикатор */}
            {/* {isDevelopment && (
                <div className={styles.devIndicator}>
                    DEV MODE
                </div>
            )} */}
            {children}
        </div>
    );
};

export default AuthGuard;
