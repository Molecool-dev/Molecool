import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionsList } from '../PermissionsList';
import type { WidgetPermissions } from '@/lib/database.types';

describe('PermissionsList', () => {
  it('should show no permissions message when no permissions required', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: false, memory: false },
      network: { enabled: false },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText(/no special permissions required/i)).toBeInTheDocument();
  });

  it('should display CPU permission', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: true, memory: false },
      network: { enabled: false },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText(/read cpu usage information/i)).toBeInTheDocument();
  });

  it('should display memory permission', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: false, memory: true },
      network: { enabled: false },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText(/read memory usage information/i)).toBeInTheDocument();
  });

  it('should display network permission', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: false, memory: false },
      network: { enabled: true },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText('Network Access')).toBeInTheDocument();
    expect(screen.getByText(/access to external apis/i)).toBeInTheDocument();
  });

  it('should display network permission with allowed domains', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: false, memory: false },
      network: { enabled: true, allowedDomains: ['api.weather.com', 'api.example.com'] },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText('Network Access')).toBeInTheDocument();
    expect(screen.getByText(/access to: api\.weather\.com, api\.example\.com/i)).toBeInTheDocument();
  });

  it('should display multiple permissions', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: true, memory: true },
      network: { enabled: true },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('Network Access')).toBeInTheDocument();
  });

  it('should render as a list with proper ARIA role', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: true, memory: false },
      network: { enabled: false },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('should show security message for no permissions', () => {
    const permissions: WidgetPermissions = {
      systemInfo: { cpu: false, memory: false },
      network: { enabled: false },
    };
    
    render(<PermissionsList permissions={permissions} />);
    
    expect(screen.getByText(/runs in a secure sandbox/i)).toBeInTheDocument();
  });
});
