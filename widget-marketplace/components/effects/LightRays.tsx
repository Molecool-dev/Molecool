import React from 'react';

interface LightRaysProps {
  opacity?: number;
  rayCount?: number;
}

export const LightRays = React.memo(function LightRays({ 
  opacity = 0.3, 
  rayCount = 8 
}: LightRaysProps) {
  const rotationStep = 360 / rayCount;
  
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: rayCount }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0, 212, 255, ${opacity}) 50%, transparent 100%)`,
            transform: `rotate(${i * rotationStep}deg)`,
            animation: `ray-pulse 4s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  );
});
