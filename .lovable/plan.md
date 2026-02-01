
# Plan: Refactor Hero Slider Implementation

## Overview
Refactor the Hero banner slider to fix layout shift issues, improve element positioning accuracy, and update navigation placement.

## Changes Summary

### 1. Fix Layout Shift (Image Stability)
**Problem**: Banner images "jump" after loading due to Framer Motion hydration delay.

**Solution**:
- Remove `backgroundImage` CSS approach
- Use a proper `<img>` tag with `object-cover`
- Apply `transform: scale() translate()` directly via inline styles (instant, no animation library)
- Wrap image in a container with `overflow-hidden`

```text
Before: backgroundImage + backgroundSize + backgroundPosition (CSS)
After:  <img> with transform: scale(X) translate(X%, Y%) (inline style)
```

### 2. Smart Element Positioning (BannerElement Component)
**Problem**: Text and buttons don't anchor correctly at different screen sizes.

**Solution**: Create a `BannerElement` helper component with smart anchor logic:

```text
┌─────────────────────────────────────────────────────────────┐
│  x < 35%           │   35% ≤ x ≤ 65%   │      x > 65%       │
│  LEFT ANCHOR       │   CENTER ANCHOR   │   RIGHT ANCHOR     │
│  translate(0, -50%)│translate(-50%,-50%)│translate(-100%,-50%)│
│  text-left         │   text-center     │    text-right      │
└─────────────────────────────────────────────────────────────┘
```

This ensures elements stay visually anchored to their intended position regardless of content width.

### 3. Navigation Controls Update
**Current**: `bottom-3 right-6`
**New**: `bottom-8 right-8` with updated styling (backdrop-blur, rounded-full buttons)

Order: `[Prev Arrow] [Dots] [Next Arrow]`

### 4. Remove Unnecessary Framer Motion
- Remove `AnimatePresence` and `motion.div` wrappers for static positioning
- Keep Framer Motion only for optional entry animations (can be added later if desired)
- This eliminates FOUC (Flash of Unstyled Content)

---

## Technical Details

### File to Modify
`src/components/Hero.tsx`

### Key Code Changes

**A. New BannerElement Helper Component:**
```tsx
interface BannerElementProps {
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
}

const BannerElement = ({ x, y, children, className = "" }: BannerElementProps) => {
  let translateX = "-50%";
  let textAlign = "text-center";
  
  if (x < 35) {
    translateX = "0%";
    textAlign = "text-left";
  } else if (x > 65) {
    translateX = "-100%";
    textAlign = "text-right";
  }

  return (
    <div
      className={`absolute z-10 w-auto max-w-[90%] ${textAlign} ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${translateX}, -50%)`,
      }}
    >
      {children}
    </div>
  );
};
```

**B. Image Transform (Instant, No Animation):**
```tsx
<div 
  className="absolute inset-0 w-full h-full overflow-hidden"
  style={{
    transform: `scale(${imageScale / 100}) translate(${imagePositionX - 50}%, ${imagePositionY - 50}%)`
  }}
>
  <img
    src={banner.image_url}
    alt={banner.title || "Banner"}
    className="w-full h-full object-cover"
    loading="eager"
  />
</div>
```

**C. Navigation Styling:**
```tsx
<div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
  <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white">
    <ArrowLeft />
  </button>
  <div className="flex gap-2">{/* dots */}</div>
  <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white">
    <ArrowRight />
  </button>
</div>
```

---

## Removed Dependencies (in this component)
- `AnimatePresence` - no longer needed for element positioning
- `motion` wrappers - replaced with static positioning

## Preserved Functionality
- Embla Carousel with autoplay (5 second interval)
- Pause on hover
- Loop behavior
- All admin-configurable positioning values

---

## Testing Checklist
After implementation:
1. Verify no layout shift on page load
2. Test element positioning at different X values (left/center/right zones)
3. Confirm navigation works (dots, arrows)
4. Check responsive behavior across breakpoints
5. Verify admin panel coordinates match frontend display
