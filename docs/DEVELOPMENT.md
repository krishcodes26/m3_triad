# M3 Triad — Development Guide

## 1. Purpose

Implement the product as a maintainable application that follows the shared design system and preserves the behaviour represented by the reference designs. This guide intentionally avoids assuming a final framework or backend: choose the stack with the project owner before scaffolding.

## 2. First instruction to Claude

Before writing code:
1. Inspect the existing repository and identify its framework, package manager, conventions and current state.
2. Read this entire handoff, especially `CONTEXT.md`, `DESIGN_SYSTEM.md`, `FUNCTIONAL_SPEC.md` and the relevant screen brief.
3. Inspect the matching SVG at full size.
4. Report the existing stack and any conflicts with this specification.
5. Propose a small implementation plan.
6. Do not replace an existing working architecture without explaining why and obtaining approval.

If no codebase exists, propose a stack and wait for confirmation where the decision materially affects architecture.

## 3. Architecture principles

- Feature-oriented modules.
- Shared design-system primitives.
- Clear separation of presentation, domain logic and data access.
- Server-side validation for authoritative state changes.
- Typed domain models and API contracts.
- Reusable form validation.
- Centralised date, number, unit and currency formatting.
- Testable business rules, especially XP and progression.
- Avoid giant single-file pages and duplicated components.

Suggested structure (adapt to actual framework):

```text
src/
  app/                  # routes, layouts, providers
  components/
    ui/                 # buttons, inputs, cards, tables, badges
    shell/              # sidebar, header, page frame
    charts/
  features/
    dashboard/
    missions/
    character/
    habits/
    workouts/
    nutrition/
    analytics/
    calendar/
    notifications/
  domain/
    progression/
    scheduling/
    metrics/
    units/
  services/             # API clients / integration adapters
  lib/                  # utilities, validation, formatters
  styles/               # tokens, global styles
  types/
  tests/
```

## 4. Design implementation

### 4.1 Tokens first
Create CSS variables or equivalent for all palette, typography, spacing, border, radius and shadow tokens in `DESIGN_SYSTEM.md`. Do not scatter raw hex values throughout feature files.

### 4.2 Shared components
Build and validate these before individual screens:
- App shell / sidebar.
- Page header.
- Card / section panel.
- Primary, secondary, tertiary and destructive buttons.
- Text input, select, date input, textarea.
- Status chip.
- Progress bar.
- Metric tile.
- Table / ledger.
- Empty, loading and error states.
- Modal / drawer / confirmation dialog.
- Toast / inline feedback.

### 4.3 Component API
Prefer clear, typed variants rather than per-screen style overrides. Example:

```tsx
<Panel title="Today's priorities" density="compact">
  ...
</Panel>

<StatusTag tone="success">Completed</StatusTag>
```

Do not expose arbitrary style props to every consumer unless necessary.

### 4.4 CSS discipline
- Use tokens.
- Avoid one-off `!important`.
- Avoid deeply nested selectors.
- Keep responsive behaviour near component styles.
- Use semantic class names.
- Do not rely on exact SVG artboard dimensions for layout.

## 5. State and data flow

- Keep server-owned records in the server/data layer.
- Keep temporary UI state local to the feature where possible.
- Use optimistic updates only when rollback is safe and clear.
- Never calculate authoritative XP in the browser.
- Cache invalidation must update all affected views (Dashboard, Calendar, Analytics, Profile).
- Preserve selected date/range when navigating to a detail view where appropriate.

## 6. Domain logic

Implement and test domain functions separately from UI:
- Mission progress calculation.
- Habit schedule and streak calculation.
- Workout volume and PR detection.
- Nutrition totals.
- Calendar grouping and timezone conversion.
- XP award eligibility and idempotency.
- Level/rank threshold mapping.

Do not guess business rules. Put unresolved rules behind explicit configuration or leave them unimplemented pending approval.

## 7. Security

- Authentication and authorisation are separate concerns.
- Every read/write must enforce user ownership.
- Validate all input on the server.
- Do not trust client-provided user IDs, XP, prices, totals or completion flags.
- Protect secrets and integration tokens.
- Rate-limit sensitive actions where appropriate.
- Avoid logging credentials or sensitive nutrition/financial records.
- Use secure session and cookie defaults for the selected framework.
- Review data export, deletion and retention requirements.

The Missions SVG contains sample task copy mentioning PostgreSQL, Supabase, RLS, edge functions, Stripe and Vitest. Treat these as example task content, not an approved stack. If the project owner selects Supabase, use RLS and server-side functions appropriately; otherwise apply equivalent security controls.

## 8. Testing strategy

### Unit tests
- XP calculation and idempotency.
- Level/rank thresholds.
- Mission progress.
- Habit streaks and timezone edge cases.
- Workout volume / PR calculations.
- Nutrition aggregation.
- Date grouping and recurring events.

### Integration tests
- Create and complete mission/task.
- Complete habit check-in.
- Start and finish workout.
- Add meal entry.
- Generate and reverse XP ledger event.
- Verify user isolation and authorisation.

### UI tests
- Navigation and active states.
- Forms and validation.
- Loading / empty / error states.
- Keyboard navigation.
- Responsive layouts.
- Modal/drawer interaction.

### Visual regression
Capture representative screens at:
- 1440px desktop.
- 1024px tablet landscape.
- 768px tablet.
- 390px mobile.

Compare against the source design intent, not a literal desktop-only pixel match.

## 9. Implementation sequence

### Phase 0 — Repository and decisions
- Inspect repository.
- Confirm framework/backend.
- Resolve open questions that block architecture.
- Create route and data contracts.

### Phase 1 — Foundation
- Tokens and typography.
- Responsive shell/navigation.
- Shared component library.
- Global states and accessibility.

### Phase 2 — Core daily loop
- Dashboard.
- Missions and task execution.
- Habits and check-ins.
- Calendar day view.

### Phase 3 — Muscle tracking
- Workout routines and active session.
- Workout history / PR ledger.
- Nutrition logging.

### Phase 4 — Character and feedback
- XP ledger.
- Profile / character.
- Notifications.

### Phase 5 — Intelligence
- Analytics.
- Cross-feature summaries.
- Data integrity and reconciliation.

The sequence can change based on MVP priorities, but progression rules and data ownership should be designed before feature pages begin awarding XP.

## 10. Definition of done per screen

- Matches its screen brief and global design system.
- Uses shared components.
- Works at desktop, tablet and mobile.
- All controls have real behaviours or are clearly disabled/labelled as unavailable.
- Loading, empty, error and success states exist.
- Forms validate and show accessible errors.
- Data is not fabricated.
- Keyboard navigation works.
- Tests cover important domain logic and key flows.
- No console errors, broken links or placeholder actions presented as complete features.

## 11. Claude collaboration protocol

For each implementation task, Claude should:
1. State which files it will inspect/change.
2. Summarise the relevant requirements.
3. Identify unknowns and assumptions.
4. Implement in small coherent increments.
5. Run available tests and type/lint checks.
6. Report files changed, behaviours implemented, tests run and remaining gaps.

Do not rewrite unrelated screens during a focused feature task. Do not silently change shared tokens to solve one page's local issue.
