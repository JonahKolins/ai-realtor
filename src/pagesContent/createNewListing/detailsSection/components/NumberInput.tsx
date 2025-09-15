import React from 'react';
import styles from './NumberInput.module.sass';
import { IoAddCircleOutline, IoAddOutline, IoRemoveCircleOutline, IoRemoveOutline } from 'react-icons/io5';

interface NumberInputProps {
    label?: string;
    value?: number;
    onChange: (value: number | undefined) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 9999,
    step = 1,
    placeholder
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onChange(undefined);
        } else {
            const numVal = parseInt(val, 10);
            if (!isNaN(numVal)) {
                onChange(Math.max(min, Math.min(max, numVal)));
            }
        }
    };

    const handleIncrement = () => {
        const newValue = (value || 0) + step;
        if (newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = (value || 0) - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.inputGroup}>
                <button 
                    type="button"
                    className={styles.button}
                    onClick={handleDecrement}
                    disabled={value !== undefined && value <= min}
                >
                    <IoRemoveOutline size={22} />
                </button>
                <input
                    type="number"
                    className={styles.input}
                    value={value || '0'}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                />
                <button 
                    type="button"
                    className={styles.button}
                    onClick={handleIncrement}
                    disabled={value !== undefined && value >= max}
                >
                    <IoAddOutline size={22} />
                </button>
            </div>
        </div>
    );
};

export default NumberInput;
