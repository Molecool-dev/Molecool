'use client';

interface InstallButtonProps {
  widgetId: string;
}

export function InstallButton({ widgetId }: InstallButtonProps) {
  const handleInstall = () => {
    // Open the custom protocol URL to trigger installation in Widget Container
    window.location.href = `widget://install/${widgetId}`;
  };

  return (
    <button
      onClick={handleInstall}
      className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Install widget ${widgetId}`}
    >
      Install Widget
    </button>
  );
}
