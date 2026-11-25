# M3 Triad — Design System

**Status:** Canonical proposed design contract derived from the supplied SVG references.  
**Priority:** This file governs all screens. Screen briefs may define bounded exceptions only.

## 1. Design north star

Build a coherent, high-density personal operating system with an RPG progression layer. The interface should be:

- **Tactile:** crisp borders, squared geometry, restrained shadows.
- **Editorial:** strong typography and clear page titles.
- **Technical:** compact metadata, status labels, grids, ledgers and telemetry.
- **Human:** warm background, approachable language, visible progress.
- **Disciplined:** consistent spacing, predictable interactions and accessible contrast.

Avoid generic rounded SaaS cards, glassmorphism, gradients as a default, excessive glow, oversized empty hero sections, and cyberpunk/neon styling.

## 2. Consistency ratio: 70 / 20 / 10

Use this rule to reconcile variations across the references:

- **70% shared foundation:** layout grid, typography, borders, spacing, radii, card anatomy, navigation, controls and states.
- **20% feature identity:** one dominant accent per page/feature, with supporting semantic colours.
- **10% expressive detail:** chart series, badges, mini-visualisations, illustration and local emphasis.

The ratio is conceptual, not a literal measurement. A page may use multiple semantic colours where the data requires them, but the structural UI remains consistent.

## 3. Colour tokens

### 3.1 Core palette

The source SVGs repeatedly use these exact colours. Treat them as the initial token values; tune only through a deliberate system-wide revision.

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#FCF9F8` | Main application background; warm off-white |
| `surface` | `#FFFFFF` | Cards, panels, navigation surfaces |
| `ink` | `#1C1B1B` | Primary text, borders, icons |
| `muted-ink` | `#464555` | Secondary text / subdued labels |
| `soft-gray` | `#F6F3F2` | Subtle panels and inactive surfaces |
| `gray-100` | `#F0EDEC` | Secondary surface |
| `gray-200` | `#EBE7E7` | Neutral chips, separators, quiet fills |
| `purple` | `#4F46E5` | Core interactive / selected state |
| `purple-deep` | `#3525CD` | Strong purple emphasis |
| `green` | `#005338` | Positive / Mind-Money-Metric success accents as context requires |
| `green-deep` | `#002113` | Deep green surface / strong text |
| `green-bright` | `#6FFBBE` | Bright progress / highlight |
| `green-mid` | `#4EDEA3` | Progress fill |
| `green-accent` | `#006E4B` | Supporting green |
| `red` | `#B61722` | Warning, high-priority, Muscle feature accent where appropriate |
| `red-deep` | `#410004` | Deep red text/surface |
| `red-soft` | `#FFDAD7` | Soft red highlight |

### 3.2 Semantic usage

- Purple: primary selection, active navigation, primary action, focus/mission emphasis.
- Green: success, completed states, positive progress, verified completion.
- Red: overdue, destructive, critical warning, high-priority exception.
- Neutral: layout, structural panels, secondary metadata.
- Attribute colours are **not yet canonically assigned**. The SVGs use purple, green and red in several different contexts. Do not permanently bind a colour to Mind, Money or Muscle without product approval. Use text labels and icons as well as colour.

Never communicate status by colour alone. Include a label, icon, shape, or other cue.

### 3.3 Page accent rule

A screen may choose one feature accent, but shared controls retain shared tokens. Suggested mapping based on reference emphasis (not a confirmed semantic assignment):

- Dashboard: purple with green/red status details.
- Missions: purple / green progress with red risk.
- Workout: red-led accent with green completion.
- Nutrition: green-led accent.
- Notifications: purple for system selection, semantic status colours.
- Habits: green-led progress with purple controls.
- Profile: purple identity accent; tri-vector data uses semantic labels.
- Analytics: purple and green data series; red for risk/decline.
- Calendar: purple navigation/selection and green completion.

## 4. Typography

The SVGs have converted text to vector paths, so the original font family cannot be reliably identified from the supplied files. Use a close, legible sans-serif family with broad weights. Recommended stack:

