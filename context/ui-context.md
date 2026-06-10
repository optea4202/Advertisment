# UI Context — AdHub Design System

This file is the single source of truth for all visual design tokens used in this project.
All values defined here must be implemented as CSS custom properties in `client/src/styles/variables.css`.
No hardcoded hex values, pixel values, or font names are permitted anywhere outside this file and `variables.css`.

---

## Brand Personality

**Professional. Transparent. Efficient.**

Modern Minimalism inspired by high-end SaaS platforms. Light-first interface. Generous whitespace.
Teal as the primary brand anchor. Cool gray surfaces for layered depth. Stripe-like clean edges at every scale.

---

## Color Tokens

### Primary — Teal

Used for CTA buttons, active nav states, focus rings, progress indicators, and brand emphasis.

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `primary` | `--color-primary` | `#00685f` | Primary buttons, active state fill |
| `on-primary` | `--color-on-primary` | `#ffffff` | Text/icons on primary background |
| `primary-container` | `--color-primary-container` | `#008378` | Hover state of primary button |
| `on-primary-container` | `--color-on-primary-container` | `#f4fffc` | Text on primary-container |
| `inverse-primary` | `--color-inverse-primary` | `#6bd8cb` | Teal accent on dark/inverse surfaces |
| `primary-fixed` | `--color-primary-fixed` | `#89f5e7` | Subtle teal tint backgrounds, chips |
| `primary-fixed-dim` | `--color-primary-fixed-dim` | `#6bd8cb` | Dimmed teal tint, secondary chips |
| `on-primary-fixed` | `--color-on-primary-fixed` | `#00201d` | Text on primary-fixed background |
| `on-primary-fixed-variant` | `--color-on-primary-fixed-variant` | `#005049` | Secondary text on primary-fixed |
| `surface-tint` | `--color-surface-tint` | `#006a61` | Tint overlay on surfaces (e.g. hover) |

### Secondary — Deep Charcoal/Slate

Used for primary headings, high-contrast UI elements, secondary buttons, and supporting labels.

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `secondary` | `--color-secondary` | `#565e74` | Secondary button fill, supporting text |
| `on-secondary` | `--color-on-secondary` | `#ffffff` | Text on secondary background |
| `secondary-container` | `--color-secondary-container` | `#dae2fd` | Secondary button hover, tag backgrounds |
| `on-secondary-container` | `--color-on-secondary-container` | `#5c647a` | Text on secondary-container |
| `secondary-fixed` | `--color-secondary-fixed` | `#dae2fd` | Fixed secondary tint |
| `secondary-fixed-dim` | `--color-secondary-fixed-dim` | `#bec6e0` | Dimmed secondary tint |
| `on-secondary-fixed` | `--color-on-secondary-fixed` | `#131b2e` | Text on secondary-fixed |
| `on-secondary-fixed-variant` | `--color-on-secondary-fixed-variant` | `#3f465c` | Secondary text on secondary-fixed |

### Tertiary — Electric Indigo

Used sparingly as an accent for badges, highlights, featured labels, and decorative elements.

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `tertiary` | `--color-tertiary` | `#4648d4` | Accent badges, highlight labels |
| `on-tertiary` | `--color-on-tertiary` | `#ffffff` | Text on tertiary background |
| `tertiary-container` | `--color-tertiary-container` | `#6063ee` | Tertiary hover state |
| `on-tertiary-container` | `--color-on-tertiary-container` | `#fffbff` | Text on tertiary-container |
| `tertiary-fixed` | `--color-tertiary-fixed` | `#e1e0ff` | Subtle indigo tint backgrounds |
| `tertiary-fixed-dim` | `--color-tertiary-fixed-dim` | `#c0c1ff` | Dimmed indigo tint |
| `on-tertiary-fixed` | `--color-on-tertiary-fixed` | `#07006c` | Text on tertiary-fixed |
| `on-tertiary-fixed-variant` | `--color-on-tertiary-fixed-variant` | `#2f2ebe` | Secondary text on tertiary-fixed |

### Error & Status

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `error` | `--color-error` | `#ba1a1a` | Error text, destructive action icons |
| `on-error` | `--color-on-error` | `#ffffff` | Text on error background |
| `error-container` | `--color-error-container` | `#ffdad6` | Error alert banner background |
| `on-error-container` | `--color-on-error-container` | `#93000a` | Text inside error banners |

