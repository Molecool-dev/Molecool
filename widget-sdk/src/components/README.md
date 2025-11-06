# Widget SDK UI Components

This directory contains the first batch of 8 UI components for the Molecule Widget SDK (Task 9).

## Components Overview

### 1. Widget.Container
The main container component with glassmorphism effect.

```tsx
import { Widget } from '@molecule/widget-sdk';

<Widget.Container>
  {/* Your widget content */}
</Widget.Container>
```

**Props:**
- `children: React.ReactNode` - Content to display
- `className?: string` - Additional CSS classes

**Features:**
- Glassmorphism effect with blur and transparency
- Rounded corners (12px)
- Fade-in animation
- Shadow effect

---

### 2. Widget.Title
Heading component with three size variants.

```tsx
<Widget.Title size="large">Large Title</Widget.Title>
<Widget.Title size="medium">Medium Title</Widget.Title>
<Widget.Title size="small">Small Title</Widget.Title>
```

**Props:**
- `children: React.ReactNode` - Title text
- `size?: 'small' | 'medium' | 'large'` - Size variant (default: 'medium')
- `className?: string` - Additional CSS classes

---

### 3. Widget.LargeText
Large display text for prominent information (e.g., time, temperature).

```tsx
<Widget.LargeText>42°C</Widget.LargeText>
```

**Props:**
- `children: React.ReactNode` - Text content
- `className?: string` - Additional CSS classes

**Features:**
- 3rem font size
- Bold weight (700)
- Optimized for displaying numbers and short text

---

### 4. Widget.SmallText
Small text for secondary information and labels.

```tsx
<Widget.SmallText>Current temperature</Widget.SmallText>
```

**Props:**
- `children: React.ReactNode` - Text content
- `className?: string` - Additional CSS classes

**Features:**
- 0.875rem font size
- Lighter color (60% opacity)
- Ideal for captions and descriptions

---

### 5. Widget.Button
Interactive button with three variants.

```tsx
<Widget.Button variant="primary" onClick={handleClick}>
  Click Me
</Widget.Button>

<Widget.Button variant="secondary">
  Secondary
</Widget.Button>

<Widget.Button variant="danger" disabled>
  Disabled
</Widget.Button>
```

**Props:**
- `children: React.ReactNode` - Button text
- `onClick?: () => void` - Click handler
- `variant?: 'primary' | 'secondary' | 'danger'` - Visual variant (default: 'primary')
- `disabled?: boolean` - Disabled state (default: false)
- `className?: string` - Additional CSS classes

**Features:**
- Hover effects with transform and shadow
- Glassmorphism background
- Disabled state styling
- Smooth transitions

---

### 6. Widget.Grid
Grid layout component for organizing content.

```tsx
<Widget.Grid columns={2} gap={12}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</Widget.Grid>
```

**Props:**
- `children: React.ReactNode` - Grid items
- `columns?: number` - Number of columns (default: 2)
- `gap?: number` - Gap between items in pixels (default: 12)
- `className?: string` - Additional CSS classes

---

### 7. Widget.Divider
Horizontal divider line for separating content.

```tsx
<Widget.Divider />
```

**Props:**
- `className?: string` - Additional CSS classes

**Features:**
- 1px height
- Semi-transparent white color
- 12px vertical margin

---

### 8. Widget.Header
Section header with bottom border.

```tsx
<Widget.Header>Section Title</Widget.Header>
```

**Props:**
- `children: React.ReactNode` - Header text
- `className?: string` - Additional CSS classes

**Features:**
- 1.25rem font size
- Bottom border separator
- 12px bottom margin

---

## Usage Example

Here's a complete example combining multiple components:

```tsx
import React from 'react';
import { WidgetProvider, Widget } from '@molecule/widget-sdk';

function ClockWidget() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <WidgetProvider>
      <Widget.Container>
        <Widget.Header>Current Time</Widget.Header>
        
        <Widget.LargeText>
          {time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Widget.LargeText>
        
        <Widget.SmallText>
          {time.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Widget.SmallText>
        
        <Widget.Divider />
        
        <Widget.Button onClick={() => console.log('Clicked!')}>
          Refresh
        </Widget.Button>
      </Widget.Container>
    </WidgetProvider>
  );
}
```

## Styling

All components use CSS Modules for scoped styling. The glassmorphism effect is applied with:

- `background: rgba(255, 255, 255, 0.1)` - Semi-transparent white
- `backdrop-filter: blur(10px)` - Blur effect
- `border-radius: 12px` - Rounded corners
- `border: 1px solid rgba(255, 255, 255, 0.2)` - Subtle border
- `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)` - Shadow depth

## Testing

All components have comprehensive unit tests in the `__tests__` directory:

- `Widget.test.tsx` - Container component tests
- `Typography.test.tsx` - Title, LargeText, SmallText tests
- `Buttons.test.tsx` - Button component tests
- `Layout.test.tsx` - Grid, Divider, Header tests

Run tests with:
```bash
npm run test
```

## Task 10 Components (Data Display)

### 9. Stat
Display a labeled statistic with optional icon and color.

```tsx
<Stat 
  label="CPU Usage" 
  value="45%" 
  color="#3b82f6"
  icon={<CpuIcon />}
/>
```

**Props:**
- `label: string` - The label for the statistic
- `value: string | number` - The value to display
- `color?: string` - Optional color for the value text
- `icon?: React.ReactNode` - Optional icon to display
- `className?: string` - Additional CSS classes

**Features:**
- Glassmorphism background
- Optional icon display
- Customizable value color
- Uppercase label styling

---

### 10. ProgressBar
Display a progress bar with percentage value.

```tsx
<ProgressBar 
  value={75} 
  color="#10b981"
  showLabel={true}
/>
```

**Props:**
- `value: number` - Progress value (0-100)
- `color?: string` - Bar color (default: '#3b82f6')
- `showLabel?: boolean` - Show percentage label (default: true)
- `className?: string` - Additional CSS classes

**Features:**
- Automatically clamps value between 0-100
- Smooth width transitions (0.3s)
- Customizable colors with glow effect
- Optional percentage label

---

## Remaining Task 10 Components

The following components still need to be implemented:
- Input (text input field)
- Select (dropdown selector)
- List / ListItem (list components)
- Badge (status badge)
- Link (hyperlink component)