`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

If the project has an approved bundled font, use it consistently after visual comparison.

### Type scale

| Token | Desktop size | Weight | Usage |
|---|---:|---:|---|
| `display` | 36–44px | 800–900 | Rare page hero/title |
| `h1` | 30–36px | 800–900 | Main page title |
| `h2` | 20–24px | 750–850 | Section title |
| `h3` | 16–18px | 700–800 | Card / panel title |
| `body` | 14–16px | 400–500 | Primary content |
| `body-sm` | 12–13px | 400–500 | Secondary content |
| `label` | 10–12px | 650–800 | Compact metadata / uppercase labels |
| `micro` | 9–10px | 600–750 | Dense telemetry only; avoid for essential content |

Use uppercase for short section labels and system tags, not for paragraphs. Use sentence case for explanatory copy. Maintain readable line height: 1.45–1.6 body, 1.05–1.2 headings.

## 5. Layout grid and responsive rules

### 5.1 Source baseline

The majority of SVGs use a 1280px-wide artboard. Most show:

- Left navigation rail: approximately 256px wide.
- Main content begins around x=296px, leaving approximately 40px gutter.
- Main content ends around x=1240px, leaving approximately 40px right gutter.
- Effective main content width: approximately 944px.

This is the visual reference baseline, not a requirement to freeze the app at 1280px.

### 5.2 Canonical desktop layout

- Sidebar width: 256px expanded.
- Main content horizontal padding: 32–40px.
- Main content max width: 1440px (proposed).
- Desktop content grid: 12 columns, 16–24px gutters.
- Standard section gap: 24–32px.
- Card internal padding: 16–24px depending on density.
- Dense table/list row height: 40–52px; compact metadata may be smaller only when still readable.

### 5.3 Responsive breakpoints (proposed)

| Breakpoint | Behaviour |
|---|---|
| `>= 1200px` | Expanded sidebar, full dashboard grids |
| `900–1199px` | Collapsible sidebar; reduce columns and card padding |
| `640–899px` | Sidebar becomes drawer or compact rail; mostly 2-column layouts |
| `< 640px` | Mobile-first single column; bottom navigation or menu drawer; tables become stacked rows/cards |

Responsive layouts must preserve hierarchy and function. Do not scale the desktop artboard down as a substitute for responsive design. Dense tables need a mobile-specific presentation, not horizontal overflow by default.

## 6. Spacing scale

Use a 4px base grid.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

Prefer consistent rhythm over one-off pixel values. Align card edges and section starts across a page.

## 7. Shape, borders and elevation

The references use strong near-black outlines, mostly square corners, and restrained shadowing.

- Standard border: 1px solid `ink`.
- Emphasised border: 2px solid `ink`.
- Hairline separator: 1px solid `gray-200` or `ink` at reduced opacity.
- Standard radius: 4–8px.
- Dense data panels: 2–4px.
- Pill: reserved for compact status labels and tags, not every button.
- Shadow: subtle, short, directional; use only when it improves layering.
- Avoid large soft shadows and oversized rounded cards.

Use borders to define modular structure, not to outline every text element. Keep card treatment consistent across a page.

## 8. Component anatomy

### 8.1 Application shell
- Persistent left navigation on desktop.
- Brand/wordmark at top.
- Primary destinations in a stable order.
- Active destination uses purple fill or another high-contrast selected treatment with clear text contrast.
- Bottom status area may show character level / XP / sync state.
- Main content has a page header with title, optional descriptor, date/filter controls, and primary action.

### 8.2 Page header
- Optional eyebrow / system label.
- Strong page title.
- One-sentence purpose description where useful.
- Right-aligned action or filter controls on wide screens.
- Stack on mobile.

### 8.3 Cards and panels
- White surface on warm canvas.
- Clear heading and optional metadata.
- One primary data point or task per visual group.
- Avoid nested card inside card inside card. Use separators and section labels for hierarchy.

### 8.4 Buttons
- Primary: purple fill, high-contrast text, clear hover/focus/disabled states.
- Secondary: white or neutral fill, ink border.
- Destructive: red semantic treatment and confirmation for irreversible actions.
- Tertiary: text/ghost action for low-priority operations.
- Use verbs: “Start workout”, “Create mission”, “Save changes”.
- Ensure adequate target size: 40px minimum desktop; 44px recommended touch target.

### 8.5 Inputs
- White surface, ink border, visible label, helper/error text.
- Never rely on placeholder as the only label.
- Focus ring must be visible and consistent.
- Validation should explain how to fix the issue.

### 8.6 Status chips
- Compact, uppercase or short sentence-case.
- Use semantic colour plus text/icon.
- Do not overuse pills. The source's squared technical tags are preferred.

### 8.7 Progress bars
- Always pair with a label and numeric context where possible.
- Use a neutral track and semantic fill.
- Provide accessible text equivalent.
- Do not imply progress beyond 100% unless the metric explicitly supports overflow.

### 8.8 Tables and ledgers
- Strong header row, aligned numeric columns, consistent row rhythm.
- Use tabular numerals for measurements and currency.
- Distinguish row hover, selected, completed, overdue and disabled.
- On small screens convert to summary rows or cards.

### 8.9 Charts
- Use labels, legends, units, and meaningful axes.
- Colour series consistently within a chart.
- Avoid decorative chart junk.
- Always provide a text summary or accessible data table for key insights.

## 9. Iconography and imagery

- Prefer one coherent line-icon family (e.g. Lucide) with consistent stroke weight.
- Use icons to reinforce labels, not replace essential text.
- Use photography/food/exercise imagery only when it supports recognition or context.
- Maintain consistent image ratios and cropping within a given component type.
- Avoid mixing emoji, filled icons, outline icons and custom illustrations arbitrarily.

## 10. Interaction states

Every interactive component should define:

- Default
- Hover (pointer devices)
- Focus-visible (keyboard)
- Active / pressed
- Selected
- Disabled
- Loading (when asynchronous)
- Success / error feedback where applicable

Keyboard users must be able to navigate the complete interface. Use semantic buttons, links, inputs, lists, headings and tables. Do not use clickable `div` elements where a native control is appropriate.

## 11. Accessibility

Target WCAG 2.2 AA as an implementation goal:

- Text contrast 4.5:1 for normal text; 3:1 for large text.
- Visible keyboard focus.
- 44px recommended touch target.
- Form labels and error association.
- No colour-only communication.
- Reduced-motion support.
- Screen-reader labels for charts, icon-only controls and progress.
- Logical heading order and landmarks.
- Avoid tiny microcopy for essential content; enlarge the SVG's smallest labels when needed.

## 12. Motion

Motion should be brief and functional:

- Hover/focus: 100–160ms.
- Panel/accordion: 160–220ms.
- Page transitions: 180–260ms.
- XP award: short, restrained confirmation; never block task completion.
- Respect `prefers-reduced-motion`.
- Avoid constant pulsing, looping animations, parallax, or distracting HUD effects.

## 13. Content and number formatting

- Use consistent date/time formats and user locale.
- Display units with measurements (kg, reps, kcal, g, ml, hours).
- Currency always includes a currency symbol/code and locale formatting.
- Do not show ambiguous bare numbers.
- Use realistic sample data only in clearly labelled demo/preview contexts.
- Never use the sample profile name “Alex Mercer” as a production default.

## 14. Feature-specific variation contract

A screen may vary:
- Dominant accent.
- Chart palette.
- Data density.
- Section order.
- Feature-specific components.
- Contextual illustrations.

A screen may not vary without explicit system-wide approval:
- Base font family and type scale.
- Global spacing scale.
- Border and radius language.
- Button anatomy and focus states.
- Main shell/navigation behaviour.
- Form accessibility.
- General card structure.
- Core semantic meanings of success, warning and destructive states.

## 15. Design review checklist

- [ ] Looks like M3 Triad, not a generic dashboard.
- [ ] Uses the shared shell and tokens.
- [ ] Feature accent is clear but controlled.
- [ ] Main action is obvious.
- [ ] Data density is useful and grouped.
- [ ] Typography is readable at actual viewport size.
- [ ] Borders and radii match the system.
- [ ] Responsive layouts are designed, not merely scaled.
- [ ] Every control has a defined behaviour and state.
- [ ] Keyboard and contrast requirements are met.
