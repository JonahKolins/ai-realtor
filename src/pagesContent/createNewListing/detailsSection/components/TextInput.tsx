import React from 'react';
import styles from './TextInput.module.sass';

interface TextInputProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number';
}

const TextInput: React.FC<TextInputProps> = ({
    label,
    value = '',
    onChange,
    placeholder,
    type = 'text'
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <input
                type={type}
                className={styles.input}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />
        </div>
    );
};

export default TextInput;

