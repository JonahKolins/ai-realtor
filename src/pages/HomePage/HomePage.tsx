import React from 'react';
import styles from './HomePage.module.sass';

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Welcome to AI Realtor</h1>
        <p className={styles.subtitle}>
          Modern platform for working with real estate
        </p>
        <button className={styles.ctaButton}>
          Start working
        </button>
      </header>
      
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Our features</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h3>Smart search</h3>
            <p>AI will help you find the perfect real estate</p>
          </div>
          <div className={styles.feature}>
            <h3>Market analytics</h3>
            <p>Actual data on prices and trends</p>
          </div>
          <div className={styles.feature}>
            <h3>Personal recommendations</h3>
            <p>Selection of objects under your requirements</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
