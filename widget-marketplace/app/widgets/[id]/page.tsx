import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase-server';
import { PermissionsList } from '@/components/PermissionsList';
import { InstallButton } from '@/components/InstallButton';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { GlassOrb } from '@/components/glass/GlassOrb';
import { GlassMetric } from '@/components/glass/GlassMetric';
import { GlassCard } from '@/components/glass/GlassCard';
import { CardHeader, CardContent } from '@/components/ui/card';
import type { Widget } from '@/lib/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWidget(widgetId: string): Promise<Widget | null> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('widget_id', widgetId)
      .single();

    if (error) {
      console.error('Error fetching widget:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching widget:', error);
    return null;
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const widget = await getWidget(id);

  if (!widget) {
    return {
      title: 'Widget Not Found',
    };
  }

  const displayName = widget.display_name || widget.name || 'Unnamed Widget';
  const description = widget.description || 'No description available';

  return {
    title: `${displayName} - Molecool Widget Marketplace`,
    description,
    openGraph: {
      title: displayName,
      description,
      images: widget.icon_url ? [widget.icon_url] : [],
    },
  };
}

// Helper component for widget icon rendering
function WidgetIcon({ 
  widget, 
  displayName, 
  size 
}: { 
  widget: Widget; 
  displayName: string; 
  size: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeMap = {
    sm: { container: 'w-16 h-16', text: 'text-3xl' },
    md: { container: 'w-24 h-24', text: 'text-5xl' },
    lg: { container: 'w-32 h-32', text: 'text-5xl' },
    xl: { container: 'w-48 h-48', text: 'text-8xl' },
  };

  const { container, text } = sizeMap[size];

  return (
    <GlassOrb size={size}>
      {widget.icon_url ? (
        <div className={`relative ${container}`}>
          <Image
            src={widget.icon_url}
            alt={`${displayName} icon`}
            fill
            sizes={size === 'xl' ? '192px' : size === 'lg' ? '128px' : size === 'md' ? '96px' : '64px'}
            className="object-cover rounded-full"
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center ${container} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full`}>
          <span className={`${text} font-bold text-white`} aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </GlassOrb>
  );
}

export default async function WidgetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const widget = await getWidget(id);

  if (!widget) {
    notFound();
  }

  const displayName = widget.display_name || widget.name || 'Unnamed Widget';
  const description = widget.description || 'No description available';
  const authorName = widget.author_name || 'Unknown';
  const downloads = widget.downloads || 0;
  const version = widget.version || '1.0.0';
  
  // Consistent date formatting
  const lastUpdated = new Date(widget.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#1e3c72] to-[#7e8ba3]" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Marketplace
            </a>
          </nav>
          <div className="flex items-start gap-6">
            {/* Widget Icon */}
            <WidgetIcon widget={widget} displayName={displayName} size="lg" />

            {/* Widget Title */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                {displayName}
              </h1>
              <p className="mt-2 text-lg text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <GlassCard>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                  About
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                  {description}
                </p>
              </CardContent>
            </GlassCard>

            {/* Permissions Section */}
            <GlassCard variant="warning">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">⚠️</span>
                  <h2 className="text-2xl font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                    Permissions
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80 mb-4 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                  This widget requires the following permissions to function:
                </p>
                <PermissionsList permissions={widget.permissions} />
              </CardContent>
            </GlassCard>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            <GlassPanel className="sticky top-6 space-y-6">
              {/* Widget Icon */}
              <div className="flex justify-center">
                <WidgetIcon widget={widget} displayName={displayName} size="xl" />
              </div>

              {/* Install Button */}
              <InstallButton widgetId={widget.widget_id} />
              <p className="text-center text-xs text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                Requires Molecool Widget Container
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <GlassMetric 
                  value={version} 
                  label="Version" 
                />
                <GlassMetric 
                  value={downloads.toLocaleString()} 
                  label="Downloads" 
                />
                <GlassMetric 
                  value={authorName} 
                  label="Author" 
                  className="col-span-2"
                />
                {widget.sizes?.default && (
                  <GlassMetric 
                    value={`${widget.sizes.default.width}×${widget.sizes.default.height}`} 
                    label="Size (px)" 
                    className="col-span-2"
                  />
                )}
                <GlassMetric 
                  value={lastUpdated} 
                  label="Last Updated" 
                  className="col-span-2"
                />
              </div>
            </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
