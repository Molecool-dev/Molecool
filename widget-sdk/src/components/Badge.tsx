/**
 * Badge Component
 * 
 * Small label for status, counts, or categories
 */

import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  return (
    <span className={`${styles.badge} ${styles[`badge-${variant}`]} ${className || ''}`}>
      {children}
    </span>
  );
};
