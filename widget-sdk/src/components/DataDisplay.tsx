/**
 * Data Display Components
 * 
 * Components for displaying data and statistics
 */

import React from 'react';
import styles from './DataDisplay.module.css';

// ============================================================================
// Stat Component
// ============================================================================

export interface StatProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Stat: React.FC<StatProps> = ({ 
  label, 
  value, 
  color,
  icon,
  className 
}) => {
  return (
    <div className={`${styles.stat} ${className || ''}`}>
      {icon && <div className={styles.statIcon}>{icon}</div>}
      <div className={styles.statContent}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue} style={{ color }}>
          {value}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ProgressBar Component
// ============================================================================

export interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  color = '#3b82f6',
  showLabel = true,
  className 
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className={`${styles.progressBar} ${className || ''}`}>
      <div className={styles.progressBarTrack}>
        <div 
          className={styles.progressBarFill}
          style={{ 
            width: `${clampedValue}%`, 
            backgroundColor: color 
          }}
        />
      </div>
      {showLabel && (
        <span className={styles.progressBarLabel}>
          {clampedValue.toFixed(0)}%
        </span>
      )}
    </div>
  );
};