> **Status chip rule:** Use `error-container` as background at full opacity and `on-error-container` as text. Do not use raw `error` as a background — it is too saturated. Apply the same low-saturation-background / high-saturation-text pattern for success (use `primary-fixed` / `on-primary-fixed`) and info (use `tertiary-fixed` / `on-tertiary-fixed`).

### Surface Scale

The surface scale defines the layered depth system. Lower numbers = closer to the page background. Higher numbers = elevated containers.

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `background` | `--color-background` | `#f8f9ff` | Page background (Level 0) |
| `surface` | `--color-surface` | `#f8f9ff` | Default surface |
| `surface-dim` | `--color-surface-dim` | `#cbdbf5` | Dimmed/disabled surface areas |
| `surface-bright` | `--color-surface-bright` | `#f8f9ff` | Highlighted surface areas |
| `surface-container-lowest` | `--color-surface-container-lowest` | `#ffffff` | Cards, modals, popovers (Level 1) |
| `surface-container-low` | `--color-surface-container-low` | `#eff4ff` | Secondary card backgrounds |
| `surface-container` | `--color-surface-container` | `#e5eeff` | Input field backgrounds |
| `surface-container-high` | `--color-surface-container-high` | `#dce9ff` | Sidebar, panel backgrounds |
| `surface-container-highest` | `--color-surface-container-highest` | `#d3e4fe` | Chip and tag backgrounds |
| `surface-variant` | `--color-surface-variant` | `#d3e4fe` | Alternative surface containers |
| `inverse-surface` | `--color-inverse-surface` | `#213145` | Dark tooltips, snackbars |
| `inverse-on-surface` | `--color-inverse-on-surface` | `#eaf1ff` | Text on inverse-surface |

### On-Surface & Outline

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `on-surface` | `--color-on-surface` | `#0b1c30` | Primary body text, headings |
| `on-background` | `--color-on-background` | `#0b1c30` | Text on page background |
| `on-surface-variant` | `--color-on-surface-variant` | `#3d4947` | Secondary text, captions, placeholders |
| `outline` | `--color-outline` | `#6d7a77` | Visible borders, dividers |
| `outline-variant` | `--color-outline-variant` | `#bcc9c6` | Subtle dividers, inactive borders |

---

## Typography

Font family: **Inter** (loaded from Google Fonts). Used exclusively throughout the system.

| Token | CSS Variable | Font Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display-lg` | `--type-display-lg` | 48px | 700 | 56px | -0.02em | Hero section titles, landing headers |
| `headline-lg` | `--type-headline-lg` | 32px | 600 | 40px | -0.01em | Page-level headings (desktop) |
| `headline-lg-mobile` | `--type-headline-lg-mobile` | 24px | 600 | 32px | -0.01em | Page-level headings (below 768px) |
| `headline-md` | `--type-headline-md` | 24px | 600 | 32px | 0 | Card titles, section headings |
| `body-lg` | `--type-body-lg` | 18px | 400 | 28px | 0 | Featured descriptions, intro paragraphs |
| `body-md` | `--type-body-md` | 16px | 400 | 24px | 0 | Standard body text, ad descriptions |
| `body-sm` | `--type-body-sm` | 14px | 400 | 20px | 0 | Secondary text, captions, helper text |
| `label-md` | `--type-label-md` | 14px | 500 | 20px | 0 | Button labels, form labels, nav items |
| `label-sm` | `--type-label-sm` | 12px | 600 | 16px | 0 | Chips, badges, status tags, timestamps |

**Typography Rules:**
- Use `headline-lg` on desktop and `headline-lg-mobile` on mobile (below 768px) for all page-level `<h1>` elements.
- Use `headline-md` for all card and section `<h2>` elements.
- Use `body-md` for all long-form content (ad descriptions, review text).
- Use `label-md` for all button text and form labels.
- Use `label-sm` for all chips, badges, and status indicators.

---

## Border Radius Scale

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| `radius-sm` | `--radius-sm` | 0.25rem (4px) | Small elements: checkboxes, small tags |
| `radius-default` | `--radius-default` | 0.5rem (8px) | Buttons, input fields, small chips |
| `radius-md` | `--radius-md` | 0.75rem (12px) | Medium components: dropdowns, tooltips |
| `radius-lg` | `--radius-lg` | 1rem (16px) | Standard cards |
| `radius-xl` | `--radius-xl` | 1.5rem (24px) | Large cards, modals, image containers |
| `radius-full` | `--radius-full` | 9999px | Pills, avatar circles, status chips |

---

## Spacing Scale

Based on a strict **4px baseline grid**. All spacing values must be multiples of 4.

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| `space-xs` | `--space-xs` | 4px | Icon-to-label gap, tight inline spacing |
| `space-sm` | `--space-sm` | 8px | Internal component padding (chips, badges) |
| `space-md` | `--space-md` | 16px | Form element padding, compact panels |
| `space-lg` | `--space-lg` | 24px | Card internal padding (default) |
| `space-xl` | `--space-xl` | 32px | Primary content area padding |
| `space-xxl` | `--space-xxl` | 48px | Section vertical spacing |
| `container-max` | `--container-max` | 1280px | Maximum page content width |
| `gutter` | `--gutter` | 24px | Grid column gutter |

---

## Elevation & Shadow Scale

Depth is communicated through ambient shadows — never through heavy borders.

| Level | CSS Variable | Shadow Value | Usage |
|---|---|---|---|
| Level 0 | `--shadow-0` | `none` | Page background, flat elements |
| Level 1 | `--shadow-1` | `0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.02)` | Cards, content containers |
| Level 2 | `--shadow-2` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | Dropdowns, modals, popovers |

**Elevation Rules:**
- Never use solid dark borders to create depth. Use shadow levels instead.
- If a border is required for accessibility, use a 1px stroke in `--color-outline-variant` (`#bcc9c6`).
- Hover states may increase elevation level (Level 1 → Level 2) but must not change border radius.

