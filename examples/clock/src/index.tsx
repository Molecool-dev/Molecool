import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  WidgetProvider, 
  Widget, 
  useInterval,
  LargeText,
  SmallText,
  ErrorBoundary
} from '@molecool/widget-sdk';
import styles from './App.module.css';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  // Update time every second
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  // Format time as HH:MM
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // Format date
  const dateString = time.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  return (
    <Widget.Container className={styles.clockContainer}>
      <LargeText className={styles.time}>{timeString}</LargeText>
      <SmallText className={styles.date}>{dateString}</SmallText>
    </Widget.Container>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WidgetProvider>
        <ClockWidget />
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
