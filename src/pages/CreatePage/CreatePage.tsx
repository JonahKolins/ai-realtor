import React, { useState } from 'react';
import styles from './CreatePage.module.sass';

const CreatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'apartment'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Данные формы:', formData);
    // Здесь будет логика отправки данных
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Создать объявление</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Название объекта
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите название"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="type" className={styles.label}>
              Тип недвижимости
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="apartment">Квартира</option>
              <option value="house">Дом</option>
              <option value="commercial">Коммерческая</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="price" className={styles.label}>
              Цена (руб.)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.input}
              placeholder="0"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Расскажите о объекте..."
              rows={5}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Создать объявление
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
