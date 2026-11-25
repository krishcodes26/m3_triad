# M3 Triad — Dashboard Screen Specification

**Reference:** `source_designs/Dashboard.svg`  
**Purpose:** Daily overview and launchpad

## 1. Source-grounded layout and content

The reference design visibly includes:
- Personal greeting and current-day context.
- Character / tri-vector snapshot with current level or progress context.
- Today's quests or tasks with completion and priority indicators.
- Priority / focus panel for the most important action.
- Daily snapshot and progress summaries.
- Quick actions and upcoming deadlines / reminders.

## 2. Required interactions and behaviour

The following are expected functional behaviours, inferred from the design and product context. Confirm unresolved business rules in `OPEN_QUESTIONS.md`.

- Open a task or mission from its summary row.
- Complete or update a daily action and reflect the change in its canonical source record.
- Quick actions create the corresponding mission, habit check-in, workout or focus record.
- Date context should be explicit; avoid implying a task is due today if it is not.

## 3. Visual direction

Purple is a useful primary interaction accent; green/red should remain semantic supporting colours.

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
