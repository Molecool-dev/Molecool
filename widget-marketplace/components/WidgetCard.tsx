import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Widget } from '@/lib/database.types';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassOrb } from '@/components/glass/GlassOrb';
import { GlowRing } from '@/components/effects/GlowRing';
import { ReflectionOverlay } from '@/components/effects/ReflectionOverlay';

interface WidgetCardProps {
  widget: Widget;
}

// Extract SVG icons as constants to avoid repetition
const UserIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export const WidgetCard = React.memo(function WidgetCard({ widget }: WidgetCardProps) {
  const displayName = widget.display_name || widget.name || 'Unnamed Widget';
  const description = widget.description || 'No description available';
  const authorName = widget.author_name || 'Unknown';
  const downloads = widget.downloads || 0;
  const version = widget.version || '1.0.0';

  return (
    <Link
      href={`/widgets/${widget.widget_id}`}
      className="group block"
      aria-label={`View ${displayName} widget details`}
    >
      <GlassCard 
        className="transition-all duration-[400ms] hover:translate-y-[-12px] hover:scale-[1.02] will-change-transform"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Aero title bar */}
        <div 
          className="h-2 rounded-t-xl bg-gradient-to-r from-cyan-500/80 to-blue-500/60"
          aria-hidden="true"
        />
        
        {/* Glow ring effect on hover */}
        <GlowRing />
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Widget Icon in GlassOrb */}
            <GlassOrb size="sm" className="flex-shrink-0">
              {widget.icon_url ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={widget.icon_url}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
                  aria-hidden="true"
                >
                  <span className="text-sm font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <ReflectionOverlay />
            </GlassOrb>

            {/* Widget Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {displayName}
              </h3>
              <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                {description}
              </p>
              
              {/* Metadata */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1" title={`Author: ${authorName}`}>
                  <UserIcon />
                  <span className="sr-only">Author:</span>
                  {authorName}
                </span>
                <span className="flex items-center gap-1" title={`${downloads.toLocaleString()} downloads`}>
                  <DownloadIcon />
                  <span className="sr-only">Downloads:</span>
                  {downloads.toLocaleString()}
                </span>
                <span className="text-gray-500" title={`Version ${version}`}>
                  <span className="sr-only">Version:</span>
                  v{version}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
});
