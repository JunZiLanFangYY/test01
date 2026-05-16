---
name: Industrial Precision
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#8990a8'
  on-tertiary-container: '#22293d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 1.5rem
  gutter: 1rem
  panel-gap: 0.75rem
  compact-padding: 0.5rem
---

## Brand & Style

The design system is engineered for high-end BIM (Building Information Modeling) and structural engineering environments. The brand personality is **authoritative, technical, and atmospheric**, designed to fade into the background while highlighting complex 3D assets. It prioritizes clarity in high-density data environments, evoking a sense of "Mission Control" for modern infrastructure.

The visual style is a hybrid of **Corporate Modern** and **Glassmorphism**. It utilizes semi-transparent surfaces to maintain a sense of depth and spatial context, allowing the 3D viewport to remain visible behind interface panels. High-precision borders and subtle glow effects reinforce a "high-tech" engineering aesthetic, ensuring the interface feels like a professional-grade tool rather than a consumer app.

## Colors

The palette is anchored in a deep, industrial **Dark Mode** to minimize eye strain during long engineering review sessions and to provide maximum contrast for 3D geometry.

- **Primary (Electric Blue):** Used exclusively for high-priority actions, active states, and selection highlights.
- **Surface (Deep Navy):** The base background of the application, providing a solid, prestigious foundation.
- **Panels (Slate):** Semi-transparent layers used for sidebars and floating widgets.
- **Reinforcement Palette:** Specialized colors (Green, Red, Yellow) are reserved for structural health, steel bar tension states, and collision detection alerts. These should be used with high saturation to stand out against the muted background.

## Typography

The design system utilizes **Inter** for its exceptional legibility in technical contexts and its "neutral-cool" tone. 

- **Technical Data:** Use `label-sm` for readouts, coordinate systems, and engineering metadata.
- **Hierarchy:** Maintain a flat hierarchy for most panels to maximize vertical space, using weight (SemiBold) rather than size to distinguish headers.
- **Numerical Content:** Since BIM software is data-heavy, ensure all numerical displays use tabular figures (mono-spacing for numbers) to prevent "jumping" during real-time data updates.

## Layout & Spacing

This design system uses a **systematic fluid grid** optimized for widescreen workstations. The 3D viewport occupies the central "Canvas," while analytical tools and property inspectors reside in docked or floating glass panels.

- **Data Density:** Spacing is tight (8px/12px increments) to allow for the display of complex property tables without excessive scrolling.
- **Edge Alignment:** Toolbars should be pinned to the screen edges or the viewport corners with a consistent `container-padding`.
- **Responsive Behavior:** On smaller screens, side panels should collapse into icons rather than reflowing, preserving the integrity of the 3D visualization space.

## Elevation & Depth

Depth is communicated through **Glassmorphism** and luminosity rather than traditional shadows.

- **The Canvas:** The lowest layer, containing the 3D model.
- **Glass Panels:** Background blur (`backdrop-filter: blur(12px)`) with a semi-transparent slate fill (`rgba(30, 41, 59, 0.7)`).
- **Surface Borders:** Every panel must have a 1px solid border (`rgba(255, 255, 255, 0.1)`) to maintain crisp definition against the 3D background.
- **Active Elevation:** Focused elements or active modal dialogs use a subtle outer glow of the Primary Electric Blue to simulate "active energy" rather than physical height.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding removes the harshness of a purely "brutalist" engineering tool while maintaining a professional, geometric rigor. 

- **Standard Elements:** Buttons, inputs, and panel corners use a 4px radius.
- **Interactive Nodes:** Elements like tree-view expanders or status dots remain sharp or fully circular to distinguish them from structural UI containers.
- **Selection Brackets:** In the 3D viewport, use sharp 0px corners for bounding boxes to emphasize mathematical precision.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Electric Blue with white text. High contrast.
- **Ghost Actions:** Transparent background with the 1px border rule. Used for secondary tools to avoid visual noise.
- **Inputs:** Darker than the panel background to create a "recessed" feel. Use `label-sm` for persistent floating labels.

### Engineering Widgets
- **Property Lists:** Alternating row highlights (zebra striping) using a subtle Slate tint.
- **Status Chips:** Small, pill-shaped indicators using the reinforcement palette (Green/Red/Yellow). These should include a small "inner-glow" to simulate an LED indicator.
- **Tree Views:** Used for BIM hierarchy (Project > Floor > Wall > Rebar). Use thin guide-lines to show nesting depth.

### Cards & Panels
- **Floating HUDs:** Minimalist containers with no headers, used for temporary measurement readouts in the 3D space.
- **Control Sidebars:** Fixed-width (approx 320px) with integrated scrollbars that only appear on hover to maintain a clean "atmospheric" look.