---

## Component Token Reference

### Buttons

| State | Background | Text | Border |
|---|---|---|---|
| Default (Primary) | `--color-primary` | `--color-on-primary` | 1px top inner: `rgba(255,255,255,0.2)` |
| Hover (Primary) | `--color-primary-container` | `--color-on-primary-container` | Same |
| Default (Secondary) | `--color-secondary` | `--color-on-secondary` | None |
| Hover (Secondary) | `--color-secondary-container` | `--color-on-secondary-container` | None |
| Disabled | `--color-surface-container-high` | `--color-on-surface-variant` | None |

### Input Fields

| State | Border | Background | Text |
|---|---|---|---|
| Default | 1px `--color-outline-variant` | `--color-surface-container` | `--color-on-surface` |
| Focus | 1px `--color-primary` + 3px glow `rgba(0,104,95,0.1)` | `--color-surface-container-lowest` | `--color-on-surface` |
| Error | 1px `--color-error` | `--color-error-container` | `--color-on-surface` |
| Placeholder | — | — | `--color-on-surface-variant` |

### Cards

| Property | Value |
|---|---|
| Background | `--color-surface-container-lowest` (`#ffffff`) |
| Border Radius | `--radius-xl` (24px) |
| Shadow | `--shadow-1` |
| Internal Padding | `--space-lg` (24px) |
| Title Style | `--type-headline-md` |

### Status Chips

| Status | Background | Text | Shape |
|---|---|---|---|
| Active / Success | `--color-primary-fixed` | `--color-on-primary-fixed` | `--radius-full` |
| Pending / Info | `--color-tertiary-fixed` | `--color-on-tertiary-fixed` | `--radius-full` |
| Error / Danger | `--color-error-container` | `--color-on-error-container` | `--radius-full` |
| Neutral | `--color-surface-container-highest` | `--color-on-surface-variant` | `--radius-full` |

### Navigation Sidebar

| State | Background | Text | Icon |
|---|---|---|---|
| Inactive item | Transparent | `--color-on-surface-variant` | `--color-on-surface-variant` |
| Hover item | `--color-surface-container-low` | `--color-on-surface` | `--color-on-surface` |
| Active item | `--color-primary-fixed` | `--color-primary` | `--color-primary` |
| Sidebar background | `--color-surface-container-high` | — | — |

### Dividers / Lists

| Type | Style |
|---|---|
| Horizontal list divider | 1px solid `--color-outline-variant` |
| Section divider | 1px solid `--color-surface-container-high` |
| Vertical border | **Never used** — use whitespace instead |

---

## Accent Color Variants

