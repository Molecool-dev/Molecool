'use client';

import { useState, useMemo } from 'react';
import { WidgetCard } from './WidgetCard';
import { SearchBar } from './SearchBar';
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
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWidgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      ) : (
        !searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No widgets available
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Check back later for new widgets
            </p>
          </div>
        )
      )}
    </div>
  );
}
