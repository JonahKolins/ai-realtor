import React, {memo} from "react";
import styles from "./Button.module.sass";
import classNames from "classnames";

interface ButtonProps {
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

const Button = memo<ButtonProps>(({onClick, disabled, className, children}) => {
    return (
        <button
            onClick={onClick}
            className={classNames(
                styles['button'],
                disabled && styles['_disabled'],
                className
            )}
        >
            {children}
        </button>
    )
})

export default Button;