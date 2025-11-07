/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { WidgetError, toWidgetError } from '../types/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: WidgetError, reset: () => void) => ReactNode;
  onError?: (error: WidgetError, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: WidgetError | null;
}

/**
 * ErrorBoundary - Catches errors in child components
 * 
 * Provides a fallback UI when an error occurs and prevents
 * the entire widget from crashing.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyWidget />
 * </ErrorBoundary>
 * ```
 * 
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Error: {error.message}</h1>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <MyWidget />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Convert to WidgetError
    const widgetError = toWidgetError(error);
    
    return {
      hasError: true,
      error: widgetError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Convert to WidgetError
    const widgetError = toWidgetError(error);
    
    // Log error details
    console.error('[ErrorBoundary] Caught error:', {
      error: widgetError.toJSON(),
      componentStack: errorInfo.componentStack
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(widgetError, errorInfo);
    }
  }

  /**
   * Reset the error boundary state
   * Allows the user to try rendering the component again
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }
      
      // Default fallback UI
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            Widget Error
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '16px'
            }}
          >
            {this.state.error.getUserMessage()}
          </p>
          <button
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
            }}
          >
            Try Again
          </button>
          {import.meta.env.DEV && (
            <details
              style={{
                marginTop: '16px',
                textAlign: 'left',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {JSON.stringify(this.state.error.toJSON(), null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
