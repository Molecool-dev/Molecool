import { describe, it, expect } from 'vitest';

describe('HomePage calculations', () => {
  it('should calculate widget count correctly', () => {
    const widgets = [
      { id: '1', author_name: 'Alice', downloads: 100 },
      { id: '2', author_name: 'Bob', downloads: 200 },
      { id: '3', author_name: 'Alice', downloads: 150 },
    ];

    const widgetCount = widgets.length;
    expect(widgetCount).toBe(3);
  });

  it('should calculate total downloads correctly', () => {
    const widgets = [
      { downloads: 100 },
      { downloads: 200 },
      { downloads: 150 },
    ];

    const downloadCount = widgets.reduce((sum, widget) => sum + (widget.downloads || 0), 0);
    expect(downloadCount).toBe(450);
  });

  it('should handle missing downloads gracefully', () => {
    const widgets = [
      { downloads: 100 },
      { downloads: null },
      { downloads: undefined },
    ];

    const downloadCount = widgets.reduce((sum, widget) => sum + (widget.downloads || 0), 0);
    expect(downloadCount).toBe(100);
  });

  it('should calculate unique developer count correctly', () => {
    const widgets = [
      { author_name: 'Alice' },
      { author_name: 'Bob' },
      { author_name: 'Alice' },
      { author_name: 'Charlie' },
    ];

    const developerCount = new Set(
      widgets.map(widget => widget.author_name).filter(Boolean)
    ).size;
    expect(developerCount).toBe(3);
  });

  it('should filter out null/undefined author names', () => {
    const widgets = [
      { author_name: 'Alice' },
      { author_name: null },
      { author_name: undefined },
      { author_name: 'Bob' },
      { author_name: '' },
    ];

    const developerCount = new Set(
      widgets.map(widget => widget.author_name).filter(Boolean)
    ).size;
    expect(developerCount).toBe(2); // Only Alice and Bob
  });
});
