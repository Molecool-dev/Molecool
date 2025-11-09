'use client';

import { GlassButton } from '@/components/glass/GlassButton';

interface InstallButtonProps {
  widgetId: string;
}

export function InstallButton({ widgetId }: InstallButtonProps) {
  const handleInstall = () => {
    // Open the custom protocol URL to trigger installation in Widget Container
    window.location.href = `widget://install/${widgetId}`;
  };

  return (
    <GlassButton
      onClick={handleInstall}
      variant="primary"
      size="lg"
      className="w-full"
      aria-label={`Install widget ${widgetId}`}
    >
      🚀 Install Widget
    </GlassButton>
  );
}
