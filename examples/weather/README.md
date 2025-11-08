# Weather Widget

A weather widget that displays current weather conditions using the OpenWeatherMap API.

## Features

- Real-time weather data
- Temperature display in Celsius
- Weather condition description
- Auto-refresh every 10 minutes
- Configurable city via settings
- Error boundary for graceful error handling
- Fallback to mock data on API failures

## Setup

### 1. Get an API Key

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key from the dashboard

### 2. Configure the API Key

Edit `src/index.tsx` and replace `YOUR_API_KEY` with your actual API key:

```typescript
const apiKey = 'your_actual_api_key_here';
```

### 3. Build the Widget

```bash
npm install
npm run build
```

### 4. Install to Widget Container

Run the installation script:

```powershell
.\install-widget.ps1
```

Or manually copy the `dist` folder and `widget.config.json` to:
```
%APPDATA%\Molecool-widget-container\widgets\weather-widget\
```

## Permissions

This widget requires the following permissions:
- **Network Access**: To fetch weather data from OpenWeatherMap API
  - Allowed domain: `https://api.openweathermap.org`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Build Configuration

The widget uses Vite for building with the following configuration:

- **Target**: Chrome 120 (matches Electron 28's Chromium version)
- **Output**: Single-file bundle with no code splitting
- **Base Path**: Relative (`./`) for proper asset loading in Electron
- **Source Maps**: Enabled for debugging
- **Minification**: esbuild for fast builds

See `vite.config.ts` for the complete configuration.

## Configuration

The widget uses the following settings:
- `city`: City name for weather lookup (default: "Taipei")

You can change the city through the Widget Manager settings panel.

## Error Handling

The widget implements comprehensive error handling:

### ErrorBoundary

The widget is wrapped in an `ErrorBoundary` component that catches React rendering errors and displays a user-friendly error message instead of crashing the widget.

```tsx
import { ErrorBoundary } from '@Molecool/widget-sdk';

function App() {
  return (
    <ErrorBoundary>
      <WidgetProvider>
        <WeatherWidget />
      </WidgetProvider>
    </ErrorBoundary>
  );
}
```

### Fallback Behavior

If the API request fails (e.g., invalid API key, network error), the widget will:
1. Display an error message in the UI
2. Show mock data (24°C, Sunny) for demonstration purposes
3. Continue to function normally without crashing

### Error Recovery

The widget uses `useCallback` to memoize the fetch function, preventing unnecessary re-fetches and improving performance. If an error occurs, the widget will:
- Log the error to the console for debugging
- Display a user-friendly error message
- Automatically retry on the next scheduled update (every 10 minutes)

## Size

- Default: 300x200px
- Minimum: 250x180px
- Maximum: 400x250px
