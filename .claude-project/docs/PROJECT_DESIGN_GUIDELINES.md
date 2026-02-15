# Design Guidelines - CoffeeClub

**Last Updated:** 2026-02-15

This document provides the design system guidelines for both the **Dashboard** (admin panel) and **Frontend** (customer website). The Dashboard uses **shadcn/ui** with **Tailwind CSS v4** and **OKLCH color space**. The Frontend uses the **Vincent dark restaurant theme** with **TailwindCSS v4**, featuring dark charcoal backgrounds, gold accents, and uppercase sans-serif headings (PT Sans Narrow).

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
- **Framework**: React 19 + React Router 7 (framework mode) + TailwindCSS v4
- **Theme**: Vincent dark restaurant - dark charcoal backgrounds, gold accents, uppercase sans-serif headings (PT Sans Narrow)
- **Style**: Upscale, elegant, dark-mode-only, conversion-focused
- **Source**: HTML template adapted from `.claude-project/resources/HTML/`

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

### 3.1 Primary Palette: Vincent Dark Restaurant Theme

The customer-facing website uses a dark charcoal palette with gold accents, inspired by the Vincent HTML restaurant template. All pages are dark-mode-only.

| Token | Hex Value | CSS Variable / Tailwind | Usage |
|-------|-----------|------------------------|-------|
| Bg Primary | `#121618` | `--color-bg-primary` / `bg-bg-primary` | Main page background (dark charcoal) |
| Bg Secondary | `#1d2326` | `--color-bg-secondary` / `bg-bg-secondary` | Alternate section bg, page title blocks |
| Bg Card | `#1a1f22` | `--color-bg-card` / `bg-bg-card` | Card backgrounds |
| Bg Lighter | `#252c30` | `--color-bg-lighter` / `bg-bg-lighter` | Elevated surfaces, borders |
| Accent | `#c8a97e` | `--color-accent` / `text-accent` / `bg-accent` | Gold accent, links, badges, CTAs |
| Accent Hover | `#d4b88f` | `--color-accent-hover` / `bg-accent-hover` | Hover state for accent |
| Accent Dark | `#a08050` | `--color-accent-dark` / `bg-accent-dark` | Darker accent variant |
| Text Primary | `#dce4e8` | `--color-text-primary` / `text-text-primary` | Headings, nav links, primary text |
| Text Heading | `#dce4e8` | `--color-text-heading` / `text-text-heading` | H1-H6 headings (same as primary) |
| Text Body | `#b0bec5` | `--color-text-body` / `text-text-body` | Body text, descriptions |
| Text Muted | `#8a9ba5` | `--color-text-muted` / `text-text-muted` | Secondary text, placeholders |
| Border | `#252c30` | `--color-border` / `border-border` | Borders, dividers |
| Border Light | `#1d2326` | `--color-border-light` / `border-border-light` | Subtle borders |
| Success | `#22c55e` | `--color-success` | Success states |
| Error | `#ef4444` | `--color-error` / `text-error` | Error states, logout button |
| Warning | `#DAA520` | `--color-warning` | Warning states |
| Info | `#3b82f6` | `--color-info` | Info states |

### 3.2 Dark Theme (Only Theme for Frontend)

The frontend is DARK by default and dark-only. There is no light mode. Sections alternate between `bg-bg-primary` and `bg-bg-secondary` for visual separation.

| Context | Background | Text | Accent |
|---------|-----------|------|--------|
| Main page | `#121618` bg-primary | `#b0bec5` body | `#c8a97e` gold |
| Alternate sections | `#1d2326` bg-secondary | `#b0bec5` body | `#c8a97e` gold |
| Page title blocks | `#1d2326` bg-secondary | `#dce4e8` heading | `#c8a97e` gold |
| Cards | `#1a1f22` bg-card | `#dce4e8` primary | `#c8a97e` gold |
| Header | `#121618` bg-primary | `#dce4e8` primary | `#c8a97e` gold |
| Footer | `#121618` bg-primary | `#dce4e8` primary | `#c8a97e` gold |

### 3.3 Frontend Color Usage Guidelines

