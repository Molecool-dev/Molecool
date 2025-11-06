/**
 * List Components
 * 
 * Components for displaying lists of items
 */

import React from 'react';
import styles from './List.module.css';

// ============================================================================
// List Component
// ============================================================================

export interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export const List: React.FC<ListProps> = ({ children, className }) => {
  return (
    <ul className={`${styles.list} ${className || ''}`}>
      {children}
    </ul>
  );
};

// ============================================================================
// ListItem Component
// ============================================================================

export interface ListItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({ 
  children, 
  icon,
  onClick,
  active = false,
  className 
}) => {
  const itemClassName = `${styles.listItem} ${active ? styles.listItemActive : ''} ${onClick ? styles.listItemClickable : ''} ${className || ''}`;
  
  return (
    <li className={itemClassName} onClick={onClick}>
      {icon && <div className={styles.listItemIcon}>{icon}</div>}
      <div className={styles.listItemContent}>{children}</div>
    </li>
  );
};
