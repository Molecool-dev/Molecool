/**
 * Molecool Widget SDK
 * 
 * A React component library and API for creating desktop widgets
 * that run in the Molecool Widget Container (Electron).
 */

// Core API exports (Task 7)
export {
  WidgetProvider,
  WidgetContext,
  createMockAPI,
  type WidgetAPIContext,
  type StorageAPI,
  type SettingsAPI,
  type SystemAPI,
  type UIAPI,
  type WidgetConfig,
  type SystemMemoryInfo,
  type WidgetAPIBridge,
  type WidgetProviderProps,
} from './core/WidgetAPI';

// React Hooks exports (Task 8)
export {
  useWidgetAPI,
  useInterval,
  useStorage,
  useSettings,
  useAllSettings,
  useSystemInfo,
  useThrottle,
} from './hooks';

// UI Components exports (Tasks 9 & 10)
export {
  Widget,
  Container,
  Title,
  LargeText,
  SmallText,
  Button,
  Grid,
  Divider,
  Header,
  Stat,
  ProgressBar,
  Input,
  Select,
  List,
  ListItem,
  Badge,
  Link,
} from './components';

// UI Component type exports
export type {
  ContainerProps,
  TitleProps,
  LargeTextProps,
  SmallTextProps,
  ButtonProps,
  GridProps,
  DividerProps,
  HeaderProps,
  StatProps,
  ProgressBarProps,
  InputProps,
  SelectProps,
  SelectOption,
  ListProps,
  ListItemProps,
  BadgeProps,
  LinkProps,
} from './components';

// Error handling exports (Task 32)
export { ErrorBoundary } from './components/ErrorBoundary';
export {
  WidgetError,
  WidgetErrorType,
  isWidgetError,
  toWidgetError
} from './types/errors';

// Placeholder export to make the package valid
export const SDK_VERSION = '1.0.0';
