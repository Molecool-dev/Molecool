'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  asChild?: boolean;
}

// Shared styles for both variants
const baseStyles = cn(
  'relative overflow-hidden',
  'text-white font-medium',
  'transition-all duration-300 ease-out',
  'before:absolute before:inset-x-0 before:top-0 before:h-[1px]',
  'before:pointer-events-none',
  // Text readability on glass surfaces
  '[text-shadow:0_1px_3px_rgba(0,0,0,0.3)]',
  // Only apply will-change on hover for better performance
  'hover:will-change-transform',
  'hover:-translate-y-[0.5px] hover:scale-105'
);

const variantStyles = {
  primary: cn(
    baseStyles,
    'bg-gradient-to-r from-cyan-500 to-blue-500',
    'shadow-[0_0_20px_rgba(0,212,255,0.6)]',
    'hover:shadow-[0_0_30px_rgba(0,212,255,0.8)]',
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
  ),
  secondary: cn(
    baseStyles,
    'bg-white/10 backdrop-blur-sm',
    'border border-white/30',
    'shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]',
    'hover:bg-white/20',
    'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent'
  ),
};

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size, children, onClick, disabled, asChild, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<
      Array<{ x: number; y: number; id: number }>
    >([]);
    const timeoutRefs = React.useRef<Set<NodeJS.Timeout>>(new Set());

    React.useEffect(() => {
      // Cleanup all timeouts on unmount
      return () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current.clear();
      };
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Don't create ripple if button is disabled
      if (!disabled) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        
        // Limit ripples to prevent memory issues with rapid clicks
        setRipples((prev) => {
          const updated = [...prev, newRipple];
          return updated.length > 3 ? updated.slice(-3) : updated;
        });

        // Remove ripple after animation completes
        const timeout = setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
          timeoutRefs.current.delete(timeout);
        }, 600);
        
        timeoutRefs.current.add(timeout);
      }

      // Call the original onClick handler
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(variantStyles[variant], className)}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        asChild={asChild}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_0.6s_ease-out] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
            }}
          />
        ))}
      </Button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export { GlassButton };
