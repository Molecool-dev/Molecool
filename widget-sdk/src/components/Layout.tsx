/**
 * Layout Components
 * 
 * Grid, Divider, and Header components for widget layout
 */

import React from 'react';
import styles from './Layout.module.css';

export interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  columns = 2,
  gap = 12,
  className 
}) => {
  return (
    <div 
      className={`${styles.grid} ${className || ''}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
};

export interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className }) => {
  return <div className={`${styles.divider} ${className || ''}`} />;
};

export interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      {children}
    </div>
  );
};
