/**
 * Logger Utility
 * 
 * Centralized logging for the widget container
 * Provides consistent log formatting and levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;

  constructor(prefix: string = 'Molecule') {
    this.prefix = prefix;
    
    // Set log level from environment variable
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel];
    }
  }

  /**
   * Format log message with timestamp and prefix
   */
  private format(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] [${level}] ${message}`;
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.format('DEBUG', message), ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format('INFO', message), ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format('WARN', message), ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format('ERROR', message), error, ...args);
    }
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    return new Logger(`${this.prefix}:${context}`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for creating child loggers
export function createLogger(context: string): Logger {
  return logger.child(context);
}
