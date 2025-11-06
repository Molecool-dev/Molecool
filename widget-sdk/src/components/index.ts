/**
 * UI Components Index
 * 
 * Exports all UI components as a compound Widget namespace
 */

import { Container } from './Widget';
import { Title, LargeText, SmallText } from './Typography';
import { Button } from './Buttons';
import { Grid, Divider, Header } from './Layout';
import { Stat, ProgressBar } from './DataDisplay';
import { Input, Select } from './Forms';
import { List, ListItem } from './List';
import { Badge } from './Badge';
import { Link } from './Link';

// Export individual components (Task 9 - First batch)
export { Container } from './Widget';
export { Title, LargeText, SmallText } from './Typography';
export { Button } from './Buttons';
export { Grid, Divider, Header } from './Layout';

// Export individual components (Task 10 - Second batch)
export { Stat, ProgressBar } from './DataDisplay';
export { Input, Select } from './Forms';
export { List, ListItem } from './List';
export { Badge } from './Badge';
export { Link } from './Link';

// Export types (Task 9)
export type { ContainerProps } from './Widget';
export type { TitleProps, LargeTextProps, SmallTextProps } from './Typography';
export type { ButtonProps } from './Buttons';
export type { GridProps, DividerProps, HeaderProps } from './Layout';

// Export types (Task 10)
export type { StatProps, ProgressBarProps } from './DataDisplay';
export type { InputProps, SelectProps, SelectOption } from './Forms';
export type { ListProps, ListItemProps } from './List';
export type { BadgeProps } from './Badge';
export type { LinkProps } from './Link';

// Compound Widget namespace for convenient usage
export const Widget = {
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
};
