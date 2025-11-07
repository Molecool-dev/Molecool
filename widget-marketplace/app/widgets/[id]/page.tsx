import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase-server';
import { PermissionsList } from '@/components/PermissionsList';
import { InstallButton } from '@/components/InstallButton';
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
    title: `${displayName} - Molecule Widget Marketplace`,
    description,
    openGraph: {
      title: displayName,
      description,
      images: widget.icon_url ? [widget.icon_url] : [],
    },
  };
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
  const authorEmail = widget.author_email || '';
  const downloads = widget.downloads || 0;
  const version = widget.version || '1.0.0';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
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
            {widget.icon_url ? (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={widget.icon_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Widget Title */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {displayName}
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                About
              </h2>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {description}
              </p>
            </section>

            {/* Permissions Section */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Permissions
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This widget requires the following permissions to function:
              </p>
              <div className="mt-4">
                <PermissionsList permissions={widget.permissions} />
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Install Button */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <InstallButton widgetId={widget.widget_id} />
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500">
                Requires Molecule Widget Container
              </p>
            </div>

            {/* Details Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Details
              </h3>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Version
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {version}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Author
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {authorName}
                    {authorEmail && (
                      <a
                        href={`mailto:${authorEmail}`}
                        className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg
                          className="inline h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </a>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Downloads
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {downloads.toLocaleString()}
                  </dd>
                </div>
                {widget.sizes?.default && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Default Size
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {widget.sizes.default.width} × {widget.sizes.default.height} px
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(widget.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
