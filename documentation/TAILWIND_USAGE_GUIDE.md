# Tailwind CSS + PepeShows Design System - Usage Guide

Complete guide for using the PepeShows design system with Tailwind CSS in React pages.

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core blacks
        'pepe-black': '#000000',
        'pepe-dark': '#111111',
        'pepe-ink': '#161616',
        'pepe-coal': '#0A0A0A',
        'pepe-surface': '#1A1A1A',

        // Text colors
        'pepe-white': '#FFFFFF',
        'pepe-t80': 'rgba(255, 255, 255, 0.80)',
        'pepe-t64': 'rgba(255, 255, 255, 0.64)',
        'pepe-t48': 'rgba(255, 255, 255, 0.48)',
        'pepe-t32': 'rgba(255, 255, 255, 0.32)',

        // Lines/borders
        'pepe-line': '#333333',
        'pepe-line2': '#292929',
        'pepe-line-light': '#3A3A3A',

        // Accent colors
        'pepe-gold': '#D4A574',
        'pepe-gold-hover': '#E6B887',
        'pepe-gold-active': '#C19A64',
        'pepe-bronze': '#B8860B',
        'pepe-bronze-hover': '#C69315',
        'pepe-amber': '#FFBF00',
        'pepe-copper': '#B87333',

        // Semantic
        'pepe-success': '#00DC82',
        'pepe-warning': '#FFB800',
        'pepe-error': '#FF3B3B',
        'pepe-info': '#0096FF',
      },

      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },

      spacing: {
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px
        '2': '0.5rem',       // 8px
        '3': '0.75rem',      // 12px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '8': '2rem',         // 32px
        '10': '2.5rem',      // 40px
        '12': '3rem',        // 48px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
        '24': '6rem',        // 96px
        '32': '8rem',        // 128px
      },

      borderRadius: {
        'sm': '0.25rem',     // 4px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.25rem',    // 20px
        '3xl': '1.5rem',     // 24px
      },

      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.2)',
        'xl': '0 12px 28px rgba(0, 0, 0, 0.35)',
        '2xl': '0 24px 48px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 16px rgba(212, 165, 116, 0.25)',
        'glow-strong': '0 0 24px rgba(212, 165, 116, 0.4)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 📄 Complete Page Template

### Modern React Page with PepeShows Design

**src/pages/ExamplePage.tsx**
```tsx
import React, { useState } from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';

export default function ExamplePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-pepe-black pt-20">
      {/* Hero Section */}
      <section className="bg-pepe-ink border-b border-pepe-line">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-pepe-surface text-pepe-gold text-xs font-semibold uppercase tracking-wider rounded-full">
                New Feature
              </span>

              <h1 className="font-display text-5xl lg:text-6xl font-extrabold text-pepe-white leading-tight">
                Amazing Page Title
              </h1>

              <p className="text-lg text-pepe-t80 leading-relaxed">
                A compelling description that explains what this page is about.
                Use clear, engaging language that draws the user in.
              </p>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-pepe-gold hover:bg-pepe-gold-hover text-pepe-black font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                  Get Started
                </button>

                <button className="px-6 py-3 bg-pepe-surface hover:bg-pepe-dark text-pepe-t80 font-semibold rounded-lg border-2 border-pepe-line hover:border-pepe-gold transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: DotIcon */}
            <div className="flex justify-center">
              <DotCloudImage
                disciplineId="logo"
                size={400}
                density={0.25}
                color="#D4A574"
                aspectRatio={3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-pepe-dark border-b border-pepe-line sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2 overflow-x-auto">
            {['overview', 'features', 'pricing', 'docs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-4 font-medium text-sm uppercase tracking-wider
                  transition-all duration-300 border-b-2
                  ${activeTab === tab
                    ? 'text-pepe-gold border-pepe-gold'
                    : 'text-pepe-t64 border-transparent hover:text-pepe-t80 hover:border-pepe-line'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Feature Grid */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-pepe-white mb-8">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="bg-pepe-ink border border-pepe-line rounded-xl p-6 hover:border-pepe-gold transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-pepe-gold bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <DotCloudImage
                    disciplineId="breakdance"
                    size={60}
                    density={0.3}
                    color="#D4A574"
                  />
                </div>

                <h3 className="font-display text-xl font-semibold text-pepe-white mb-2">
                  Feature {i}
                </h3>

                <p className="text-sm text-pepe-t64 leading-relaxed">
                  Description of this amazing feature and how it benefits users.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column */}
          <div className="bg-pepe-ink rounded-2xl p-8 border border-pepe-line">
            <h3 className="font-display text-2xl font-bold text-pepe-gold mb-4">
              Statistics
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-pepe-line2">
                <span className="text-pepe-t80">Total Users</span>
                <span className="text-2xl font-bold text-pepe-white">12,450</span>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-pepe-line2">
                <span className="text-pepe-t80">Active Projects</span>
                <span className="text-2xl font-bold text-pepe-white">3,240</span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-pepe-t80">Success Rate</span>
                <span className="text-2xl font-bold text-pepe-success">98.7%</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-pepe-surface rounded-xl p-6 border border-pepe-line hover:border-pepe-gold transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pepe-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pepe-black font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-pepe-white mb-2">Step One</h4>
                  <p className="text-sm text-pepe-t64">Complete the first step in your journey.</p>
                </div>
              </div>
            </div>

            <div className="bg-pepe-surface rounded-xl p-6 border border-pepe-line hover:border-pepe-gold transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pepe-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pepe-black font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-pepe-white mb-2">Step Two</h4>
                  <p className="text-sm text-pepe-t64">Continue with the second step.</p>
                </div>
              </div>
            </div>

            <div className="bg-pepe-surface rounded-xl p-6 border border-pepe-line hover:border-pepe-gold transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pepe-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pepe-black font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-pepe-white mb-2">Step Three</h4>
                  <p className="text-sm text-pepe-t64">Finalize everything and launch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pepe-gold/10 via-pepe-bronze/10 to-pepe-gold/10 rounded-2xl p-12 text-center border border-pepe-gold/20">
          <h2 className="font-display text-3xl font-bold text-pepe-white mb-4">
            Ready to Get Started?
          </h2>

          <p className="text-lg text-pepe-t80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using our platform to achieve their goals.
          </p>

          <button className="px-8 py-4 bg-pepe-gold hover:bg-pepe-gold-hover text-pepe-black font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-glow hover:shadow-glow-strong">
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-pepe-ink border-t border-pepe-line mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-pepe-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Features</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Pricing</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-pepe-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">About</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Team</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-pepe-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Blog</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Support</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-pepe-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Privacy</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Terms</a></li>
                <li><a href="#" className="text-pepe-t64 hover:text-pepe-gold transition-colors">Imprint</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-pepe-line2 text-center">
            <p className="text-sm text-pepe-t48">
              © 2025 PepeShows. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## 🎨 Component Library

### Button Variants

```tsx
// Primary Button
<button className="px-6 py-3 bg-pepe-gold hover:bg-pepe-gold-hover text-pepe-black font-semibold rounded-lg transition-all duration-300 hover:scale-105">
  Primary Action
