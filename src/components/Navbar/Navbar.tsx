import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.sass';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          AI Realtor
        </Link>
        
        <ul className={styles.menu}>
          <li>
            <Link 
              to="/" 
              className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
            >
              Главная
            </Link>
          </li>
          <li>
            <Link 
              to="/create" 
              className={`${styles.link} ${location.pathname === '/create' ? styles.active : ''}`}
            >
              Создать
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