These are derived accent values for use in AI-generated content callouts, featured ad badges, and promotional elements. Use sparingly.

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `accent-teal-subtle` | `--color-accent-teal-subtle` | `#89f5e7` | Featured ad highlight strip |
| `accent-indigo-subtle` | `--color-accent-indigo-subtle` | `#e1e0ff` | "New" or "Trending" badge background |
| `accent-indigo-strong` | `--color-accent-indigo-strong` | `#4648d4` | "Trending" badge text/icon |
| `accent-dark` | `--color-accent-dark` | `#213145` | Dark tooltip background, inverse banners |

---

## CSS Custom Properties — `variables.css` Template

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Primary */
  --color-primary: #00685f;
  --color-on-primary: #ffffff;
  --color-primary-container: #008378;
  --color-on-primary-container: #f4fffc;
  --color-inverse-primary: #6bd8cb;
  --color-primary-fixed: #89f5e7;
  --color-primary-fixed-dim: #6bd8cb;
  --color-on-primary-fixed: #00201d;
  --color-on-primary-fixed-variant: #005049;
  --color-surface-tint: #006a61;

  /* Secondary */
  --color-secondary: #565e74;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #dae2fd;
  --color-on-secondary-container: #5c647a;
  --color-secondary-fixed: #dae2fd;
  --color-secondary-fixed-dim: #bec6e0;
  --color-on-secondary-fixed: #131b2e;
  --color-on-secondary-fixed-variant: #3f465c;

  /* Tertiary */
  --color-tertiary: #4648d4;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #6063ee;
  --color-on-tertiary-container: #fffbff;
  --color-tertiary-fixed: #e1e0ff;
  --color-tertiary-fixed-dim: #c0c1ff;
  --color-on-tertiary-fixed: #07006c;
  --color-on-tertiary-fixed-variant: #2f2ebe;

  /* Error */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* Surface */
  --color-background: #f8f9ff;
  --color-on-background: #0b1c30;
  --color-surface: #f8f9ff;
  --color-surface-dim: #cbdbf5;
  --color-surface-bright: #f8f9ff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #eff4ff;
  --color-surface-container: #e5eeff;
  --color-surface-container-high: #dce9ff;
  --color-surface-container-highest: #d3e4fe;
  --color-surface-variant: #d3e4fe;
  --color-inverse-surface: #213145;
  --color-inverse-on-surface: #eaf1ff;

  /* On-Surface & Outline */
  --color-on-surface: #0b1c30;
  --color-on-surface-variant: #3d4947;
  --color-outline: #6d7a77;
  --color-outline-variant: #bcc9c6;

  /* Accents */
  --color-accent-teal-subtle: #89f5e7;
  --color-accent-indigo-subtle: #e1e0ff;
  --color-accent-indigo-strong: #4648d4;
  --color-accent-dark: #213145;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --type-display-lg-size: 48px;
  --type-display-lg-weight: 700;
  --type-display-lg-line-height: 56px;
  --type-display-lg-letter-spacing: -0.02em;

  --type-headline-lg-size: 32px;
  --type-headline-lg-weight: 600;
  --type-headline-lg-line-height: 40px;
  --type-headline-lg-letter-spacing: -0.01em;

  --type-headline-lg-mobile-size: 24px;
  --type-headline-lg-mobile-weight: 600;
  --type-headline-lg-mobile-line-height: 32px;
  --type-headline-lg-mobile-letter-spacing: -0.01em;

  --type-headline-md-size: 24px;
  --type-headline-md-weight: 600;
  --type-headline-md-line-height: 32px;

  --type-body-lg-size: 18px;
  --type-body-lg-weight: 400;
  --type-body-lg-line-height: 28px;

  --type-body-md-size: 16px;
  --type-body-md-weight: 400;
  --type-body-md-line-height: 24px;

  --type-body-sm-size: 14px;
  --type-body-sm-weight: 400;
  --type-body-sm-line-height: 20px;

  --type-label-md-size: 14px;
  --type-label-md-weight: 500;
  --type-label-md-line-height: 20px;

  --type-label-sm-size: 12px;
  --type-label-sm-weight: 600;
  --type-label-sm-line-height: 16px;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-default: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  --container-max: 1280px;
  --gutter: 24px;

  /* Elevation */
  --shadow-0: none;
  --shadow-1: 0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.02);
  --shadow-2: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}
```
