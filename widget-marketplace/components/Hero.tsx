import * as React from 'react';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassMetric } from '@/components/glass/GlassMetric';
import { LightRays } from '@/components/effects/LightRays';

export interface HeroProps {
  widgetCount: number;
  downloadCount: number;
  developerCount: number;
}

export const Hero = React.memo(function Hero({
  widgetCount,
  downloadCount,
  developerCount,
}: HeroProps) {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Gradient background - fixed to cover entire viewport */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#1e3c72] via-[#2a5298] to-[#7e8ba3] -z-10" aria-hidden="true">
        <LightRays opacity={0.3} />
      </div>

      {/* Main content container with centering */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center gap-12">
        {/* Main floating panel - will-change applied via animate-float class */}
        <GlassPanel className="animate-float max-w-2xl w-full text-center">
          <h1 
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl font-light text-white mb-4 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
          >
            Molecool
          </h1>
          
          {/* Desktop Widgets Reimagined tagline */}
          <p className="text-xl sm:text-2xl text-cyan-300 mb-8 [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
            Desktop Widgets Reimagined
          </p>
          
          {/* Button group */}
          <div className="flex gap-4 justify-center flex-wrap" role="group" aria-label="Primary actions">
            <GlassButton variant="primary" size="lg" aria-label="Download Molecool application">
              Download Molecool
            </GlassButton>
            <GlassButton variant="secondary" size="lg" aria-label="Browse available widgets">
              Browse Widgets
            </GlassButton>
          </div>
        </GlassPanel>

        {/* Stats cards grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
          role="region"
          aria-label="Platform statistics"
        >
          <GlassMetric 
            value={widgetCount.toLocaleString()} 
            label="Widgets"
            aria-label={`${widgetCount.toLocaleString()} widgets available`}
          />
          <GlassMetric 
            value={downloadCount.toLocaleString()} 
            label="Downloads"
            aria-label={`${downloadCount.toLocaleString()} total downloads`}
          />
          <GlassMetric 
            value={developerCount.toLocaleString()} 
            label="Developers"
            aria-label={`${developerCount.toLocaleString()} developers contributing`}
          />
        </div>
      </div>
    </section>
  );
});
