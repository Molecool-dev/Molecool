/**
 * Validation Utilities
 * 
 * Reusable validation functions to reduce code duplication
 */

/**
 * Validate that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}

/**
 * Validate that a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Validate that a value is an object (not null or array)
 */
export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate that a value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Validate widget ID format
 * Widget IDs should be alphanumeric with hyphens/underscores only
 */
export function isValidWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(widgetId) && widgetId.length > 0 && widgetId.length <= 100;
}

/**
 * Validate URL format (HTTPS only for security)
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate semantic version format (e.g., "1.0.0")
 */
export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Create a validation result
 */
export function createValidationResult(valid: boolean, errors: string[] = []): ValidationResult {
  return { valid, errors };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  return {
    valid: results.every(r => r.valid),
    errors: allErrors
  };
}
