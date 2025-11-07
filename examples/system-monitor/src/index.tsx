import React from 'react';
import { createRoot } from 'react-dom/client';
import { 
  WidgetProvider, 
  Widget,
  useSystemInfo,
  Header,
  Stat,
  ProgressBar,
  Divider,
  ErrorBoundary
} from '@molecule/widget-sdk';
import styles from './App.module.css';

const SystemMonitorWidget: React.FC = () => {
  // Fetch CPU and memory info every 2 seconds
  const cpuUsage = useSystemInfo('cpu', 2000);
  const memoryInfo = useSystemInfo('memory', 2000);
  
  // Format memory values
  const formatMemory = (bytes: number): string => {
    return (bytes / 1024 / 1024 / 1024).toFixed(1);
  };
  
  const memoryUsed = memoryInfo ? formatMemory(memoryInfo.used) : '0.0';
  const memoryTotal = memoryInfo ? formatMemory(memoryInfo.total) : '0.0';
  const memoryPercent = memoryInfo?.usagePercent ?? 0;
  
  // Determine colors based on usage
  const cpuColor = (cpuUsage ?? 0) > 80 ? '#ef4444' : '#10b981';
  const memoryColor = memoryPercent > 80 ? '#ef4444' : '#10b981';
  const cpuBarColor = (cpuUsage ?? 0) > 80 ? '#ef4444' : '#3b82f6';
  const memoryBarColor = memoryPercent > 80 ? '#ef4444' : '#3b82f6';
  
  return (
    <Widget.Container className={styles.monitorContainer}>
      <Header className={styles.header}>System Monitor</Header>
      
      <div className={styles.section}>
        <Stat
          label="CPU Usage"
          value={cpuUsage !== null ? `${cpuUsage.toFixed(1)}%` : 'Loading...'}
          color={cpuColor}
        />
        <ProgressBar 
          value={cpuUsage ?? 0}
          color={cpuBarColor}
          showLabel={false}
        />
      </div>
      
      <Divider />
      
      <div className={styles.section}>
        <Stat
          label="Memory"
          value={memoryInfo 
            ? `${memoryUsed} GB / ${memoryTotal} GB`
            : 'Loading...'
          }
          color={memoryColor}
        />
        <ProgressBar 
          value={memoryPercent}
          color={memoryBarColor}
          showLabel={false}
        />
      </div>
    </Widget.Container>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WidgetProvider>
        <SystemMonitorWidget />
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
