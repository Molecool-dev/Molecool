/**
 * Molecule Widget SDK
 * 
 * A React component library and API for creating desktop widgets
 * that run in the Molecule Widget Container (Electron).
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
} from './hooks';

// UI Components exports (Task 9 - First batch of 8 components)
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
  type ContainerProps,
  type TitleProps,
  type LargeTextProps,
  type SmallTextProps,
  type ButtonProps,
  type GridProps,
  type DividerProps,
  type HeaderProps,
} from './components';

// UI Components exports (Task 10 - Second batch of 7 components)
export {
  Stat,
  ProgressBar,
  Input,
  Select,
  List,
  ListItem,
  Badge,
  Link,
  type StatProps,
  type ProgressBarProps,
  type InputProps,
  type SelectProps,
  type SelectOption,
  type ListProps,
  type ListItemProps,
  type BadgeProps,
  type LinkProps,
} from './components';

// Placeholder export to make the package valid
export const SDK_VERSION = '1.0.0';
