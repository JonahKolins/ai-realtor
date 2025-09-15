import React from 'react';
import styles from './SquareMeterInput.module.sass';
import classNames from 'classnames';

interface SquareMeterInputProps {
    label?: string;
    value?: number;
    onChange: (value: number | undefined) => void;
    placeholder?: string;
    inputWrapperClassName?: string;
    inputClassName?: string;
}

const SquareMeterInput: React.FC<SquareMeterInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Enter area in m²",
    inputClassName,
    inputWrapperClassName
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onChange(undefined);
        } else {
            const numVal = parseFloat(val);
            if (!isNaN(numVal) && numVal >= 0) {
                onChange(numVal);
            }
        }
    };

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={classNames(styles.inputWrapper, inputWrapperClassName)}>
                <input
                    type="number"
                    className={classNames(styles.input, inputClassName)}
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    min="0"
                    step="0.1"
                />
                <span className={styles.unit}>m²</span>
            </div>
        </div>
    );
};

export default SquareMeterInput;
