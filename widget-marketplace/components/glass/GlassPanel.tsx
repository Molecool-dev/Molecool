import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  // className is already included in HTMLAttributes, but explicitly typed for clarity
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass surface styling
          "glass-surface",
          "rounded-xl",
          "relative",
          "overflow-hidden",
          // Default padding and spacing
          "p-6",
          className
        )}
        {...props}
      >
        {/* Reflection overlay */}
        <div className="absolute inset-0 glass-reflection rounded-xl pointer-events-none" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
export type { GlassPanelProps };
