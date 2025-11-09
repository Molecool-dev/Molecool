import React from 'react';

export const ReflectionOverlay = React.memo(function ReflectionOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
        borderRadius: 'inherit',
      }}
      aria-hidden="true"
    />
  );
});
