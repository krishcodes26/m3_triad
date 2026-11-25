# M3 Triad — Asset Guide

## 1. Source asset inventory

The original SVGs are retained in `source_designs/`.

| File | SVG artboard | Purpose |
|---|---:|---|
| `Dashboard.svg` | 1280 × 2097 | Dashboard |
| `Missions.svg` | 1280 × 2698 | Missions / quests |
| `Workout.svg` | 1305 × 3456 | Workout command centre |
| `Nutrition.svg` | 1280 × 2796 | Nutrition |
| `Notifications.svg` | 1280 × 1920 | Notifications |
| `Habits.svg` | 1280 × 2484 | Habits |
| `Profile.svg` | 1280 × 2733 | Character profile |
| `Analytics.svg` | 1280 × 1855 | Analytics |
| `Aside.svg` | 256 × 752 | Navigation rail |
| `Calendar.svg` | 1280 × 3350 | Calendar and activity |

Artboard dimensions are the SVG dimensions, not required runtime viewport sizes.

## 2. How to use the references

- Inspect SVGs at full size before recreating a page.
- Treat the reference as evidence of composition, content grouping, and visual style.
- Rebuild the interface with native components; do not use a flattened SVG screenshot as the whole page.
- Reuse logos/icons only if their licensing and extraction quality are acceptable.
- Preserve original files unchanged.
- If an SVG contains embedded raster assets, inspect their provenance and resolution before reuse.

## 3. SVG technical notes

The files are vector-heavy and appear to have text converted into paths rather than live `<text>` elements. This means:
- Text extraction from SVG source may not work.
- Font family cannot be confirmed reliably from the vector paths.
- Use visual inspection and OCR as secondary aids, not as the sole source of truth.
- Recreate text as accessible HTML text in the implementation.

## 4. Visual source-of-truth hierarchy

1. Original SVG at full resolution.
2. `DESIGN_SYSTEM.md` for cross-screen consistency.
3. Corresponding `SCREENS/*.md` brief for feature interpretation.
4. `DESIGN.md` for overall layout and hierarchy.
5. Implementation decisions approved by the project owner.

If an individual SVG conflicts with the global design system, preserve its unique content and information architecture but normalise shared typography, spacing, control states, and component anatomy according to the system.

## 5. Naming

Use kebab-case names for exported raster/vector assets and descriptive names for component files. Do not rename source files in the archive. Keep source references traceable.