</button>

// Secondary Button
<button className="px-6 py-3 bg-pepe-surface hover:bg-pepe-dark text-pepe-t80 font-semibold rounded-lg border-2 border-pepe-line hover:border-pepe-gold transition-all">
  Secondary Action
</button>

// Ghost Button
<button className="px-6 py-3 text-pepe-gold hover:bg-pepe-gold/10 font-semibold rounded-lg transition-all">
  Ghost Action
</button>

// Danger Button
<button className="px-6 py-3 bg-pepe-error hover:bg-red-600 text-white font-semibold rounded-lg transition-all">
  Delete
</button>

// Icon Button
<button className="w-10 h-10 flex items-center justify-center bg-pepe-surface hover:bg-pepe-gold hover:text-pepe-black text-pepe-t80 rounded-lg transition-all">
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</button>
```

### Card Variants

```tsx
// Basic Card
<div className="bg-pepe-ink border border-pepe-line rounded-xl p-6 hover:border-pepe-gold transition-all">
  <h3 className="text-xl font-semibold text-pepe-white mb-2">Card Title</h3>
  <p className="text-pepe-t64">Card content goes here.</p>
</div>

// Interactive Card
<button className="w-full bg-pepe-ink border border-pepe-line rounded-xl p-6 text-left hover:border-pepe-gold hover:scale-105 transition-all duration-300">
  <h3 className="text-xl font-semibold text-pepe-white mb-2">Clickable Card</h3>
  <p className="text-pepe-t64">This card is fully interactive.</p>
</button>

// Elevated Card
<div className="bg-pepe-ink rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all">
  <h3 className="text-xl font-semibold text-pepe-white mb-2">Elevated Card</h3>
  <p className="text-pepe-t64">With shadow for depth.</p>
</div>

// Gradient Border Card
<div className="relative bg-pepe-ink rounded-xl p-6 group">
  <div className="absolute inset-0 bg-gradient-to-r from-pepe-gold via-pepe-bronze to-pepe-gold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ padding: '2px' }}>
    <div className="bg-pepe-ink h-full w-full rounded-xl"></div>
  </div>
  <div className="relative z-10">
    <h3 className="text-xl font-semibold text-pepe-white mb-2">Gradient Border</h3>
    <p className="text-pepe-t64">Shows on hover</p>
  </div>
</div>
```

### Input Fields

```tsx
// Text Input
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-3 bg-pepe-surface border-2 border-pepe-line rounded-lg text-pepe-white placeholder:text-pepe-t48 focus:border-pepe-gold focus:outline-none transition-all"
/>

// Text Area
<textarea
  placeholder="Enter description..."
  rows={4}
  className="w-full px-4 py-3 bg-pepe-surface border-2 border-pepe-line rounded-lg text-pepe-white placeholder:text-pepe-t48 focus:border-pepe-gold focus:outline-none transition-all resize-none"
