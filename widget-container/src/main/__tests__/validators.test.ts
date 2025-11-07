/**
 * Validators Tests
 * 
 * Tests for validation utility functions
 */

import {
  isNonEmptyString,
  isPositiveNumber,
  isBoolean,
  isObject,
  isStringArray,
  isValidWidgetId,
  isValidHttpsUrl,
  isValidEmail,
  isValidVersion,
  createValidationResult,
  combineValidationResults
} from '../validators';

describe('Validators', () => {
  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('  test  ')).toBe(true);
    });

    it('should return false for empty or whitespace strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString('\t\n')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
      expect(isPositiveNumber(1000)).toBe(true);
    });

    it('should return false for zero and negative numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.1)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isPositiveNumber('1')).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
    });

    it('should return false for null and arrays', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe('isStringArray', () => {
    it('should return true for string arrays', () => {
      expect(isStringArray(['a', 'b', 'c'])).toBe(true);
      expect(isStringArray([])).toBe(true);
      expect(isStringArray(['single'])).toBe(true);
    });

    it('should return false for mixed arrays', () => {
      expect(isStringArray(['a', 1, 'c'])).toBe(false);
      expect(isStringArray([1, 2, 3])).toBe(false);
    });

    it('should return false for non-arrays', () => {
      expect(isStringArray('string')).toBe(false);
      expect(isStringArray({})).toBe(false);
    });
  });

  describe('isValidWidgetId', () => {
    it('should return true for valid widget IDs', () => {
      expect(isValidWidgetId('clock-widget')).toBe(true);
      expect(isValidWidgetId('system_monitor')).toBe(true);
      expect(isValidWidgetId('widget123')).toBe(true);
      expect(isValidWidgetId('a')).toBe(true);
    });

    it('should return false for invalid characters', () => {
      expect(isValidWidgetId('widget@123')).toBe(false);
      expect(isValidWidgetId('widget.name')).toBe(false);
      expect(isValidWidgetId('widget name')).toBe(false);
      expect(isValidWidgetId('widget/path')).toBe(false);
    });

    it('should return false for empty or too long IDs', () => {
      expect(isValidWidgetId('')).toBe(false);
      expect(isValidWidgetId('a'.repeat(101))).toBe(false);
    });
  });

  describe('isValidHttpsUrl', () => {
    it('should return true for valid HTTPS URLs', () => {
      expect(isValidHttpsUrl('https://example.com')).toBe(true);
      expect(isValidHttpsUrl('https://api.example.com/path')).toBe(true);
      expect(isValidHttpsUrl('https://example.com:8080')).toBe(true);
    });

    it('should return false for HTTP URLs', () => {
      expect(isValidHttpsUrl('http://example.com')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidHttpsUrl('not-a-url')).toBe(false);
      expect(isValidHttpsUrl('ftp://example.com')).toBe(false);
      expect(isValidHttpsUrl('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidVersion', () => {
    it('should return true for valid semantic versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('0.0.1')).toBe(true);
      expect(isValidVersion('10.20.30')).toBe(true);
    });

    it('should return false for invalid versions', () => {
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0-beta')).toBe(false);
    });
  });

  describe('createValidationResult', () => {
    it('should create valid result', () => {
      const result = createValidationResult(true);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should create invalid result with errors', () => {
      const result = createValidationResult(false, ['Error 1', 'Error 2']);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('combineValidationResults', () => {
    it('should combine all valid results', () => {
      const result = combineValidationResults(
        createValidationResult(true),
        createValidationResult(true),
        createValidationResult(true)
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should combine with one invalid result', () => {
      const result = combineValidationResults(
        createValidationResult(true),
        createValidationResult(false, ['Error 1']),
        createValidationResult(true)
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1']);
    });

    it('should combine multiple invalid results', () => {
      const result = combineValidationResults(
        createValidationResult(false, ['Error 1']),
        createValidationResult(false, ['Error 2', 'Error 3']),
        createValidationResult(true)
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2', 'Error 3']);
    });
  });
});
