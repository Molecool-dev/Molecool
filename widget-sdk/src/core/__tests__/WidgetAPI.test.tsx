/**
 * Tests for Widget API
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockAPI } from '../WidgetAPI';

describe('WidgetAPI', () => {
  describe('createMockAPI', () => {
    let api: ReturnType<typeof createMockAPI>;

    beforeEach(() => {
      api = createMockAPI();
    });

    it('should create a mock API with all required interfaces', () => {
      expect(api).toBeDefined();
      expect(api.storage).toBeDefined();
      expect(api.settings).toBeDefined();
      expect(api.system).toBeDefined();
      expect(api.ui).toBeDefined();
      expect(api.widgetId).toBeDefined();
      expect(api.config).toBeDefined();
    });

    it('should have a valid widget config', () => {
      expect(api.config.id).toBe('mock-widget-dev');
      expect(api.config.displayName).toBe('Mock Widget (Development)');
      expect(api.config.version).toBe('1.0.0');
      expect(api.config.permissions).toBeDefined();
      expect(api.config.sizes).toBeDefined();
    });

    describe('Storage API', () => {
      it('should set and get values', async () => {
        await api.storage.set('test-key', 'test-value');
        const value = await api.storage.get('test-key');
        expect(value).toBe('test-value');
      });

      it('should return undefined for non-existent keys', async () => {
        const value = await api.storage.get('non-existent');
        expect(value).toBeUndefined();
      });

      it('should remove values', async () => {
        await api.storage.set('test-key', 'test-value');
        await api.storage.remove('test-key');
        const value = await api.storage.get('test-key');
        expect(value).toBeUndefined();
      });

      it('should handle complex objects', async () => {
        const obj = { name: 'test', count: 42, nested: { value: true } };
        await api.storage.set('object-key', obj);
        const retrieved = await api.storage.get('object-key');
        expect(retrieved).toEqual(obj);
      });
    });

    describe('Settings API', () => {
      it('should get predefined settings', async () => {
        const city = await api.settings.get('city');
        expect(city).toBe('Taipei');
      });

      it('should get all settings', async () => {
        const all = await api.settings.getAll();
        expect(all).toBeDefined();
        expect(all.city).toBe('Taipei');
        expect(all.theme).toBe('dark');
      });

      it('should return undefined for non-existent settings', async () => {
        const value = await api.settings.get('non-existent');
        expect(value).toBeUndefined();
      });
    });

    describe('System API', () => {
      it('should return CPU usage as a number', async () => {
        const cpu = await api.system.getCPU();
        expect(typeof cpu).toBe('number');
        expect(cpu).toBeGreaterThanOrEqual(0);
        expect(cpu).toBeLessThanOrEqual(100);
      });

      it('should return memory info with correct structure', async () => {
        const memory = await api.system.getMemory();
        expect(memory).toBeDefined();
        expect(typeof memory.total).toBe('number');
        expect(typeof memory.used).toBe('number');
        expect(typeof memory.free).toBe('number');
        expect(typeof memory.usagePercent).toBe('number');
        expect(memory.total).toBeGreaterThan(0);
        expect(memory.used).toBeGreaterThan(0);
        expect(memory.free).toBeGreaterThan(0);
        expect(memory.usagePercent).toBeGreaterThanOrEqual(0);
        expect(memory.usagePercent).toBeLessThanOrEqual(100);
      });

      it('should have consistent memory calculations', async () => {
        const memory = await api.system.getMemory();
        expect(memory.used + memory.free).toBe(memory.total);
      });
    });

    describe('UI API', () => {
      it('should accept resize calls without errors', async () => {
        await expect(api.ui.resize(400, 300)).resolves.toBeUndefined();
      });

      it('should accept setPosition calls without errors', async () => {
        await expect(api.ui.setPosition(100, 200)).resolves.toBeUndefined();
      });
    });
  });
});
