# M3 Triad — Analytics Screen Specification

**Reference:** `source_designs/Analytics.svg`  
**Purpose:** Cross-vector telemetry and long-range behavioural insight

## 1. Source-grounded layout and content

The reference design visibly includes:
- Date-range selector.
- Executive telemetry summary.
- Three-attribute distribution / balance.
- Mind vector telemetry.
- Muscle vector telemetry.
- Money vector telemetry.
- Trend charts, consistency and target-vs-actual comparisons.

## 2. Required interactions and behaviour

The following are expected functional behaviours, inferred from the design and product context. Confirm unresolved business rules in `OPEN_QUESTIONS.md`.

- Changing the date range updates all metrics consistently.
- Each metric exposes definition, unit, source and aggregation period.
- Clicking a metric drills into the underlying records where practical.
- Distinguish missing data from zero activity.
- Use stable series colours within a chart and accessible text summaries.
- Do not calculate composite scores until the formula is approved.

## 3. Visual direction

Purple/green can distinguish series; red signals negative or risk. Ensure chart colours are consistent within each chart and not overloaded.

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
