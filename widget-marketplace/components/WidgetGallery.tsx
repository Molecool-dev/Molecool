'use client';

import { useState, useMemo } from 'react';
import { WidgetCard } from './WidgetCard';
import { SearchBar } from './SearchBar';
import { GlassCard } from './glass/GlassCard';
import type { Widget } from '@/lib/database.types';

interface WidgetGalleryProps {
  widgets: Widget[];
}

export function WidgetGallery({ widgets }: WidgetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter widgets based on search query
  const filteredWidgets = useMemo(() => {
    if (!searchQuery.trim()) {
      return widgets;
    }

    const query = searchQuery.toLowerCase();
    return widgets.filter(
      (widget) =>
        widget.display_name.toLowerCase().includes(query) ||
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query) ||
        widget.author_name.toLowerCase().includes(query)
    );
  }, [widgets, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search widgets by name, description, or author..."
        />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div 
          className="text-center text-sm text-white/80 glass-text"
          role="status"
          aria-live="polite"
        >
          {filteredWidgets.length === 0 ? (
            <p>No widgets found matching &quot;{searchQuery}&quot;</p>
          ) : (
            <p>
              Found {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}

      {/* Widget Grid */}
      {filteredWidgets.length > 0 ? (
        <div 
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Widget gallery"
        >
          {filteredWidgets.map((widget) => (
            <div key={widget.id} role="listitem">
              <WidgetCard widget={widget} />
            </div>
          ))}
        </div>
      ) : (
        !searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GlassCard className="p-12 max-w-md">
              <svg
                className="h-16 w-16 mx-auto text-cyan-300/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-6 text-lg font-semibold text-white glass-text">
                No widgets available
              </h3>
              <p className="mt-2 text-white/80 glass-text">
                Check back later for new widgets
              </p>
            </GlassCard>
          </div>
        )
      )}
    </div>
  );
}
