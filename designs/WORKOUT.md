# M3 Triad — Workout Screen Specification

**Reference:** `source_designs/Workout.svg`  
**Purpose:** Workout command centre and progressive-overload tracking

## 1. Source-grounded layout and content

The reference design visibly includes:
- Workout header and session controls.
- Summary metrics such as session count, tonnage, set count or XP only when backed by records.
- Active workout/session with exercise sections.
- Set-by-set logging controls for load, reps and set completion.
- Elapsed time / rest timer where implemented.
- Session summary and notes.
- Saved routines/templates, workout history and personal-record ledger.

## 2. Required interactions and behaviour

The following are expected functional behaviours, inferred from the design and product context. Confirm unresolved business rules in `OPEN_QUESTIONS.md`.

- Start a routine or blank session.
- Add/reorder exercises and log individual sets.
- Edit or remove an uncompleted set; preserve audit/history policy for completed sessions.
- Finish or discard session with clear confirmation.
- Calculate volume/tonnage using an explicit unit-aware domain function.
- Detect PRs only from validated records and defined comparison rules.
- Save a completed session to history and refresh relevant Calendar, Analytics and XP views.

## 3. Visual direction

The reference is red-led for workout emphasis. Keep core buttons and shared states consistent with the global system; green indicates completion.

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
