import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "warning";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          // Base glass surface styling
          "glass-surface",
          "rounded-xl",
          "relative",
          "overflow-hidden",
          "transition-all duration-300 ease-out",
          // Hover state
          "hover:shadow-[0_20px_60px_rgba(0,212,255,0.4),0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.6)]",
          "hover:border-white/50",
          // Warning variant
          variant === "warning" && "border-yellow-500/50",
          // Performance optimization for hover animations
          "will-change-auto hover:will-change-transform",
          className
        )}
        {...props}
      >
        {/* Reflection overlay */}
        <div className="glass-reflection rounded-xl" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </Card>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export type { GlassCardProps };
