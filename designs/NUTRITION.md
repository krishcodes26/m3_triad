# M3 Triad — Nutrition Screen Specification

**Reference:** `source_designs/Nutrition.svg`  
**Purpose:** Daily nutrition and meal logging

## 1. Source-grounded layout and content

The reference design visibly includes:
- Selected day and daily calorie / macro summary.
- Target, consumed and remaining values.
- Meal sections: breakfast, lunch, snacks/pre-workout and dinner.
- Food entries with serving quantity, calories and macro details.
- Food search/discovery and add-to-meal action.
- Optional nutrient summary and source labels.

## 2. Required interactions and behaviour

The following are expected functional behaviours, inferred from the design and product context. Confirm unresolved business rules in `OPEN_QUESTIONS.md`.

- Select a day and add food to a meal.
- Choose an existing food or create a manual entry.
- Specify serving amount and unit; totals update from the stored nutrient basis.
- Edit/delete meal entries with clear feedback.
- Display target vs consumed vs remaining with units.
- Show whether nutrition values are estimated, user-entered or sourced.
- Do not imply medical advice or verified food composition without source evidence.

## 3. Visual direction

Green-led feature identity is appropriate, with neutral surfaces and purple shared interactive controls.

Follow `DESIGN_SYSTEM.md` for all shared tokens, typography, border language, spacing, button anatomy, accessibility and responsive rules. This screen may vary its section order, density and feature accent, but it may not redefine shared components.

## 4. Layout guidance

- Use the shared application shell and page header.
- Keep the primary workflow visually dominant.
- Group related metrics and records; do not give every datum its own card.
- Preserve the information hierarchy of the reference while improving readability.
- On desktop, use multi-column layouts only where the reference benefits from comparison or simultaneous context.
- On tablet, move secondary panels below the primary workflow.
- On mobile, prioritise the main action and selected-day/current-session context; convert dense tables into stacked records.

## 5. States to design

- Loading / skeleton.
- First-use empty state.
- No results / no records for selected date.
- Error with retry.
- Success confirmation.
- Disabled / permission-limited state.
- Offline / syncing state if supported.
- Overdue / blocked / incomplete state where relevant.

## 6. Data and trust requirements

- Do not use SVG sample numbers as live data.
- Show units and date ranges for metrics.
- Distinguish user-entered, imported and calculated values.
- Make source records discoverable for important summaries.
- Do not invent integrations or backend capabilities.
- Respect privacy and user ownership.

## 7. Acceptance checklist

- [ ] Matches the source screen's purpose and core content.
- [ ] Uses the global design system and shared components.
- [ ] Feature accent is restrained and consistent.
- [ ] All visible controls have defined behaviour.
- [ ] Metrics have definitions, units and sources.
- [ ] Empty, loading, error and success states exist.
- [ ] Responsive layout is intentionally designed.
- [ ] Keyboard and screen-reader use is supported.
- [ ] No fabricated live data or unsupported claims.
