# PepeShows Design System

A comprehensive design system with Tailwind CSS integration for building artist agency applications with dark, elegant aesthetics and particle-based icon system.

## 🎨 Color Palette

### Core Colors
```css
/* Black Tones */
--pepe-black: #000000;     /* Pure black background */
--pepe-dark: #111111;      /* Dark sections */
--pepe-ink: #161616;       /* Card backgrounds */
--pepe-coal: #0A0A0A;      /* Deep black overlay */
--pepe-surface: #1A1A1A;   /* Interactive surfaces */

/* Text Hierarchy */
--pepe-white: #FFFFFF;          /* Headings */
--pepe-t80: rgba(255,255,255,0.80);  /* Primary text */
--pepe-t64: rgba(255,255,255,0.64);  /* Secondary text */
--pepe-t48: rgba(255,255,255,0.48);  /* Tertiary text */
--pepe-t32: rgba(255,255,255,0.32);  /* Disabled text */

/* UI Lines */
--pepe-line: #333333;       /* Primary borders */
--pepe-line2: #292929;      /* Secondary borders */
--pepe-line-light: #3A3A3A; /* Hover borders */
```

### Accent Colors - Warm Golden Theatre Lighting
```css
/* Primary Gold */
--pepe-gold: #D4A574;              /* Main accent */
--pepe-gold-hover: #E6B887;        /* Hover state */
--pepe-gold-active: #C19A64;       /* Active/pressed */
--pepe-gold-glow: rgba(212,165,116,0.25);   /* Glow effect */
--pepe-gold-glow-strong: rgba(212,165,116,0.4); /* Strong glow */

/* Secondary Warm Tones */
--pepe-bronze: #B8860B;            /* Bronze accent */
--pepe-bronze-hover: #C69315;      /* Bronze hover */
--pepe-bronze-active: #9C6F09;     /* Bronze active */
--pepe-amber: #FFBF00;             /* Bright amber */
--pepe-copper: #B87333;            /* Copper tone */
```

### Semantic Colors
```css
--pepe-success: #00DC82;
--pepe-warning: #FFB800;
--pepe-error: #FF3B3B;
--pepe-info: #0096FF;
```

### Tailwind Usage
```jsx
// Background colors
className="bg-pepe-black bg-pepe-ink bg-pepe-surface"

// Text colors
className="text-pepe-white text-pepe-t80 text-pepe-gold"

// Border colors
className="border-pepe-line border-pepe-gold"

// Custom colors (inline)
style={{ color: 'var(--pepe-gold)' }}
```

---

## 📝 Typography

### Font Families
```css
--font-display: 'Outfit', system-ui, sans-serif;  /* Headings */
--font-body: 'Inter', system-ui, sans-serif;      /* Body text */
--font-mono: 'JetBrains Mono', monospace;         /* Code */
```

### Heading Styles
```jsx
<h1 className="h1">Main Title</h1>         // 48-60px, extrabold
<h2 className="h2">Section Title</h2>      // 36-48px, bold
<h3 className="h3">Subsection</h3>         // 28-36px, semibold
<h4 className="h4">Card Title</h4>         // 24-28px, semibold
<h5 className="h5">Small Heading</h5>      // 20px, medium
<h6 className="h6">Tiny Heading</h6>       // 18px, medium
```

### Display Styles
```jsx
<h1 className="display-1">Hero Title</h1>     // 72-96px, black weight
<h2 className="display-2">Sub Hero</h2>       // 60-72px, extrabold
<h1 className="display-gradient">Gradient</h1> // With gradient text
```

### Body Text
```jsx
<p className="body-xl">Extra large body</p>  // 20px
<p className="body-lg">Large body</p>        // 18px
<p className="body">Regular body</p>         // 16px (default)
<p className="body-sm">Small body</p>        // 14px
<p className="body-xs">Tiny body</p>         // 12px
```

### Special Text
```jsx
<p className="lead">Leading paragraph</p>    // 20px, light
<p className="caption">Caption text</p>      // 14px, secondary color
<span className="label">LABEL</span>         // 12px, uppercase, semibold
<span className="overline">OVERLINE</span>   // 12px, uppercase, gold
<code className="code">inline code</code>    // Monospace, gold
```

### Font Weights
```jsx
className="font-light font-regular font-medium"
className="font-semibold font-bold font-extrabold font-black"
```

### Text Utilities
```jsx
// Alignment
className="text-left text-center text-right"

// Transform
className="uppercase lowercase capitalize"

// Line height
className="leading-none leading-tight leading-normal leading-loose"

// Letter spacing
className="tracking-tight tracking-normal tracking-wide tracking-widest"

// Truncate
className="truncate line-clamp-2 line-clamp-3"
```

---

## 📏 Spacing Scale

### Spacing Tokens
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Usage
```jsx
// Padding
className="p-4 px-6 py-8"
style={{ padding: 'var(--space-4)' }}

// Margin
className="m-4 mx-6 my-8 mb-12"
style={{ margin: 'var(--space-6) 0' }}

// Gap (flexbox/grid)
className="gap-4 gap-x-6 gap-y-8"
style={{ gap: 'var(--space-4)' }}
```

