import React from 'react';

export const GlowRing = React.memo(function GlowRing() {
  return (
    <div
      className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        inset: '-2px',
        background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.8) 0%, transparent 50%, rgba(0, 212, 255, 0.8) 100%)',
        filter: 'blur(8px)',
        animation: 'rotate-glow 3s linear infinite',
        borderRadius: 'inherit',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
});
