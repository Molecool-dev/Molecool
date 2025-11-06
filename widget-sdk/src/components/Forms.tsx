/**
 * Form Components
 * 
 * Input and select components for user interaction
 */

import React from 'react';
import styles from './Forms.module.css';

// ============================================================================
// Input Component
// ============================================================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label,
  error,
  className,
  ...inputProps
}) => {
  return (
    <div className={`${styles.inputWrapper} ${className || ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input 
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...inputProps}
      />
      {error && (
        <span className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// Select Component
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label,
  options,
  error,
  className,
  ...selectProps
}) => {
  return (
    <div className={`${styles.selectWrapper} ${className || ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <select 
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
};
