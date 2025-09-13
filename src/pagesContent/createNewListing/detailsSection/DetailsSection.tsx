import React from 'react';
import styles from './DetailsSection.module.sass';

interface DetailsSectionProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
    value,
    onChange
}) => {
    return (
        <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
                Details
            </label>
            <textarea
                id="description"
                name="description"
                value={value}
                onChange={onChange}
                className={styles.textarea}
                placeholder="Tell us about the property..."
                rows={5}
                required
            />
        </div>
    );
};

export default DetailsSection;
