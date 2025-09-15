import React from 'react';
import styles from './ToggleInput.module.sass';
import classNames from 'classnames';

interface ToggleInputProps {
    label?: string;
    value?: boolean;
    onChange: (value: boolean) => void;
    withAnnotation?: boolean;
    containerClassName?: string;
}

const ToggleInput: React.FC<ToggleInputProps> = ({
    label,
    value = false,
    onChange,
    withAnnotation,
    containerClassName
}) => {
    const handleToggle = () => {
        onChange(!value);
    };

    return (
        <div className={classNames(styles.container, containerClassName)}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.toggleWrapper} onClick={handleToggle}>
                <div className={`${styles.toggle} ${value ? styles.active : ''}`}>
                    <div className={styles.slider}></div>
                </div>
                {withAnnotation && (
                    <span className={styles.status}>
                        {value ? 'Yes' : 'No'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ToggleInput;
