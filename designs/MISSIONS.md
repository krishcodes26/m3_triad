# M3 Triad — Missions Screen Specification

**Reference:** `source_designs/Missions.svg`  
**Purpose:** Goal planning, milestones, task execution and work records

## 1. Source-grounded layout and content

The reference design visibly includes:
- Mission / quest overview and creation action.
- Mission identity, goal/outcome, deadline and progress.
- Milestones and task execution plan.
- Task list with status, priority, due date and completion.
- Task count / milestone progress.
- Action log and work records showing what was done and when.

## 2. Required interactions and behaviour

The following are expected functional behaviours, inferred from the design and product context. Confirm unresolved business rules in `OPEN_QUESTIONS.md`.

- Create a mission using goal, deadline, plan and actionable tasks.
- Support mission and task lifecycle states defined in FUNCTIONAL_SPEC.md.
- Task completion records an event and may trigger XP only through approved server-side rules.
- Show progress calculation clearly; avoid arbitrary percentage values.
- Action log is chronological and traceable to tasks or milestones.

## 3. Visual direction

Purple for selected mission/primary actions; green for completed progress; red for overdue or blocked risk.

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
