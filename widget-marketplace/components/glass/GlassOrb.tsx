import * as React from "react";
import { cn } from "@/lib/utils";

type OrbSize = "sm" | "md" | "lg" | "xl";

interface GlassOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: OrbSize;
  children: React.ReactNode;
  className?: string;
}

const sizeVariants: Record<OrbSize, string> = {
  sm: "w-12 h-12", // 48px
  md: "w-20 h-20", // 80px
  lg: "w-48 h-48", // 192px
  xl: "w-64 h-64", // 256px
};

const GlassOrb = React.forwardRef<HTMLDivElement, GlassOrbProps>(
  ({ size = "md", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass surface styling
          "glass-surface",
          "rounded-full",
          "relative",
          "overflow-hidden",
          // Circular container with aspect ratio
          "aspect-square",
          // Center children with flexbox
          "flex items-center justify-center",
          // Size variant
          sizeVariants[size],
          className
        )}
        {...props}
      >
        {/* Reflection overlay */}
        <div className="glass-reflection rounded-full" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassOrb.displayName = "GlassOrb";

export { GlassOrb };
export type { GlassOrbProps, OrbSize };