---

## 🎯 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.25rem;  /* 20px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Circle */
```

### Usage
```jsx
className="rounded-md rounded-lg rounded-xl rounded-full"
style={{ borderRadius: 'var(--radius-lg)' }}
```

---

## 🌊 Shadows

### Shadow Scale
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 8px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
--shadow-xl: 0 12px 28px rgba(0,0,0,0.35);
--shadow-2xl: 0 24px 48px rgba(0,0,0,0.4);
```

### Glow Effects
```css
--shadow-glow-sm: 0 0 8px var(--pepe-gold-glow);
--shadow-glow-md: 0 0 16px var(--pepe-gold-glow);
--shadow-glow-lg: 0 0 24px var(--pepe-gold-glow);
```

---

## ⚡ Animations

### Duration
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
--duration-slowest: 1000ms;
```

### Easing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Transitions
```css
--transition-all: all var(--duration-normal) var(--ease-in-out);
--transition-colors: background-color, border-color, color... (300ms);
--transition-opacity: opacity var(--duration-normal) var(--ease-in-out);
--transition-transform: transform var(--duration-normal) var(--ease-spring);
```

### Usage
```jsx
// Tailwind
className="transition-all duration-300 ease-in-out"
className="hover:scale-105 hover:opacity-80"

// CSS
style={{
  transition: 'var(--transition-all)',
  transitionDuration: 'var(--duration-fast)'
}}
```

---

## 🎲 DotIcon System

### Component Import
```jsx
import DotCloudImage from '@/components/ui/DotCloudImage';
```

### Basic Usage
```jsx
<DotCloudImage
  disciplineId="logo"        // Icon identifier
  size={400}                 // Height in pixels
  density={0.25}             // Particle density (0.1-2.0)
  color="#D4A574"            // Hex color
  aspectRatio={3}            // Width/height ratio
/>
```

### Advanced Configuration
```jsx
<DotCloudImage
  disciplineId="breakdance"
  size={500}
  density={0.3}
  color="var(--pepe-gold)"
  aspectRatio={1}
  minDotSize={0.5}           // Minimum particle size
  maxDotSize={5.0}           // Maximum particle size
  sampleGap={2}              // Pixel sampling (1-10)
  manualAnimationPosition={75} // Animation control (0-100)
/>
```

### Available Icons
```javascript
// All available discipline icons
const icons = [
  'logo',              // PepeShows logo (3:1 ratio)
  'breakdance',        // Breakdance
  'contemporary',      // Contemporary Dance
  'cyrwheel',          // Cyr-Wheel
  'handstand',         // Handstand
  'juggling',          // Jonglage
  'luftakrobatik',     // Aerial acrobatics
  'magician',          // Magician
  'pantomime',         // Pantomime
  'partnerakrobatik',  // Partner acrobatics
  'pole',              // Chinese Pole
  'world',             // Responsibility/World
];
```

### Color Presets
```javascript
const dotIconColors = {
  gold: '#D4A574',      // Primary (default)
  bronze: '#B8860B',    // Bronze tone
  amber: '#FFBF00',     // Bright amber
  copper: '#B87333',    // Copper tone
  white: '#FFFFFF',     // Pure white
  crimson: '#DC143C',   // Red accent
  emerald: '#50C878',   // Green
  sapphire: '#0F52BA',  // Blue
};
```

### Performance Tips
- **sampleGap**: Lower values (1-3) = higher quality, more particles
- **density**: 0.15-0.30 recommended for production
- **size**: Keep under 600px for optimal performance
- Use `manualAnimationPosition` sparingly for interactive elements

### Animation Example
```jsx
const [position, setPosition] = useState(100);

// Animate from 90 to 100 (subtle reveal)
useEffect(() => {
  const animate = () => {
    setPosition(prev => {
      if (prev < 100) return prev + 0.5;
      return 90; // Loop
    });
  };
  const interval = setInterval(animate, 50);
  return () => clearInterval(interval);
}, []);

<DotCloudImage
  disciplineId="juggling"
  size={400}
  manualAnimationPosition={position}
/>
```

---

## 📱 Responsive Breakpoints

### Breakpoint Values
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### Tailwind Classes
```jsx
// Mobile-first responsive design
className="text-base md:text-lg lg:text-xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="p-4 md:p-6 lg:p-8"
```

### CSS Media Queries
```css
@media (max-width: 768px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .hero-section {
    padding: var(--space-32) 0;
  }
}
```

---

## 🎨 Component Examples

### Button Styles
```jsx
// Primary button
<button className="btn btn-primary">
  Click Me
</button>

// Custom styled button
<button style={{
  background: 'var(--pepe-gold)',
  color: 'var(--pepe-black)',
  padding: 'var(--space-3) var(--space-6)',
  borderRadius: 'var(--radius-lg)',
  border: 'none',
  fontWeight: 'var(--font-semibold)',
  transition: 'var(--transition-all)',
  cursor: 'pointer'
}}>
  Golden Button
