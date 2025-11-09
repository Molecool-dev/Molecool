import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const GlassBadge = React.forwardRef<HTMLDivElement, GlassBadgeProps>(
  ({ icon, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base badge styling
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          // Glass material styling
          "bg-white/10",
          "backdrop-blur-[var(--glass-blur)]",
          "border-white/30",
          "text-white font-medium",
          // Inset highlight shadow for depth
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          // Hover state
          "hover:bg-white/20",
          "transition-all duration-200 ease-out",
          // Text readability
          "[text-shadow:0_1px_3px_rgba(0,0,0,0.3)]",
          // Spacing for icon
          icon && "gap-1.5",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </div>
    );
  }
);

GlassBadge.displayName = "GlassBadge";

export { GlassBadge };
