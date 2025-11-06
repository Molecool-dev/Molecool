/**
 * Link Component
 * 
 * Styled anchor element for navigation
 */

import React from 'react';
import styles from './Link.module.css';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ 
  children, 
  variant = 'default',
  className,
  ...anchorProps
}) => {
  return (
    <a 
      className={`${styles.link} ${styles[`link-${variant}`]} ${className || ''}`}
      {...anchorProps}
    >
      {children}
    </a>
  );
};