/>

// Select Dropdown
<select className="w-full px-4 py-3 bg-pepe-surface border-2 border-pepe-line rounded-lg text-pepe-white focus:border-pepe-gold focus:outline-none transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
  <option>Option 3</option>
</select>

// Checkbox
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="w-5 h-5 bg-pepe-surface border-2 border-pepe-line rounded checked:bg-pepe-gold checked:border-pepe-gold focus:outline-none transition-all"
  />
  <span className="text-pepe-t80">Accept terms and conditions</span>
</label>

// Radio Button
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="radio"
    name="option"
    className="w-5 h-5 bg-pepe-surface border-2 border-pepe-line rounded-full checked:bg-pepe-gold checked:border-pepe-gold focus:outline-none transition-all"
  />
  <span className="text-pepe-t80">Option A</span>
</label>
```

### Badges & Tags

```tsx
// Badge
<span className="inline-flex items-center px-3 py-1 bg-pepe-gold/10 text-pepe-gold text-xs font-semibold rounded-full">
  New
</span>

// Status Badge
<span className="inline-flex items-center px-3 py-1 bg-pepe-success/10 text-pepe-success text-xs font-semibold rounded-full">
  ✓ Active
</span>

// Outlined Badge
<span className="inline-flex items-center px-3 py-1 border border-pepe-gold text-pepe-gold text-xs font-semibold rounded-full">
  Featured
</span>
```

### Loading States

```tsx
// Spinner
<div className="w-8 h-8 border-4 border-pepe-line border-t-pepe-gold rounded-full animate-spin" />

// Skeleton Card
<div className="bg-pepe-ink border border-pepe-line rounded-xl p-6 animate-pulse">
  <div className="h-6 bg-pepe-surface rounded mb-4 w-3/4"></div>
  <div className="h-4 bg-pepe-surface rounded mb-2"></div>
  <div className="h-4 bg-pepe-surface rounded w-5/6"></div>
</div>

// Progress Bar
<div className="w-full h-2 bg-pepe-surface rounded-full overflow-hidden">
  <div className="h-full bg-pepe-gold rounded-full" style={{ width: '60%' }}></div>
</div>
```

---

## 🎯 Common Layouts

### Centered Content
```tsx
<div className="min-h-screen flex items-center justify-center bg-pepe-black">
  <div className="max-w-md w-full bg-pepe-ink border border-pepe-line rounded-xl p-8">
    {/* Centered content */}
  </div>
</div>
```

### Sidebar Layout
```tsx
<div className="flex min-h-screen bg-pepe-black">
  {/* Sidebar */}
  <aside className="w-64 bg-pepe-ink border-r border-pepe-line">
    <nav className="p-6 space-y-2">
      {/* Navigation items */}
    </nav>
  </aside>

  {/* Main Content */}
  <main className="flex-1 p-8">
    {/* Page content */}
  </main>
</div>
```

### Grid Gallery
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-pepe-ink rounded-xl overflow-hidden hover:scale-105 transition-transform">
      {/* Gallery item */}
    </div>
  ))}
</div>
```

---

## 💡 Pro Tips

### 1. Color Combinations
```tsx
// Gold on dark
<div className="bg-pepe-ink text-pepe-gold">

// White text on black
<div className="bg-pepe-black text-pepe-white">

// Subtle text on surface
<div className="bg-pepe-surface text-pepe-t64">
```

### 2. Hover Effects
```tsx
// Scale + border change
<div className="hover:scale-105 hover:border-pepe-gold transition-all duration-300">

// Glow effect
<button className="hover:shadow-glow transition-all">

// Background shift
<div className="bg-pepe-surface hover:bg-pepe-dark transition-colors">
```

### 3. Responsive Design
```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">
```

### 4. Dark Mode Ready
All colors are optimized for dark backgrounds. No additional dark mode configuration needed!

---

## 📦 Export for Reuse

Save this as a component template:

**src/components/templates/PageTemplate.tsx**
```tsx
import React from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageTemplate({ title, subtitle, children }: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-pepe-black pt-20">
      <section className="bg-pepe-ink border-b border-pepe-line">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="font-display text-5xl font-extrabold text-pepe-white mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-pepe-t80">{subtitle}</p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {children}
      </div>
    </div>
  );
}
```

**Usage:**
```tsx
<PageTemplate title="My Page" subtitle="Page description">
  {/* Your content here */}
</PageTemplate>
```

---

## 🚀 Getting Started Checklist

- [ ] Configure `tailwind.config.js` with PepeShows colors
- [ ] Import design system CSS (`@/index.css`)
- [ ] Copy DotCloudImage component
- [ ] Review component examples
- [ ] Test responsive breakpoints
- [ ] Verify dark theme consistency

---

**Last Updated**: 2025
**Maintained by**: PepeShows Development Team
