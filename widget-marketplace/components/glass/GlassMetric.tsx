import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  className?: string;
}

const GlassMetric = React.forwardRef<HTMLDivElement, GlassMetricProps>(
  ({ value, label, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass surface styling
          "glass-surface",
          "rounded-xl",
          "relative",
          "overflow-hidden",
          // Default padding
          "p-6",
          // Flexbox for vertical layout
          "flex flex-col items-center justify-center",
          "text-center",
          // Hover state with subtle lift
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,212,255,0.3)]",
          // Performance optimization
          "will-change-transform",
          className
        )}
        {...props}
      >
        {/* Reflection overlay */}
        <div className="absolute inset-0 glass-reflection rounded-xl pointer-events-none" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {/* Value - prominently displayed with large text */}
          <div className="text-4xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
            {value}
          </div>
          
          {/* Label - smaller text below value */}
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
            {label}
          </div>
        </div>
      </div>
    );
  }
);

GlassMetric.displayName = "GlassMetric";

export { GlassMetric };
export type { GlassMetricProps };
