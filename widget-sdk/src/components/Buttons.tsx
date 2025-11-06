/**
 * Button Component
 * 
 * Interactive button with different variants
 */

import React from 'react';
import styles from './Buttons.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className 
}) => {
  return (
    <button 
      className={`${styles.button} ${styles[`button-${variant}`]} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