- **Gold accent for CTAs**: Use `bg-accent text-bg-primary` for filled buttons (`.btn-vincent-filled`)
- **Outlined buttons by default**: Use `.btn-vincent` (border + uppercase + tracking) for most actions
- **Light text on dark backgrounds**: `text-text-primary` (#dce4e8) for headings, `text-text-body` (#b0bec5) for body
- **Dark backgrounds throughout**: Main bg is `#121618`, alternate sections use `#1d2326`
- **No white surfaces**: Cards use `bg-bg-card` (#1a1f22), never white
- **Status colors**: Green for success, red for errors, goldenrod for warnings
- **Uppercase headings**: All H1-H6 are uppercase with letter-spacing via PT Sans Narrow
- **No serif or script fonts**: Removed Playfair Display, Dancing Script, Inter
- **Hover = gold**: Navigation links, buttons, and icons all transition to `text-accent` on hover
- **Product hover overlay**: Image darkens to `bg-black/50` with a circular cart button appearing

---

## 4. Typography System

### 4.1 Font Families

| Application | Font Family | Weights | Tailwind / CSS |
|-------------|-------------|---------|----------------|
| Dashboard | System/sans-serif | 400-800 | `font-sans` |
| Frontend (Headings) | PT Sans Narrow (sans-serif, condensed) | 400, 700 | `font-heading` / `var(--font-heading)` |
| Frontend (Body) | Open Sans (sans-serif) | 300-700 | `var(--font-body)` (default body font) |
| Monospace | System mono | 400-600 | `font-mono` |

**Frontend Typography Notes:**
- `font-heading` (PT Sans Narrow) is used for all H1-H6 headings, the logo, category tabs, and nav links. All headings are **uppercase** with generous **letter-spacing**.
- Body font (Open Sans) is the default via `body { font-family: var(--font-body) }` with `font-weight: 300` and `line-height: 28px`.
- **No serif or script fonts**: Playfair Display, Inter, and Dancing Script have been completely removed.
- Heading sizes are defined in `index.css` with specific `font-size`, `line-height`, and `letter-spacing` values per level (H1: 40px/8px spacing, H2: 32px/6px, H3: 28px/5px, H4: 24px/5px, H5: 18px/4px bold, H6: 16px/3px).

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
Layout (flex min-h-screen flex-col bg-bg-primary)
  + Header (3-column: phone | logo+nav | cart)
  + Main (flex-1)
    + Page Title Block (.page-title-block: bg-bg-secondary py-16 text-center)
    + Content (.vincent-container: max-w-[1170px] mx-auto px-4)
      + Section (py-16 bg-bg-primary or bg-bg-secondary alternating)
      + Menu Grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8)
        + Item Card (no border/radius - image + centered text below)
  + Footer (bg-bg-primary border-t border-border, centered layout)
  + CartDrawer (fixed right slide-in panel)
  + BackToTop button (fixed bottom-right, outlined square)
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

**Vincent Outlined (`.btn-vincent` - Default button style):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `inline-block border-2 border-text-primary text-text-primary uppercase tracking-[3px] text-sm px-4 py-1.5 transition-all duration-200` |
| Hover | `hover:border-accent hover:text-accent` |
| Focus | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` |

**Vincent Filled (`.btn-vincent-filled` - Gold CTA):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `inline-block border-2 border-accent bg-accent text-bg-primary uppercase tracking-[3px] text-sm px-4 py-1.5 transition-all duration-200` |
| Hover | `hover:bg-accent-hover hover:border-accent-hover` |
| Focus | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` |

**Nav Link (Header navigation):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `text-xs font-bold uppercase tracking-[3px] text-text-primary` |
| Hover | `hover:text-accent` |
| Active | `text-accent` |

**Note**: Frontend buttons are NOT rounded. They use sharp corners (no `rounded-*` classes) to match the Vincent template aesthetic. All buttons use uppercase text with wide letter-spacing.

### 8.3 Input Field States

**Dashboard:**

| State | Tailwind Classes |
|-------|------------------|
| Default | `border-gray-200 bg-white placeholder-gray-400` |
| Hover | `hover:border-gray-300` |
| Focus | `focus:border-primary focus:ring-2 focus:ring-primary` |
| Error | `border-red-500 focus:ring-red-500` |
| Disabled | `disabled:bg-gray-100 disabled:cursor-not-allowed` |

**Frontend (Dark Inputs with Gold Focus):**

| State | Tailwind Classes |
|-------|------------------|
| Default | `bg-transparent border-2 border-border text-text-primary w-full text-sm tracking-[3px] py-1.5 px-4 rounded-none` |
| Focus | `focus:border-accent focus:outline-none` |
| Error | `border-error` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

**Note**: Frontend inputs have NO border-radius (`rounded-none`), use transparent backgrounds, and match the Vincent template's minimalist form style with wide letter-spacing.

### 8.4 Card States

**Dashboard:**

| State | Tailwind Classes |
|-------|------------------|
| Default | `border border-gray-200 shadow-card bg-white rounded-xl` |
| Hover | `hover:shadow-lg hover:scale-[1.02] transition-all duration-300` |
| Selected | `border-primary bg-primaryLight` |

**Frontend (Dark Cards - Vincent style):**

Menu item cards in the Vincent theme do NOT use traditional card borders/shadows. Instead, they use:

| State | Tailwind Classes |
|-------|------------------|
| Default | Product image (`aspect-square bg-bg-secondary`) + text below (no card border) |
| Hover | Image: `group-hover:scale-110` with dark overlay `bg-black/50` and circular cart button |
| Sale Badge | `absolute left-3 top-3 bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary` |

For general-purpose cards (e.g., blog, orders):

| State | Tailwind Classes |
|-------|------------------|
| Default | `bg-bg-card border border-border` |
| Hover | `hover:border-accent/30 transition-colors` |

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

### 9.3 Custom Animations (Frontend)

Defined in `frontend/src/index.css`:

```css
/* Fade in with slight upward slide */
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
/* Fade up (larger distance) */
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
/* Slide in/out from right (cart drawer) */
@keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slide-out-right { from { transform: translateX(0); } to { transform: translateX(100%); } }
/* Floating effect (decorative elements) */
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
```

Usage: `.animate-fade-in`, `.animate-fade-up`, `.animate-slide-in-right`, `.animate-slide-out-right`, `.animate-float`

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

**Three-Column Dark Header (Vincent style):**
```html
<header class="bg-bg-primary">
  <div class="flex items-stretch">
    <!-- Left: Phone + Hours (hidden on mobile) -->
    <div class="hidden w-1/4 items-center justify-center border-b border-border px-4 py-4 lg:flex">
      <div class="text-center">
        <div class="text-sm font-bold tracking-[3px] text-text-primary uppercase">+1 215 456 15 15</div>
        <div class="mt-1 text-xs tracking-[2px] text-text-muted">8:00 am - 11:30 pm</div>
      </div>
    </div>
    <!-- Center: Logo + Nav -->
    <div class="flex-1 border-b border-border lg:w-1/2">
      <div class="flex justify-center py-6">
        <h1 class="font-heading text-3xl font-bold tracking-[8px] text-text-heading">
          COFFEE<span class="text-accent">CLUB</span>
        </h1>
      </div>
      <nav class="flex justify-center border-t border-border">
        <a class="px-5 py-4 text-xs font-bold uppercase tracking-[3px] text-text-primary hover:text-accent">Home</a>
        <!-- ... more links ... -->
      </nav>
    </div>
    <!-- Right: Cart Widget (hidden on mobile) -->
    <div class="hidden w-1/4 items-center justify-center border-b border-border px-4 py-4 lg:flex">
      <button class="text-center group">
        <div class="text-sm font-bold tracking-[2px] text-text-primary">$12.00</div>
        <div class="text-xs tracking-[1px] text-text-muted">2 items - View Cart</div>
      </button>
    </div>
  </div>
</header>
```

### 10.3 Frontend Menu Item Card (Vincent style)

```html
<!-- No card border/shadow - image + text below -->
<div class="group">
  <div class="relative cursor-pointer overflow-hidden">
    <div class="aspect-square overflow-hidden bg-bg-secondary">
      <img class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
    </div>
    <!-- Dark overlay with cart button on hover -->
    <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
      <button class="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full border-2 border-white text-white opacity-0 transition-all duration-300 hover:border-accent hover:text-accent group-hover:translate-y-0 group-hover:opacity-100">
        <!-- ShoppingCart icon -->
      </button>
    </div>
    <!-- Sale badge -->
    <div class="absolute left-3 top-3 bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary">Sale</div>
  </div>
  <div class="mt-4 text-center">
    <h5 class="cursor-pointer transition-colors hover:text-accent">Item Name</h5>
    <p class="mt-2 text-sm text-text-muted">Description text</p>
    <div class="mt-2 font-heading text-lg tracking-wider text-accent">$4.50</div>
  </div>
</div>
```

### 10.4 Frontend Page Title Block

```html
<!-- Used on Menu, Cart, Blog, Checkout, and other inner pages -->
<div class="page-title-block">
  <!-- .page-title-block = bg-bg-secondary py-16 text-center -->
  <h1>Page Title Here</h1>
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
- **Frontend**: Lucide React (`lucide-react`) for UI icons (ShoppingCart, User, X, ChevronDown, etc.) + React Icons (`react-icons/fa`) for social icons (FaTwitter, FaFacebook, FaInstagram)

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
- Dark minimalist design with gold accent on focus
- Global input styles in `index.css`: `bg-transparent border-2 border-border text-text-primary text-sm tracking-[3px] py-1.5 px-4 rounded-none`
- Focus: `border-accent outline-none`
- Labels: `text-sm uppercase tracking-[2px] text-text-muted mb-2`
- Error: `border-error text-error`
- Textarea: `resize-none h-[120px]`
- Validation: React Hook Form + Zod schemas
- No border-radius on any form elements

---

## 14. Accessibility Guidelines

### Focus Indicators

| Element | Tailwind Classes |
|---------|------------------|
| Dashboard Button | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
| Frontend Button | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` |
| Frontend Input | `focus:border-accent focus:outline-none` |
| Link | `focus:ring-2 focus:ring-offset-1 rounded` |

### Color Contrast (WCAG AA)
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Dashboard: Amber-600 on white passes AA for large text; stone-900 on white passes AA and AAA
- Frontend: Light text (`#dce4e8`) on dark charcoal (`#121618`) has excellent contrast (~12:1)
- Frontend body text: `#b0bec5` on `#121618` has good contrast (~8:1)
- Frontend gold accent: `#c8a97e` on `#121618` passes AA for large text (~5.5:1)
- Frontend muted text: `#8a9ba5` on `#121618` has adequate contrast (~5:1)

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

**Version:** 5.0
**Last Updated:** 2026-02-15
**Theme Change:** Warm Light Coffee (Basilico) -> Vincent Dark Restaurant Theme
