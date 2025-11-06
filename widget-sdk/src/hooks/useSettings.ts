/**
 * useSettings Hook
 * 
 * Provides reactive access to widget settings (read-only).
 * Settings are configured by the user in the Widget Manager.
 */

import { useState, useEffect } from 'react';
import { useWidgetAPI } from './useWidgetAPI';

/**
 * Hook for accessing a specific setting value
 * 
 * @param key - Setting key
 * @param defaultValue - Default value if setting doesn't exist
 * @returns The setting value
 * 
 * @example
 * ```tsx
 * function WeatherWidget() {
 *   const city = useSettings<string>('city', 'Taipei');
 *   const refreshInterval = useSettings<number>('refreshInterval', 60000);
 *   
 *   return (
 *     <div>
 *       <div>City: {city}</div>
 *       <div>Refresh every {refreshInterval / 1000}s</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSettings<T = any>(
  key: string,
  defaultValue?: T
): T | undefined {
  const { settings } = useWidgetAPI();
  const [value, setValue] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    let isMounted = true;

    const loadSetting = async () => {
      try {
        const settingValue = await settings.get<T>(key);
        
        if (isMounted) {
          setValue(settingValue !== undefined ? settingValue : defaultValue);
        }
      } catch (error) {
        console.error(`[useSettings] Failed to load setting "${key}":`, error);
        
        if (isMounted) {
          setValue(defaultValue);
        }
      }
    };

    loadSetting();

    return () => {
      isMounted = false;
    };
  }, [key]); // Re-run if key changes

  return value;
}

/**
 * Hook for accessing all settings
 * 
 * @returns Object containing all settings
 * 
 * @example
 * ```tsx
 * function SettingsDisplay() {
 *   const allSettings = useAllSettings();
 *   
 *   return (
 *     <div>
 *       <h3>Current Settings:</h3>
 *       <pre>{JSON.stringify(allSettings, null, 2)}</pre>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAllSettings(): Record<string, any> {
  const { settings } = useWidgetAPI();
  const [allSettings, setAllSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    let isMounted = true;

    const loadAllSettings = async () => {
      try {
        const settingsData = await settings.getAll();
        
        if (isMounted) {
          setAllSettings(settingsData);
        }
      } catch (error) {
        console.error('[useAllSettings] Failed to load settings:', error);
        
        if (isMounted) {
          setAllSettings({});
        }
      }
    };

    loadAllSettings();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  return allSettings;
}
