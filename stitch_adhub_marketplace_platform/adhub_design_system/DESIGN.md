---
name: AdHub Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-performance advertisement marketplace, balancing the precision of a financial tool with the approachability of a creative platform. The brand personality is professional, transparent, and efficient. 

The aesthetic follows a **Modern Minimalism** approach, heavily influenced by high-end SaaS patterns. It prioritizes clarity through generous whitespace, high-quality typography, and a "light-first" interface. The goal is to reduce cognitive load for users managing complex data, using subtle depth and a refined color application to guide focus without overwhelming the senses.

## Colors
The palette is anchored by **Vibrant Teal**, used strategically for primary actions and brand emphasis. The base environment uses a sophisticated range of cool grays to differentiate surface levels.

- **Primary (Teal):** Used for CTA buttons, active states, and progress indicators.
- **Secondary (Deep Charcoal):** Reserved for primary headings and high-contrast UI elements to ensure maximum legibility.
- **Status Colors:** Standardized across the system to provide immediate semantic feedback. Use low-saturation background tints (10% opacity) of these colors for alert banners and status chips.
- **Neutrality:** The background uses a very soft gray (`#F8FAFC`) to allow white container cards to "pop" with clarity, mimicking the layered depth found in premium editorial platforms.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic that remains highly readable at all scales. 

- **Weight Strategy:** Use `600` (Semi-bold) for headings to provide a strong visual anchor. Use `400` (Regular) for all long-form body text to maintain a clean, airy feel.
- **Hierarchy:** Display styles use tighter letter spacing (`-0.02em`) to maintain tension in large titles. 
- **Scale:** On mobile devices, large headlines automatically downscale to the defined mobile variants to prevent awkward line breaks and maintain the "Stripe-like" clean edge.

## Layout & Spacing
The layout follows a strict **4px baseline grid** to ensure mathematical harmony between all elements. 

- **Grid System:** A 12-column fluid grid is used for desktop layouts with a maximum width of 1280px. Gutters are fixed at 24px to provide ample "breathing room."
- **Padding Logic:** Containers and cards should utilize `xl` (32px) padding for primary content areas and `md` (16px) for tighter utility panels. 
- **Mobile Adaptivity:** On mobile (below 768px), margins compress to 16px and the grid transitions to a single-column flow.

## Elevation & Depth
Depth is signaled through **Ambient Shadows** rather than heavy borders. The system uses three distinct elevation levels to create a clear information architecture:

1.  **Level 0 (Base):** Applied to the main page background (`#F8FAFC`). Flat.
2.  **Level 1 (Raised):** Used for primary cards and content containers. A very soft, diffused shadow: `0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.02)`.
3.  **Level 2 (Overlay):** Used for dropdowns, modals, and popovers. A more pronounced, deep shadow to simulate physical lift: `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)`.

Avoid using solid dark borders. If a border is necessary for accessibility, use a 1px stroke in a very light gray (`#E2E8F0`).

## Shapes
The design system adopts a **Rounded** shape language to feel modern and approachable. 

- **Standard Elements:** Buttons, input fields, and small chips use a `0.5rem` (8px) radius.
- **Large Containers:** Cards and modals utilize `rounded-xl` at `1.5rem` (24px) to create the distinct "SaaS" soft-rectangle look typical of premium platforms.
- **Interactive States:** Hover states should not change the border radius, but can subtly increase the elevation.

## Components
- **Buttons:** Primary buttons use the Teal background with white text. They feature a subtle inner top-border (1px, white, 20% opacity) to create a slightly tactile, premium feel. 
- **Input Fields:** Use a 1px border in `#E2E8F0`. On focus, the border transitions to Teal with a 3px soft outer glow (Teal at 10% opacity).
- **Cards:** White background, 24px border radius, and Level 1 elevation. Titles inside cards should always be `headline-md`.
- **Chips:** Used for ad status (e.g., "Active", "Paused"). Use a pill-shape (`rounded-full`) with a low-saturation background color and high-saturation text for contrast.
- **Lists:** Data tables and lists should remove vertical borders, using only 1px horizontal dividers in `#F1F5F9` to maintain a clean, "unboxed" look.
- **Navigation:** Sidebars should use the `bg_subtle` gray with "ghost" style buttons for inactive items, turning Teal only when active.