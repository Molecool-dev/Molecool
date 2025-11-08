# Animation Guide

## Animation Timing Reference

This guide provides a quick reference for all animations in the Molecool platform.

## Timing Chart

```
Component          | Duration | Easing                      | Trigger
-------------------|----------|-----------------------------|---------
Widget Window      | 300ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Widget Fade-Out    | 250ms    | cubic-bezier(0.4,0,1,1)    | Close
Container          | 400ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Typography         | 500ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Button             | 400ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Button Hover       | 200ms    | cubic-bezier(0.16,1,0.3,1) | Hover
Stat Card          | 500ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Progress Bar       | 600ms    | cubic-bezier(0.16,1,0.3,1) | Value Change
Input Focus        | 300ms    | cubic-bezier(0.16,1,0.3,1) | Focus
Input Error        | 400ms    | cubic-bezier(0.36,0.07,0.19,0.97) | Validation
List               | 500ms    | cubic-bezier(0.16,1,0.3,1) | Mount
List Item          | 400ms    | cubic-bezier(0.16,1,0.3,1) | Mount (staggered)
Badge              | 400ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Link               | 400ms    | cubic-bezier(0.16,1,0.3,1) | Mount
Manager Card       | 500ms    | cubic-bezier(0.16,1,0.3,1) | Mount (staggered)
```

## Easing Functions

### Spring Effect (Primary)
```css
cubic-bezier(0.16, 1, 0.3, 1)
```
- **Use**: Entrance animations, hover effects
- **Feel**: Smooth, natural, slightly bouncy
- **Best For**: Creating delightful, premium feel

### Smooth Exit
```css
cubic-bezier(0.4, 0, 1, 1)
```
- **Use**: Exit animations, removal
- **Feel**: Quick, smooth departure
- **Best For**: Closing, hiding elements

### Shake Effect
```css
cubic-bezier(0.36, 0.07, 0.19, 0.97)
```
- **Use**: Error states, validation feedback
- **Feel**: Attention-grabbing shake
- **Best For**: Form validation errors

## Animation Patterns

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Scale In
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Slide In
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Shimmer
```css
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

## Staggered Animations

### List Items
```css
.listItem:nth-child(1) { animation-delay: 0.05s; }
.listItem:nth-child(2) { animation-delay: 0.1s; }
.listItem:nth-child(3) { animation-delay: 0.15s; }
.listItem:nth-child(4) { animation-delay: 0.2s; }
.listItem:nth-child(5) { animation-delay: 0.25s; }
.listItem:nth-child(6) { animation-delay: 0.3s; }
```

### Manager Cards
```css
.widget-card:nth-child(1) { animation-delay: 0.1s; }
.widget-card:nth-child(2) { animation-delay: 0.15s; }
.widget-card:nth-child(3) { animation-delay: 0.2s; }
.widget-card:nth-child(4) { animation-delay: 0.25s; }
.widget-card:nth-child(5) { animation-delay: 0.3s; }
.widget-card:nth-child(6) { animation-delay: 0.35s; }
```

## Hover Effects

### Lift Pattern
```css
.element {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.element:hover {
  transform: translateY(-2px);
}
```

### Lift + Scale Pattern
```css
.element {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.element:hover {
  transform: translateY(-2px) scale(1.02);
}
```

### Slide Pattern
```css
.element {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.element:hover {
  transform: translateX(4px);
}
```

## Active States

### Press Effect
```css
.element:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}
```

## Performance Tips

### DO ✅
- Use `transform` and `opacity` for animations
- Use CSS animations over JavaScript
- Limit concurrent animations
- Use `will-change` sparingly
- Clean up animations on unmount

### DON'T ❌
- Animate `width`, `height`, `top`, `left`
- Use too many simultaneous animations
- Forget to remove event listeners
- Overuse `will-change`
- Animate during scroll

## Accessibility

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Note**: This should be added in a future update for better accessibility.

## Testing Animations

### Visual Testing
1. Open DevTools Performance tab
2. Record while triggering animations
3. Check for 60 FPS (16.67ms per frame)
4. Look for layout thrashing
5. Verify smooth transitions

### Performance Metrics
- **Target FPS**: 60
- **Frame Budget**: 16.67ms
- **Animation Budget**: <10ms
- **Max Concurrent**: 10 widgets

## Common Issues

### Janky Animations
**Cause**: Animating non-GPU properties
**Fix**: Use `transform` and `opacity` only

### Memory Leaks
**Cause**: Not cleaning up intervals/listeners
**Fix**: Clear intervals in cleanup functions

### Slow Performance
**Cause**: Too many concurrent animations
**Fix**: Limit widget count, optimize animations

## Examples

### Creating a Custom Animation

```typescript
// Component
import styles from './MyComponent.module.css';

export const MyComponent = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
};
```

```css
/* MyComponent.module.css */
.container {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.title {
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Resources

- [CSS Easing Functions](https://easings.net/)
- [Cubic Bezier Generator](https://cubic-bezier.com/)
- [Animation Performance](https://web.dev/animations/)
- [GPU Acceleration](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)

## Conclusion

This animation system provides a consistent, performant, and delightful user experience across the entire Molecool platform. All animations are carefully timed and eased to feel natural and premium.
