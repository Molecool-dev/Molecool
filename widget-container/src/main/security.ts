import { session, OnBeforeRequestListenerDetails, OnHeadersReceivedListenerDetails } from 'electron';
import { WidgetConfig } from '../types';

/**
 * Security Manager
 * Handles Content Security Policy (CSP) and network security
 * Requirements: 2.3, 2.5
 */

export class SecurityManager {
  private widgetConfigs: Map<string, WidgetConfig> = new Map();
  private isInitialized = false;

  /**
   * Initialize security policies
   * Sets up CSP headers and network request filtering
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('Security manager already initialized, skipping...');
      return;
    }

    console.log('Initializing security manager...');

    // Set up CSP headers
    this.setupCSP();

    // Set up network request filtering (HTTPS only)
    this.setupNetworkFiltering();

    this.isInitialized = true;
    console.log('Security manager initialized');
  }

  /**
   * Register a widget configuration for CSP
   * Allows dynamic CSP based on widget permissions
   */
  registerWidget(widgetId: string, config: WidgetConfig): void {
    this.widgetConfigs.set(widgetId, config);
    console.log(`Registered widget for CSP: ${widgetId}`);
  }

  /**
   * Unregister a widget configuration
   */
  unregisterWidget(widgetId: string): void {
    this.widgetConfigs.delete(widgetId);
    console.log(`Unregistered widget from CSP: ${widgetId}`);
  }

  /**
   * Set up Content Security Policy headers
   * Requirement: 2.3 - CSP configuration
   */
  private setupCSP(): void {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      try {
        // Build CSP based on the request
        const csp = this.buildCSP(details);

        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [csp]
          }
        });
      } catch (error) {
        console.error('Error building CSP:', error);
        // Fallback to strict CSP on error
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': ["default-src 'none'; script-src 'self'; style-src 'self'"]
          }
        });
      }
    });

    console.log('CSP headers configured');
  }

  /**
   * Build CSP string based on widget configuration
   * Dynamically sets connect-src based on allowed domains
   */
  private buildCSP(details: OnHeadersReceivedListenerDetails): string {
    // Base CSP - very restrictive
    const cspDirectives: string[] = [
      "default-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for dynamic styles
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'"
    ];

    // Try to determine which widget this request is for
    // and add its allowed domains to connect-src and img-src
    const allowedDomains = this.getAllowedDomainsForRequest(details);
    
    if (allowedDomains.length > 0) {
      // Replace connect-src with allowed domains
      const connectSrcIndex = cspDirectives.findIndex(d => d.startsWith('connect-src'));
      if (connectSrcIndex !== -1) {
        cspDirectives[connectSrcIndex] = `connect-src 'self' ${allowedDomains.join(' ')}`;
      }

      // Allow images from allowed domains only
      const imgSrcIndex = cspDirectives.findIndex(d => d.startsWith('img-src'));
      if (imgSrcIndex !== -1) {
        cspDirectives[imgSrcIndex] = `img-src 'self' data: ${allowedDomains.join(' ')}`;
      }
    }

    return cspDirectives.join('; ');
  }

  /**
   * Get allowed domains for a specific request
   * Checks all registered widgets and returns their allowed domains
   */
  private getAllowedDomainsForRequest(details: OnHeadersReceivedListenerDetails): string[] {
    const allowedDomains = new Set<string>();

    // Add allowed domains from all registered widgets
    // In a more sophisticated implementation, we could track which window
    // made the request and only allow that widget's domains
    for (const config of this.widgetConfigs.values()) {
      if (config.permissions?.network?.enabled) {
        const domains = config.permissions.network.allowedDomains || [];
        domains.forEach(domain => {
          const validatedDomain = this.validateAndNormalizeDomain(domain);
          if (validatedDomain) {
            allowedDomains.add(validatedDomain);
          }
        });
      }
    }

    return Array.from(allowedDomains);
  }

  /**
   * Validate and normalize domain for CSP
   * Returns null if domain is invalid
   */
  private validateAndNormalizeDomain(domain: string): string | null {
    try {
      // Remove whitespace
      domain = domain.trim();

      // Reject empty or suspicious patterns
      if (!domain || domain.includes('*') || domain.includes('<') || domain.includes('>')) {
        console.warn(`Invalid domain pattern rejected: ${domain}`);
        return null;
      }

      // Add https:// if no protocol specified
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = `https://${domain}`;
      }

      // Parse to validate
      const url = new URL(domain);

      // Only allow HTTPS (reject HTTP for security)
      if (url.protocol !== 'https:') {
        console.warn(`Non-HTTPS domain rejected: ${domain}`);
        return null;
      }

      // Return normalized domain (protocol + hostname)
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      console.warn(`Failed to validate domain: ${domain}`, error);
      return null;
    }
  }

  /**
   * Set up network request filtering
   * Blocks HTTP requests, only allows HTTPS
   * Requirement: 2.5 - HTTPS only
   */
  private setupNetworkFiltering(): void {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['*://*/*'] },
      (details, callback) => {
        try {
          const shouldBlock = this.shouldBlockRequest(details);

          if (shouldBlock) {
            console.warn(`Blocked insecure request: ${details.url}`);
            callback({ cancel: true });
          } else {
            callback({ cancel: false });
          }
        } catch (error) {
          console.error('Error in network filtering:', error);
          // On error, block the request for security
          callback({ cancel: true });
        }
      }
    );

    console.log('Network filtering configured (HTTPS only)');
  }

  /**
   * Determine if a request should be blocked
   * Blocks HTTP requests (except localhost for development)
   */
  private shouldBlockRequest(details: OnBeforeRequestListenerDetails): boolean {
    try {
      const url = new URL(details.url);

      // Allow file:// protocol for local widget files
      if (url.protocol === 'file:') {
        return false;
      }

      // Allow devtools protocol
      if (url.protocol === 'devtools:' || url.protocol === 'chrome-extension:') {
        return false;
      }

      // Allow data: URLs for inline resources
      if (url.protocol === 'data:') {
        return false;
      }

      // Allow localhost for development (both HTTP and HTTPS)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return false;
      }

      // Block HTTP requests (only allow HTTPS)
      if (url.protocol === 'http:') {
        return true;
      }

      // Allow HTTPS
      if (url.protocol === 'https:') {
        return false;
      }

      // Block unknown protocols
      return true;
    } catch (error) {
      // If URL parsing fails, block the request
      console.error('Failed to parse URL for security check:', details.url, error);
      return true;
    }
  }

  /**
   * Clean up security manager
   * Removes all request listeners
   */
  destroy(): void {
    console.log('Cleaning up security manager...');
    
    // Clear widget configs
    this.widgetConfigs.clear();
    
    // Reset initialization flag
    this.isInitialized = false;
    
    // Note: Electron doesn't provide a way to remove webRequest listeners
    // They will be cleaned up when the session is destroyed
    
    console.log('Security manager cleanup complete');
  }
}
