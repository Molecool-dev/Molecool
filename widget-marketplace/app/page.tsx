import { WidgetGallery } from '@/components/WidgetGallery';
import { createServerClient } from '@/lib/supabase-server';

async function getWidgets() {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Molecool Widget Marketplace
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Discover and install desktop widgets for your workspace
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-white">
              <svg
                className="h-5 w-5"
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
              <span className="font-semibold">{widgets.length} Widgets</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <WidgetGallery widgets={widgets} />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Molecool Widget Platform &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-2">
            Built with Next.js, Supabase, and Electron
          </p>
        </div>
      </footer>
    </div>
  );
}
