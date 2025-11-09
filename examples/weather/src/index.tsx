import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  WidgetProvider, 
  Widget, 
  useInterval,
  useSettings,
  LargeText,
  SmallText,
  ErrorBoundary
} from '@molecool/widget-sdk';
import styles from './App.module.css';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
}

const WeatherWidget: React.FC = () => {
  const [city] = useSettings<string>('city', 'Taipei');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
      
      // For demo purposes, use mock data immediately
      // In production, you would use a real API key
      console.log('Fetching weather for:', city);
      
      // Set mock data for demo purposes
      setWeather({
        temperature: 24,
        condition: 'Sunny',
        icon: '01d',
        city: city
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Unable to load weather');
      setLoading(false);
      
      // Set mock data as fallback
      setWeather({
        temperature: 24,
        condition: 'Sunny',
        icon: '01d',
        city: city
      });
    }
  }, [city]);
  
  // Fetch weather on mount and when city changes
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);
  
  // Update weather every 10 minutes (600000ms)
  useInterval(() => {
    fetchWeather();
  }, 600000);
  
  if (loading && !weather) {
    return (
      <Widget.Container className={styles.weatherContainer}>
        <SmallText>Loading weather...</SmallText>
      </Widget.Container>
    );
  }
  
  return (
    <Widget.Container className={styles.weatherContainer}>
      <div className={styles.header}>
        <SmallText className={styles.city}>{weather?.city || city}</SmallText>
      </div>
      
      <div className={styles.main}>
        <LargeText className={styles.temperature}>
          {weather?.temperature}°C
        </LargeText>
        
        <div className={styles.condition}>
          <SmallText>{weather?.condition}</SmallText>
        </div>
      </div>
      
      {error && (
        <div className={styles.error}>
          <SmallText className={styles.errorText}>{error}</SmallText>
        </div>
      )}
    </Widget.Container>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WidgetProvider>
        <WeatherWidget />
      </WidgetProvider>
    </ErrorBoundary>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
