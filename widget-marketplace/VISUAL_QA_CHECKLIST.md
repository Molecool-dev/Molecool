# Visual QA Checklist - Aero Glass Marketplace
## Manual Testing Guide

Use this checklist to manually verify the visual quality of the Aero Glass implementation.

---

## 🖥️ Desktop Testing (≥768px viewport)

### Glass Surface Blur
- [ ] Open homepage - verify hero section has visible blur effect
- [ ] Scroll to widget cards - verify cards have 20px blur (should be clearly visible)
- [ ] Open widget detail page - verify sidebar and content cards have blur
- [ ] Hover over cards - verify blur remains consistent during hover

**Expected:** All glass surfaces should have a noticeable frosted glass effect with 20px blur

---

### Glass Surface Borders
- [ ] Inspect any GlassCard - verify white semi-transparent border (rgba(255, 255, 255, 0.3))
- [ ] Check GlassButton secondary variant - verify white/30 border
- [ ] Verify borders are visible but subtle against gradient backgrounds

**Expected:** All glass surfaces have a subtle white border that enhances the glass effect

---

### Hover State - Lift and Glow
- [ ] Hover over a widget card - verify it lifts up 12px (translateY(-12px))
- [ ] Verify card scales slightly (1.02) on hover
- [ ] Verify cyan glow appears around card edges
- [ ] Verify rotating glow ring animates smoothly (3s rotation)
- [ ] Hover over GlassButton - verify slight lift (-0.5px) and scale (1.05)

**Expected:** Smooth lift animation with visible cyan glow effect

**Visual Check:**
```
Before hover: Card at normal position
During hover: Card lifts up, cyan glow visible, rotating ring animates
After hover: Card returns smoothly to original position
```

---

### Button Ripple Effect
- [ ] Click a GlassButton (primary or secondary variant)
- [ ] Verify white ripple expands from click point
- [ ] Verify ripple fades out over 600ms
- [ ] Click multiple times rapidly - verify ripples don't accumulate excessively
- [ ] Verify ripple doesn't interfere with button functionality

**Expected:** Smooth ripple animation expanding from click point, fading to transparent

---

### Reflection Gradient
- [ ] Inspect GlassCard - verify top-left corner has white gradient overlay
- [ ] Check GlassOrb (widget icons) - verify reflection overlay
- [ ] Verify reflection is subtle and doesn't obscure content
- [ ] Verify reflection gradient goes from rgba(255, 255, 255, 0.3) to transparent

**Expected:** Subtle white gradient from top-left corner, creating depth

---

### Transition Easing
- [ ] Hover over widget card - observe the lift animation
- [ ] Verify animation has a bouncy, playful feel (not linear)
- [ ] Verify animation duration is 400ms
- [ ] Verify animation feels smooth and natural

**Expected:** Bouncy easing (cubic-bezier(0.34, 1.56, 0.64, 1)) on transform animations

---

## 📱 Mobile Testing (<768px viewport)

### Reduced Blur
- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify glass surfaces still have blur but reduced to 10px
- [ ] Verify blur is less intense than desktop but still visible
- [ ] Verify performance is smooth when scrolling

**Expected:** Blur reduced to 10px for better mobile performance

---

### Simplified Effects
- [ ] Verify rotating glow ring is disabled on mobile
- [ ] Verify hover effects work on touch (tap and hold)
- [ ] Verify animations don't cause jank or lag
- [ ] Verify text remains readable on all glass surfaces

**Expected:** Simplified effects for better mobile performance

---

## ♿ Accessibility Testing

### Reduced Motion
- [ ] Enable "Reduce motion" in OS settings
- [ ] Reload page - verify floating animations are disabled
- [ ] Verify rotating glow ring is disabled
- [ ] Verify ripple effect is instant (no animation)
- [ ] Verify transitions are instant or very short

**Expected:** All animations disabled or reduced to <0.01ms

---

### Keyboard Navigation
- [ ] Tab through interactive elements (buttons, links)
- [ ] Verify focus indicators are visible on glass surfaces
- [ ] Verify focus outline is cyan (rgba(0, 212, 255, 0.8))
- [ ] Verify focus outline has proper offset (2-3px)
- [ ] Verify tab order is logical

**Expected:** Clear, visible focus indicators on all interactive elements

---

### Text Readability
- [ ] Verify all text on glass surfaces is readable
- [ ] Check contrast ratio meets WCAG AA (4.5:1 minimum)
- [ ] Verify text shadows are applied where needed
- [ ] Test with different background colors/gradients

**Expected:** All text readable with sufficient contrast

---

## 🎨 Visual Consistency

### Color Palette
- [ ] Verify cyan color is consistent (#00D4FF / rgba(0, 212, 255))
- [ ] Verify gradient backgrounds use correct colors (#1e3c72, #2a5298, #7e8ba3)
- [ ] Verify glass backgrounds use rgba(255, 255, 255, 0.12)

---

### Component Consistency
- [ ] All cards use GlassCard component
- [ ] All buttons use GlassButton component
- [ ] All badges use GlassBadge component
- [ ] All circular containers use GlassOrb component

---

### Animation Consistency
- [ ] All hover lifts use -12px translateY (or -0.5px for buttons)
- [ ] All transitions use consistent durations (300-400ms)
- [ ] All glow effects use cyan color
- [ ] All ripples use white/30 color

---

## 🌐 Browser Compatibility

### Backdrop Filter Support
- [ ] Test in Chrome/Edge - verify backdrop-filter works
- [ ] Test in Firefox - verify backdrop-filter works
- [ ] Test in Safari - verify backdrop-filter works
- [ ] Test in older browsers - verify fallback to solid background

**Expected:** Graceful fallback to rgba(255, 255, 255, 0.25) solid background

---

## 🚀 Performance

### Animation Performance
- [ ] Open DevTools Performance tab
- [ ] Record while hovering over cards
- [ ] Verify frame rate stays at 60fps
- [ ] Verify no layout shifts during animations
- [ ] Verify will-change is applied only on hover

**Expected:** Smooth 60fps animations with no jank

---

### Load Performance
- [ ] Measure First Contentful Paint (FCP) - target < 1.5s
- [ ] Measure Largest Contentful Paint (LCP) - target < 2.5s
- [ ] Measure Cumulative Layout Shift (CLS) - target < 0.1
- [ ] Verify no excessive repaints or reflows

---

## ✅ Final Verification

### Requirements Checklist
- [ ] ✅ All glass surfaces use 20px blur (10px on mobile)
- [ ] ✅ All glass surfaces have rgba(255, 255, 255, 0.3) borders
- [ ] ✅ Hover states lift elements -12px with cyan glow
- [ ] ✅ Buttons have ripple effect on click
- [ ] ✅ Cards have top-left reflection gradient
- [ ] ✅ All transitions use cubic-bezier(0.34, 1.56, 0.64, 1)

### Quality Standards
- [ ] ✅ Accessibility: prefers-reduced-motion support
- [ ] ✅ Performance: will-change optimization
- [ ] ✅ Browser support: backdrop-filter fallback
- [ ] ✅ Mobile optimization: reduced blur and effects
- [ ] ✅ Semantic HTML: proper ARIA attributes
- [ ] ✅ Focus indicators: visible on glass surfaces
- [ ] ✅ Text readability: sufficient contrast

---

## 📝 Notes

**Testing Environment:**
- Browser: _____________
- OS: _____________
- Viewport: _____________
- Date: _____________

**Issues Found:**
- [ ] None
- [ ] List any issues below:

---

**Tester Signature:** _______________  
**Date:** _______________
