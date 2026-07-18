---
name: Kinetic Obsidian
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c5c9ae'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8f937b'
  outline-variant: '#444934'
  surface-tint: '#add512'
  primary: '#ffffff'
  on-primary: '#293500'
  primary-container: '#c8f238'
  on-primary-container: '#566c00'
  inverse-primary: '#516600'
  secondary: '#c6c7c3'
  on-secondary: '#2f312e'
  secondary-container: '#484947'
  on-secondary-container: '#b8b9b5'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c8f238'
  primary-fixed-dim: '#add512'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#e2e3df'
  secondary-fixed-dim: '#c6c7c3'
  on-secondary-fixed: '#1a1c1a'
  on-secondary-fixed-variant: '#454745'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  stats-number:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for the high-performance intersection of endurance sports and cutting-edge technology. The brand personality is aggressive yet refined—evoking the focused intensity of a midnight criterium or a long-distance solo pursuit.

The visual language utilizes a blend of **Glassmorphism** and **High-Contrast Neon** aesthetics. Deep, ink-like backgrounds provide a "void" that allows neon accents to feel like light sources rather than just colors. Surfaces are treated as semi-translucent obsidian plates, using subtle background blurs and thin, luminous strokes to define edges. The emotional response should be one of premium exclusivity, speed, and digital precision.

## Colors

The palette is anchored by the high-visibility **Neon Lime Green**, serving as the primary kinetic energy source for the UI.

- **Primary (#D4FF45):** Used sparingly for critical calls to action, active states, and data peaks. It should feel like a neon tube against the dark.
- **Secondary / Text (#F4F4F0):** An off-white cream that reduces eye strain compared to pure white, maintaining a premium, "studio" feel.
- **Neutral / Background (#0A0A0A):** A near-black that provides infinite depth, allowing for effective glassmorphism layering.
- **Supportive Grays:** Subtle shifts between `#1A1A1A` and `#262626` are used for container elevations to create structure without breaking the immersion of the dark theme.

## Typography

The typography strategy pairs technical geometry with utilitarian clarity. 

**Space Grotesk** is the voice of the brand. Its quirky, wide-set proportions and technical details reflect the mechanical nature of high-end sports gear. It is used for headlines, impactful statistics, and button labels.

**Inter** provides the functional backbone. It handles body copy and dense data sets where legibility is paramount. Large displays should leverage negative letter-spacing to feel "tight" and aggressive, while uppercase labels utilize wide tracking for a technical, "instrument cluster" look.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with generous margins to create a sense of luxury and space. 

- **Desktop:** 12-column grid with a 1440px max-width. Use 24px gutters to allow glassmorphic cards to breathe.
- **Mobile:** 4-column grid with 20px side margins. 
- **Rhythm:** All spacing (padding, margins) must be a multiple of the 4px base unit. 

Information density should be kept low on landing pages but can increase significantly in performance "Dashboard" views where data visualization is the priority. In these views, use nested containers with 8px internal padding.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Luminous Depth**. 

1.  **Backdrop Blurs:** Elevated surfaces use a `20px` to `40px` blur with a highly desaturated, low-opacity fill (`rgba(255, 255, 255, 0.03)`).
2.  **Inner Strokes:** To define edges against the deep black, surfaces use a 1px top-oriented inner border in a faint cream (`rgba(244, 244, 240, 0.1)`) to simulate overhead studio lighting hitting the edge of the glass.
3.  **Neon Underglow:** High-priority elements (like active stat cards) feature a soft, Gaussian blur "glow" of the primary accent color positioned behind the element, rather than a shadow.

## Shapes

The shape language is "Machined Rounded." All primary containers and buttons use a **0.5rem (8px)** base radius. This provides a balance between the organic curves of the human body and the precision engineering of carbon fiber components. 

Large-scale image containers or hero sections may scale up to `rounded-xl` (1.5rem) to soften the overall composition. Avoid sharp 0px corners to prevent the UI from feeling too industrial or "brutalist."

## Components

### Buttons
- **Primary:** Solid Neon Lime Green background with black Space Grotesk text. No border. On hover, apply a 15px outer glow of the same color.
- **Secondary (Glass):** Blurred glass background with a 1px white border at 20% opacity. Text in off-white.

### Cards
- **Data Cards:** Use the glassmorphism treatment. Headlines in Space Grotesk, values in `stats-number`. Use a 1px stroke that is slightly brighter at the top than the bottom to create a "3D glass" effect.

### Inputs
- Background should be the neutral canvas color (#0A0A0A) but with a subtle 1px border. On focus, the border turns Neon Lime Green with a faint inner glow.

### Chips/Tags
- Small, pill-shaped elements with `label-caps` typography. Use high-contrast combinations (e.g., Neon Lime text on a dark gray background).

### Data Visualization
- Line charts should use a Neon Lime stroke with a gradient fill that fades to 0% opacity as it approaches the X-axis. Data points should "glow" when hovered.