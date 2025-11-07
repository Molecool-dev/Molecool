# Clock Widget

A simple clock widget for the Molecule Desktop Widget Platform that displays the current time and date.

## Features

- Displays current time in HH:MM format
- Shows full date with weekday
- Updates every second
- No special permissions required
- Clean, minimal design with glassmorphism effect

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Configuration

### Widget Configuration

See `widget.config.json` for widget metadata and permissions.

### Build Configuration

The widget uses Vite for building and development. Configuration is in `vite.config.ts`:

- **Build Output**: `dist/` directory
- **Entry Point**: `index.html`
- **Plugins**: React plugin for JSX/TSX support
- **Development**: Hot module replacement enabled by default

## Requirements

- React 18+
- Molecule Widget SDK

## Permissions

This widget does not require any special permissions:
- No system information access
- No network access
- Fully sandboxed

## Testing

The Clock Widget includes comprehensive automated tests using Vitest and React Testing Library.

### Test Coverage

**Test Suite**: `__tests__/ClockWidget.test.tsx`

The test suite verifies:

1. **Rendering** - Widget container renders correctly
2. **Time Display** - Current time displays in HH:MM format
3. **Date Display** - Current date displays with year
4. **Time Updates** - Time updates every second
5. **Zero Padding** - Single digit hours/minutes are padded (e.g., 09:05)
6. **Edge Cases**:
   - Midnight (00:00) displays correctly
   - Noon (12:00) displays correctly

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (during development)
npm run test:watch
```

### Test Implementation

The tests use:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **Fake Timers** - Control time for predictable testing

Example test:
```typescript
it('should display current time in HH:MM format', () => {
  const mockDate = new Date('2024-01-15T14:30:00');
  vi.setSystemTime(mockDate);
  
  render(<App />);
  
  expect(screen.getByText('14:30')).toBeInTheDocument();
});
```
