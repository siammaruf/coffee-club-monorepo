# Design Guidelines - CoffeeClub

**Last Updated:** 2026-02-11

This document provides the design system guidelines for both the **Dashboard** (admin panel) and **Frontend** (customer website). The Dashboard uses **shadcn/ui** with **Tailwind CSS v4** and **OKLCH color space**. The Frontend uses a **dark yellow/amber theme** with **TailwindCSS**.

---

## Table of Contents

1. [Application Themes](#1-application-themes)
2. [Dashboard Color System](#2-dashboard-color-system)
3. [Frontend (Customer) Color System](#3-frontend-customer-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing & Layout](#5-spacing--layout)
6. [Border Radius System](#6-border-radius-system)
7. [Shadow & Elevation](#7-shadow--elevation)
8. [Interactive States](#8-interactive-states)
9. [Animation & Transitions](#9-animation--transitions)
10. [Component Patterns](#10-component-patterns)
11. [Icon System](#11-icon-system)
12. [Responsive Breakpoints](#12-responsive-breakpoints)
13. [Form Elements](#13-form-elements)
14. [Accessibility Guidelines](#14-accessibility-guidelines)

---

## 1. Application Themes

### Dashboard (`dashboard/`)
- **Purpose**: Admin panel for staff, managers, and admins
- **Framework**: React 19 + shadcn/ui + Radix UI primitives
- **Theme**: Neutral grayscale with OKLCH colors, dark mode support via `next-themes`
- **Style**: Professional, data-dense, functional

### Frontend (`frontend/`)
- **Purpose**: Customer-facing website for browsing menu & placing orders
- **Framework**: React 19 + Vite + TailwindCSS
- **Theme**: Dark yellow/amber - warm, inviting, coffee-shop aesthetic
- **Style**: Modern, clean, visually appealing, conversion-focused

---

## 2. Dashboard Color System

### 2.1 shadcn/ui Theme Colors (OKLCH)

Uses **CSS custom properties** in OKLCH color space, defined in `dashboard/app/styles/app.css`.

**Light Mode (`:root`):**

| Token | OKLCH Value | Tailwind Class | Usage |
|-------|-------------|----------------|-------|
| `--background` | `oklch(1 0 0)` | `bg-background` | Page background (white) |
| `--foreground` | `oklch(0.145 0 0)` | `text-foreground` | Primary text (near black) |
| `--primary` | `oklch(0.205 0 0)` | `bg-primary`, `text-primary` | Primary buttons, CTA |
| `--primary-foreground` | `oklch(0.985 0 0)` | `text-primary-foreground` | Text on primary |
| `--secondary` | `oklch(0.97 0 0)` | `bg-secondary` | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `text-secondary-foreground` | Text on secondary |
| `--muted` | `oklch(0.97 0 0)` | `bg-muted` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | `text-muted-foreground` | Muted/placeholder text |
| `--accent` | `oklch(0.97 0 0)` | `bg-accent` | Accent backgrounds |
| `--accent-foreground` | `oklch(0.205 0 0)` | `text-accent-foreground` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `bg-destructive` | Error/delete actions (red) |
| `--border` | `oklch(0.922 0 0)` | `border-border` | Borders, dividers |
| `--input` | `oklch(0.922 0 0)` | `border-input` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | `ring-ring` | Focus rings |
| `--card` | `oklch(1 0 0)` | `bg-card` | Card backgrounds |
| `--popover` | `oklch(1 0 0)` | `bg-popover` | Popover backgrounds |

**Dark Mode (`.dark`):**

| Token | OKLCH Value | Tailwind Class | Usage |
|-------|-------------|----------------|-------|
| `--background` | `oklch(0.145 0 0)` | `bg-background` | Dark page background |
| `--foreground` | `oklch(0.985 0 0)` | `text-foreground` | Light text on dark |
| `--primary` | `oklch(0.922 0 0)` | `bg-primary` | Primary (light on dark) |
| `--primary-foreground` | `oklch(0.205 0 0)` | `text-primary-foreground` | Dark text on primary |
| `--destructive` | `oklch(0.704 0.191 22.216)` | `bg-destructive` | Error (brighter red) |
| `--border` | `oklch(1 0 0 / 10%)` | `border-border` | Subtle borders |

**Chart Colors (Light):**

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | Chart series 1 |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | Chart series 2 |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | Chart series 3 |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | Chart series 4 |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | Chart series 5 |

**Sidebar Colors:**

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--sidebar` | `oklch(0.985 0 0)` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | Sidebar text |
| `--sidebar-primary` | `oklch(0.205 0 0)` | Active sidebar items |
| `--sidebar-accent` | `oklch(0.97 0 0)` | Sidebar hover |

### 2.2 Dashboard Border Radius

Defined via `--radius: 0.625rem` (10px) in `:root`:

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| `--radius-sm` | ~6px | `rounded-sm` |
| `--radius-md` | ~8px | `rounded-md` |
| `--radius-lg` | 10px | `rounded-lg` |
| `--radius-xl` | ~14px | `rounded-xl` |

---

## 3. Frontend (Customer) Color System

### 3.1 Primary Palette: Dark Yellow / Amber

The customer-facing website uses a warm amber/dark-yellow palette to evoke a cozy coffee shop atmosphere.

| Token | Hex Value | Tailwind Class | Usage |
|-------|-----------|----------------|-------|
| Primary | `#D97706` | `text-amber-600`, `bg-amber-600` | Primary CTA buttons, links, key accents |
| Primary Dark | `#B45309` | `text-amber-700`, `bg-amber-700` | Hover states on primary |
| Primary Light | `#F59E0B` | `text-amber-500`, `bg-amber-500` | Highlights, badges, secondary accents |
| Primary Subtle | `#FEF3C7` | `bg-amber-100` | Light backgrounds, card accents |
| Primary Ghost | `#FFFBEB` | `bg-amber-50` | Subtle background tints |
| Background | `#FFFFFF` | `bg-white` | Main page background |
| Surface | `#FFFBEB` | `bg-amber-50` | Section backgrounds, cards |
| Text Primary | `#1C1917` | `text-stone-900` | Headings, body text |
| Text Secondary | `#78716C` | `text-stone-500` | Descriptions, muted text |
| Text on Primary | `#FFFFFF` | `text-white` | Text on amber buttons |
| Border | `#E7E5E4` | `border-stone-200` | Card borders, dividers |
| Border Accent | `#FDE68A` | `border-amber-200` | Accent borders |
| Success | `#059669` | `text-emerald-600` | Success states, available |
| Error | `#DC2626` | `text-red-600` | Error states, unavailable |
| Warning | `#D97706` | `text-amber-600` | Warning (same as primary) |

### 3.2 Dark Mode (Optional for Frontend)

If dark mode is implemented for the customer site:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#1C1917` (stone-900) | Dark page background |
| Surface | `#292524` (stone-800) | Dark cards, sections |
| Primary | `#F59E0B` (amber-500) | Brighter amber on dark |
| Text Primary | `#FAFAF9` (stone-50) | Light text |
| Text Secondary | `#A8A29E` (stone-400) | Muted text on dark |
| Border | `#44403C` (stone-700) | Dark borders |

### 3.3 Frontend Color Usage Guidelines

- **Primary amber for CTAs**: "Add to Cart", "Order Now", "Sign Up" buttons
- **Stone neutrals for text**: Warm gray tones that complement amber
- **Amber-50/100 for backgrounds**: Warm subtle backgrounds for sections
- **Avoid pure black/white**: Use stone-900 and stone-50 for warmth
- **Status colors**: Emerald for available/success, red for errors, amber for warnings
- **Coffee imagery**: Pair with warm photography, wood textures, and coffee-themed visuals

---

## 4. Typography System

### 4.1 Font Families

| Application | Font Family | Weights | Tailwind Class |
|-------------|-------------|---------|----------------|
| Dashboard | System/sans-serif | 400-800 | `font-sans` |
| Frontend | System/sans-serif (or a warm display font) | 400-800 | `font-sans` |
| Monospace | System mono | 400-600 | `font-mono` |

### 4.2 Font Size Scale

| Size | Value | Tailwind | Usage |
|------|-------|----------|-------|
| xs | 12px / 0.75rem | `text-xs` | Fine print, badges |
| sm | 14px / 0.875rem | `text-sm` | Secondary text, table data |
| base | 16px / 1rem | `text-base` | Body text |
| lg | 18px / 1.125rem | `text-lg` | Emphasis, small headings |
| xl | 20px / 1.25rem | `text-xl` | Card titles |
| 2xl | 24px / 1.5rem | `text-2xl` | Page headings |
| 3xl | 30px / 1.875rem | `text-3xl` | Large headings |
| 4xl | 36px / 2.25rem | `text-4xl` | Hero headings |

### 4.3 Font Weight Scale

| Weight | Value | Tailwind | Usage |
|--------|-------|----------|-------|
| Normal | 400 | `font-normal` | Body text |
| Medium | 500 | `font-medium` | Labels |
| Semibold | 600 | `font-semibold` | Headings, buttons |
| Bold | 700 | `font-bold` | Primary headings |
| Extrabold | 800 | `font-extrabold` | Hero text |

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Standard Tailwind spacing: `p-1` (4px) through `p-24` (96px).

### 5.2 Component-Specific Spacing

| Component | Padding | Margin | Gap |
|-----------|---------|--------|-----|
| Page Container | `px-6` or `px-8` | - | - |
| Card | `p-6` | `mb-4` or `mb-6` | - |
| Button | `px-6 py-3` | - | - |
| Input | `px-4 py-3` | `mb-4` | - |
| Section | `mb-8` to `mb-12` | - | - |
| Grid | - | - | `gap-4` to `gap-6` |

### 5.3 Layout Patterns

**Dashboard Page Layout:**
```
Container (max-w-7xl mx-auto px-6)
  + Section (mb-8)
    + Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
      + Card (p-6 rounded-xl)
```

**Frontend Page Layout:**
```
Container (max-w-6xl mx-auto px-4 sm:px-6 lg:px-8)
  + Hero Section (py-16 bg-amber-50)
  + Menu Grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6)
    + Item Card (p-4 rounded-xl bg-white border border-stone-200)
```

---

## 6. Border Radius System

| Level | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| None | 0 | `rounded-none` | Sharp corners |
| SM | 2px | `rounded-sm` | Subtle rounding |
| Default | 4px | `rounded` | Minimal rounding |
| MD | 6px | `rounded-md` | Inputs, small buttons |
| LG | 8px | `rounded-lg` | Standard buttons, badges |
| XL | 12px | `rounded-xl` | Cards, modals |
| 2XL | 16px | `rounded-2xl` | Feature cards, hero |
| Full | 9999px | `rounded-full` | Avatars, pills |

---

## 7. Shadow & Elevation

| Level | Tailwind | Usage |
|-------|----------|-------|
| None | `shadow-none` | Flat UI |
| SM | `shadow-sm` | Minimal lift |
| Default | `shadow` | Default cards |
| MD | `shadow-md` | Raised cards, dropdowns |
| LG | `shadow-lg` | Floating elements |
| XL | `shadow-xl` | Modals, popovers |
| 2XL | `shadow-2xl` | Overlays |

### Z-Index Hierarchy

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | `z-0` | Page content |
| Raised | `z-10` | Sticky headers |
| Dropdown | `z-20` | Dropdowns, tooltips |
| Overlay | `z-30` | Overlays, side panels |
| Modal | `z-40` | Modal dialogs |
| Popover | `z-50` | Popovers, toasts |

---

## 8. Interactive States

### 8.1 Dashboard Button States

| State | Tailwind Classes |
|-------|------------------|
| Default | `bg-primary text-white shadow` |
| Hover | `hover:bg-primaryDark hover:shadow-lg` |
| Focus | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
| Active | `active:scale-[0.99]` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

### 8.2 Frontend (Customer) Button States

**Primary (Amber):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `bg-amber-600 text-white font-semibold rounded-lg px-6 py-3` |
| Hover | `hover:bg-amber-700 hover:shadow-lg` |
| Focus | `focus:ring-2 focus:ring-amber-500 focus:ring-offset-2` |
| Active | `active:scale-[0.98]` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

**Secondary (Outline):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `bg-white text-amber-700 border-2 border-amber-600 rounded-lg px-6 py-3` |
| Hover | `hover:bg-amber-50` |
| Focus | `focus:ring-2 focus:ring-amber-500` |

**Ghost:**

| State | Tailwind Classes |
|-------|------------------|
| Default | `text-amber-600 bg-transparent` |
| Hover | `hover:bg-amber-50` |

### 8.3 Input Field States

| State | Tailwind Classes |
|-------|------------------|
| Default | `border-gray-200 bg-white placeholder-gray-400` |
| Hover | `hover:border-gray-300` |
| Focus (Dashboard) | `focus:border-primary focus:ring-2 focus:ring-primary` |
| Focus (Frontend) | `focus:border-amber-500 focus:ring-2 focus:ring-amber-500` |
| Error | `border-red-500 focus:ring-red-500` |
| Disabled | `disabled:bg-gray-100 disabled:cursor-not-allowed` |

### 8.4 Card States

| State | Tailwind Classes |
|-------|------------------|
| Default | `border border-gray-200 shadow-card bg-white rounded-xl` |
| Hover | `hover:shadow-lg hover:scale-[1.02] transition-all duration-300` |
| Selected (Dashboard) | `border-primary bg-primaryLight` |
| Selected (Frontend) | `border-amber-500 bg-amber-50 ring-2 ring-amber-200` |

---

## 9. Animation & Transitions

### 9.1 Timing & Duration

| Duration | Tailwind | Usage |
|----------|----------|-------|
| 100ms | `duration-100` | Quick micro-interactions |
| 150ms | `duration-150` | Button presses, toggles |
| 200ms | `duration-200` | **Default** - most UI interactions |
| 300ms | `duration-300` | Dropdown, modal open/close |
| 500ms | `duration-500` | Page transitions |

### 9.2 Standard Component Transitions

| Component | Tailwind Classes |
|-----------|------------------|
| Button | `transition-all duration-200 ease-in-out` |
| Link | `transition-colors duration-200` |
| Card | `transition-all duration-300 ease-out` |
| Input | `transition-all duration-200` |
| Dropdown | `transition-all duration-300 ease-out` |
| Modal | `transition-all duration-300` |

### 9.3 Custom Animations

```javascript
// Dashboard: Coffee steam animation
keyframes: {
  steam: {
    '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0.5' },
    '50%': { transform: 'translateY(-5px) scale(1)', opacity: '0.7' },
    '100%': { transform: 'translateY(-10px) scale(1.2)', opacity: '0' },
  },
},
animation: {
  steam: 'steam 2s ease-out infinite',  // Usage: animate-steam
},
```

---

## 10. Component Patterns

### 10.1 Dashboard Navigation

**Sidebar (Fixed Left):**
```html
<aside class="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-200">
  <a class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50">
  <a class="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary"><!-- Active -->
```

### 10.2 Frontend Navigation

**Sticky Navbar (Customer):**
```html
<nav class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <!-- Logo (amber accent) -->
    <a class="text-2xl font-bold text-amber-600">CoffeeClub</a>
    <!-- Nav links -->
    <a class="text-stone-600 hover:text-amber-600 transition-colors">Menu</a>
    <!-- Cart icon with badge -->
    <button class="relative text-stone-600 hover:text-amber-600">
      <span class="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5">3</span>
    </button>
  </div>
</nav>
```

### 10.3 Frontend Menu Item Card

```html
<div class="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
  <div class="relative aspect-square overflow-hidden">
    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    <!-- Sale badge -->
    <span class="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">SALE</span>
  </div>
  <div class="p-4">
    <h3 class="font-semibold text-stone-900">Item Name</h3>
    <p class="text-sm text-stone-500 mt-1">Description</p>
    <div class="flex items-center justify-between mt-3">
      <div>
        <span class="text-lg font-bold text-amber-600">$4.50</span>
        <span class="text-sm text-stone-400 line-through ml-2">$5.50</span>
      </div>
      <button class="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
        Add to Cart
      </button>
    </div>
  </div>
</div>
```

### 10.4 Frontend Cart Item

```html
<div class="flex items-center gap-4 py-4 border-b border-stone-200">
  <img class="w-16 h-16 rounded-lg object-cover" />
  <div class="flex-1">
    <h4 class="font-medium text-stone-900">Item Name</h4>
    <p class="text-sm text-amber-600 font-semibold">$4.50</p>
  </div>
  <div class="flex items-center gap-2">
    <button class="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100">-</button>
    <span class="w-8 text-center font-medium">2</span>
    <button class="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700">+</button>
  </div>
</div>
```

### 10.5 Dashboard Cards & Tables

**Standard Card:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-card">
```

**Data Table:**
```html
<table class="w-full">
  <thead class="bg-gray-50 sticky top-0 z-10">
    <tr><th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
  </thead>
  <tbody>
    <tr class="hover:bg-gray-50 transition-colors border-b border-gray-200">
      <td class="px-6 py-4 text-sm text-gray-700">
  </tbody>
</table>
```

### 10.6 Modal Pattern

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
    <!-- Modal content -->
  </div>
</div>
```

### 10.7 Status Badges

```html
<!-- Available / Success -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">

<!-- Pending / Warning -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">

<!-- Cancelled / Error -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">

<!-- Preparing / Info -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
```

---

## 11. Icon System

### 11.1 Libraries

- **Dashboard**: Lucide React (`lucide-react`) + React Icons (`react-icons`)
- **Frontend**: Lucide React (or Heroicons for customer-facing UI)

### 11.2 Icon Sizes

| Size | Dimensions | Tailwind | Usage |
|------|-----------|----------|-------|
| Small | 16x16px | `w-4 h-4` | Inline icons |
| Medium | 20x20px | `w-5 h-5` | Default navigation |
| Large | 24x24px | `w-6 h-6` | Prominent icons |
| XLarge | 32x32px | `w-8 h-8` | Feature icons |

---

## 12. Responsive Breakpoints

| Breakpoint | Min Width | Prefix | Usage |
|------------|-----------|--------|-------|
| Mobile | 0px | *(none)* | Mobile-first base |
| SM | 640px | `sm:` | Large phones |
| MD | 768px | `md:` | Tablets |
| LG | 1024px | `lg:` | Laptops |
| XL | 1280px | `xl:` | Desktops |
| 2XL | 1536px | `2xl:` | Large desktops |

### Layout per Breakpoint

| Component | Mobile | MD | LG |
|-----------|--------|------|------|
| Dashboard Grid | 1 col | 2 cols | 3-4 cols |
| Dashboard Sidebar | Drawer | Fixed 240px | Fixed 240px |
| Frontend Menu Grid | 1 col | 2 cols | 3-4 cols |
| Frontend Navbar | Hamburger | Full nav | Full nav |

---

## 13. Form Elements

### 13.1 Dashboard Forms
- Use shadcn/ui Form components (built on Radix)
- Validation via React Hook Form + Zod
- Error messages: `text-xs text-red-600 mt-1`

### 13.2 Frontend Forms
- Clean, minimal design with amber accents
- Focus ring: `focus:ring-2 focus:ring-amber-500`
- Labels: `text-sm font-medium text-stone-700 mb-1`
- Inputs: `border border-stone-300 rounded-lg px-4 py-3 focus:border-amber-500`
- Error: `border-red-500 text-red-600`

---

## 14. Accessibility Guidelines

### Focus Indicators

| Element | Tailwind Classes |
|---------|------------------|
| Dashboard Button | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
| Frontend Button | `focus:ring-2 focus:ring-amber-500 focus:ring-offset-2` |
| Input | `focus:ring-2 focus:ring-primary` or `focus:ring-amber-500` |
| Link | `focus:ring-2 focus:ring-offset-1 rounded` |

### Color Contrast (WCAG AA)
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Amber-600 on white: passes AA for large text; use amber-700 or amber-800 for small text
- Stone-900 on white: passes AA and AAA

### Touch Targets
- Minimum 44x44px for interactive elements
- Buttons: `min-h-[44px]`
- Icon buttons: `w-11 h-11` or `w-12 h-12`

### Screen Reader
- `aria-label` for icon-only buttons
- `aria-describedby` for form errors
- `aria-expanded` for dropdowns
- `aria-current="page"` for active nav links

### Keyboard Navigation
- All interactive elements reachable via Tab
- Enter/Space activates buttons
- Arrow keys navigate menus
- Escape closes modals/dropdowns

---

**Version:** 2.0
**Last Updated:** 2026-02-11
