import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.sass';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Страница не найдена</h2>
        <p className={styles.description}>
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            Вернуться на главную
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className={styles.backButton}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
