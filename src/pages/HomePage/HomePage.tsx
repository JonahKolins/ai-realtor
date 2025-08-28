import React from 'react';
import styles from './HomePage.module.sass';

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Добро пожаловать в AI Realtor</h1>
        <p className={styles.subtitle}>
          Современная платформа для работы с недвижимостью
        </p>
        <button className={styles.ctaButton}>
          Начать работу
        </button>
      </header>
      
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Наши возможности</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h3>Умный поиск</h3>
            <p>ИИ поможет найти идеальную недвижимость</p>
          </div>
          <div className={styles.feature}>
            <h3>Аналитика рынка</h3>
            <p>Актуальные данные о ценах и трендах</p>
          </div>
          <div className={styles.feature}>
            <h3>Персональные рекомендации</h3>
            <p>Подборка объектов под ваши требования</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
