/**
 * Widget Container Component
 * 
 * The main container for all widgets with glassmorphism effect
 */

import React from 'react';
import styles from './Widget.module.css';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
};
