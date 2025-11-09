import type { WidgetPermissions } from '@/lib/database.types';
import type { ReactNode } from 'react';

interface PermissionsListProps {
  permissions: WidgetPermissions;
}

interface PermissionItem {
  icon: ReactNode;
  title: string;
  description: string;
}

const ShieldIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const CpuIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

const MemoryIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    />
  </svg>
);

const NetworkIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

export function PermissionsList({ permissions }: PermissionsListProps) {
  const permissionItems: PermissionItem[] = [];

  // Check for system info permissions
  if (permissions.systemInfo?.cpu) {
    permissionItems.push({
      icon: <CpuIcon />,
      title: 'CPU Usage',
      description: 'Read CPU usage information to monitor system performance',
    });
  }

  if (permissions.systemInfo?.memory) {
    permissionItems.push({
      icon: <MemoryIcon />,
      title: 'Memory Usage',
      description: 'Read memory usage information to monitor system resources',
    });
  }

  // Check for network permissions
  if (permissions.network?.enabled) {
    const domains = permissions.network.allowedDomains || [];
    const domainText = domains.length > 0
      ? `Access to: ${domains.join(', ')}`
      : 'Access to external APIs';
    
    permissionItems.push({
      icon: <NetworkIcon />,
      title: 'Network Access',
      description: domainText,
    });
  }

  // If no permissions are required
  if (permissionItems.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-green-500/10 border border-green-500/30 p-4 backdrop-blur-sm">
        <div className="flex-shrink-0 text-green-400" aria-hidden="true">
          <ShieldIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
            No special permissions required
          </p>
          <p className="mt-1 text-sm text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
            This widget runs in a secure sandbox with no access to system resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {permissionItems.map((item) => (
        <li
          key={item.title}
          className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm"
        >
          <div className="flex-shrink-0 text-cyan-400" aria-hidden="true">
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
              {item.title}
            </p>
            <p className="mt-1 text-sm text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
