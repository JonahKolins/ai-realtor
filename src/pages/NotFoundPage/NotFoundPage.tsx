import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.sass';
import Button from '../../designSystem/button/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Not found</h2>
        <p className={styles.description}>
          Unfortunately, the requested page does not exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            Back to home
          </Link>
          <Button 
            onClick={() => window.history.back()} 
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