</button>
```

### Card Component
```jsx
<div style={{
  background: 'var(--pepe-ink)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  border: '1px solid var(--pepe-line)',
  transition: 'var(--transition-all)'
}}>
  <h3 className="h4" style={{ color: 'var(--pepe-gold)' }}>
    Card Title
  </h3>
  <p className="body" style={{ color: 'var(--pepe-t64)' }}>
    Card content goes here
  </p>
</div>
```

### Input Field
```jsx
<input
  type="text"
  style={{
    width: '100%',
    padding: 'var(--space-3)',
    background: 'var(--pepe-surface)',
    border: '2px solid var(--pepe-line)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--pepe-white)',
    fontSize: 'var(--text-base)',
    transition: 'var(--transition-all)'
  }}
  onFocus={(e) => {
    e.target.style.borderColor = 'var(--pepe-gold)';
  }}
/>
```

---

## 🚀 Quick Start Guide

### 1. Import Design System
```jsx
// In your component
import '@/index.css';  // Includes all design tokens
```

### 2. Use CSS Variables
```jsx
<div style={{
  background: 'var(--pepe-black)',
  color: 'var(--pepe-t80)',
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-lg)'
}}>
  Content
</div>
```

### 3. Combine with Tailwind
```jsx
<div className="bg-pepe-ink p-6 rounded-xl border border-pepe-line">
  <h2 className="h3 text-pepe-gold mb-4">Title</h2>
  <p className="body text-pepe-t64">Description</p>
</div>
```

### 4. Use DotIcons
```jsx
<DotCloudImage
  disciplineId="breakdance"
  size={400}
  color="var(--pepe-gold)"
/>
```

---

## 🎭 Layout Patterns

### Container
```jsx
<div className="showcase-container" style={{
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 var(--space-6)'
}}>
  {/* Content */}
</div>
```

### Grid Layout
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--space-6)'
}}>
  {/* Grid items */}
</div>
```

### Flex Layout
```jsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-4)'
}}>
  {/* Flex items */}
</div>
```

---

## 💡 Best Practices

### Color Usage
- Use `--pepe-gold` for primary accents and CTAs
- Use `--pepe-t80` for primary text readability
- Use `--pepe-t64` for secondary/caption text
- Always maintain sufficient contrast (WCAG AA minimum)

### Typography
- Use `h1-h6` classes for semantic headings
- Use `body` classes for consistent text sizing
- Limit line length to ~70 characters for readability
- Use `leading-relaxed` or `leading-loose` for body text

### Spacing
- Use consistent spacing scale (multiples of 4px)
- Prefer padding over margin for component internals
- Use gap for flex/grid layouts
- Mobile: reduce spacing by ~30-50%

### Performance
- Limit DotIcon particle count (density 0.15-0.30)
- Use `sampleGap` 2-3 for production
- Avoid animating heavy components on scroll
- Lazy load images and heavy components

### Accessibility
- Maintain color contrast ratios
- Provide focus indicators
- Use semantic HTML
- Include ARIA labels for interactive elements
- Test with keyboard navigation

---

## 📦 File Structure

```
frontend/
├── src/
│   ├── index.css                    # Main CSS entry
│   ├── styling/
│   │   ├── tokens.css               # Design tokens
│   │   ├── typography.css           # Typography system
│   │   ├── components.css           # Component styles
│   │   └── animations.css           # Animation utilities
│   ├── components/
│   │   └── ui/
│   │       └── DotCloudImage.tsx    # DotIcon component
│   └── pages/
│       ├── DotIconShowcase.tsx      # Interactive demo
│       └── DotCloudDemo.tsx         # Configuration tool
└── public/
    └── doticons/                    # Icon source images
        ├── logo.jpg
        ├── breakdance.jpg
        └── ...
```

---

## 🔗 Tailwind Integration

### tailwind.config.js Extension
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'pepe-black': '#000000',
        'pepe-ink': '#161616',
        'pepe-surface': '#1A1A1A',
        'pepe-gold': '#D4A574',
        'pepe-bronze': '#B8860B',
        'pepe-t80': 'rgba(255, 255, 255, 0.80)',
        'pepe-t64': 'rgba(255, 255, 255, 0.64)',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
};
```

---

## 📚 Resources

- **Demo Page**: `/frontend/src/pages/DotIconShowcase.tsx`
- **Configuration Tool**: `/frontend/src/pages/DotCloudDemo.tsx`
- **Design Tokens**: `/frontend/src/styling/tokens.css`
- **Typography**: `/frontend/src/styling/typography.css`

---

## 🎉 Usage in New Projects

1. **Copy design tokens**: Import `tokens.css` and `typography.css`
2. **Configure Tailwind**: Extend config with PepeShows colors
3. **Import DotCloudImage**: Copy component from `components/ui/`
4. **Copy icon assets**: Transfer `/public/doticons/` folder
5. **Follow patterns**: Reference `DotIconShowcase.tsx` for examples

---

**Design System Version**: 1.0.0
**Last Updated**: 2025
**Maintained by**: PepeShows Development Team
