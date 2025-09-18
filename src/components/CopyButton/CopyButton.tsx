import React, { useState } from 'react';
import { IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5';
import classNames from 'classnames';
import styles from './CopyButton.module.sass';

interface CopyButtonProps {
    text: string;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
    text,
    className,
    size = 'medium',
    showText = false
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={classNames(
                styles.copyButton,
                styles[`size-${size}`],
                className,
                {
                    [styles.copied]: isCopied
                }
            )}
            title={isCopied ? 'Copied!' : 'Copy to clipboard'}
        >
            {isCopied ? <IoCheckmarkOutline /> : <IoCopyOutline />}
            {showText && (
                <span className={styles.text}>
                    {isCopied ? 'Copied!' : 'Copy'}
                </span>
            )}
        </button>
    );
};

export default CopyButton;
