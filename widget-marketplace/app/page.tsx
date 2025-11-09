import { WidgetGallery } from '@/components/WidgetGallery';
import { Hero } from '@/components/Hero';
import { createServerClient } from '@/lib/supabase-server';
import type { Widget } from '@/lib/database.types';

async function getWidgets(): Promise<Widget[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .order('downloads', { ascending: false });

  if (error) {
    console.error('Error fetching widgets:', error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const widgets = await getWidgets();

  const widgetCount = widgets.length;
  const downloadCount = widgets.reduce((sum, widget) => sum + (widget.downloads || 0), 0);
  const developerCount = new Set(
    widgets.map(widget => widget.author_name).filter(Boolean)
  ).size;

  return (
    <>
      <Hero 
        widgetCount={widgetCount}
        downloadCount={downloadCount}
        developerCount={developerCount}
      />

      <main className="relative z-10 container mx-auto px-4 py-16">
        <WidgetGallery widgets={widgets} />
      </main>

      <footer className="relative z-10 mt-16 py-8 border-t border-white/20">
        <div className="container mx-auto px-4 text-center text-sm text-white/80 [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
          <p>
            Molecool Widget Platform &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-2">
            Built with Next.js, Supabase, and Electron
          </p>
        </div>
      </footer>
    </>
  );
}
