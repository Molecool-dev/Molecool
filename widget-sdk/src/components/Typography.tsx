/**
 * Typography Components
 * 
 * Text components with different sizes and styles
 */

import React from 'react';
import styles from './Typography.module.css';

export interface TitleProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Title: React.FC<TitleProps> = ({ 
  children, 
  size = 'medium',
  className 
}) => {
  return (
    <h1 className={`${styles.title} ${styles[`title-${size}`]} ${className || ''}`}>
      {children}
    </h1>
  );
};

export interface LargeTextProps {
  children: React.ReactNode;
  className?: string;
}

export const LargeText: React.FC<LargeTextProps> = ({ children, className }) => {
  return (
    <div className={`${styles.largeText} ${className || ''}`}>
      {children}
    </div>
  );
};

export interface SmallTextProps {
  children: React.ReactNode;
  className?: string;
}

export const SmallText: React.FC<SmallTextProps> = ({ children, className }) => {
  return (
    <div className={`${styles.smallText} ${className || ''}`}>
      {children}
    </div>
  );
};
