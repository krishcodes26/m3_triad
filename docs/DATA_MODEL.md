# M3 Triad — Proposed Data Model

**Status:** Conceptual starting point only. The SVG references do not define a production schema. Validate domain rules before migrations.

## 1. Data principles

- One canonical source of truth per record.
- All user-owned records scoped to a user/account.
- Store timestamps in UTC; render in user timezone.
- Store units explicitly.
- Distinguish source-entered, imported and calculated values.
- Preserve an auditable XP ledger.
- Prefer derived aggregates to manually maintained duplicate counters.
- Version scoring rules so historical awards remain explainable.
- Do not store sensitive financial or health data without clear need, consent and security review.

## 2. Suggested entities

### `users`
Identity and authentication linkage. Avoid duplicating provider credentials.

### `user_profiles`
Display name, avatar reference, timezone, locale, privacy preferences and onboarding settings.

### `vectors`
Canonical values: `mind`, `money`, `muscle`. Could be an enum or lookup table.

### `character_progress`
Overall character level, rank and derived XP totals. Avoid treating this as the only source of truth; totals should reconcile with ledger entries.

### `vector_progress`
Per-user, per-vector XP and level snapshot. Derived or cached from ledger events.

### `missions`
User, title, description, vector association, goal statement, status, start date, deadline, completion rule, created/updated timestamps.

### `milestones`
Mission relationship, title, description, ordering, due date, completion state.

### `tasks`
Mission/milestone relationship, title, description, status, priority, due date, estimate, completion timestamp.

### `task_events`
Append-only activity history: created, started, blocked, completed, reopened, edited.

### `habits`
User, name, description, vector, schedule definition, target, unit, completion rule, timezone and status.

### `habit_check_ins`
Habit, scheduled date, completion value, status, timestamp, note and source.

### `workout_routines`
User, name, description, ordering and metadata.

### `routine_exercises`
Routine, exercise reference, order, target sets/reps and notes.

### `workout_sessions`
User, routine reference, start/end, status, duration, notes and unit preferences.

### `exercises`
Exercise catalogue with name, movement category, equipment, muscle group and movement metadata. Support user-defined exercises.

### `workout_sets`
Session, exercise, set number, load, reps, unit, set type, completion state, optional RPE/RIR and timestamp.

### `personal_records`
User, exercise, record type, value, unit, achieved date, source set/session.

### `food_items`
Food name, serving basis, nutrient values, source and verification metadata.

### `meal_entries`
User, date, meal category, food item or custom item, quantity, unit, nutrient snapshot and source.

### `focus_sessions`
User, start/end, duration, category, related mission/task, interruption count (if tracked), notes.

### `calendar_blocks`
User, title, start/end, timezone, linked entity, category, status and recurrence metadata.

### `xp_ledger`
User, vector, event type, source entity/id, amount, rule version, created timestamp, explanation, reversal reference.

### `achievements`
Achievement definition, criteria and display metadata.

### `user_achievements`
User, achievement, unlocked timestamp and evidence reference.

### `notifications`
User, type, title, body, priority, source entity, created timestamp, read/archive state and action destination.

### `notification_preferences`
User, channel preferences, quiet-hours window and timezone.

### `daily_reflections`
User, date, reflection text, energy/mood optional fields, linked daily summary.

### `integration_connections` (only if integrations are approved)
Provider, user, scopes/permissions, token reference stored securely, connection status, sync cursor and last sync time. Never store raw secrets in client-readable tables.

## 3. Relationships

- User 1:N missions, habits, sessions, meal entries, calendar blocks, notifications and ledger events.
- Mission 1:N milestones and tasks.
- Milestone 1:N tasks.
- Habit 1:N check-ins.
- Workout routine 1:N routine exercises.
- Workout session 1:N workout sets.
- Exercise 1:N workout sets and personal records.
- XP ledger event references one source event; avoid polymorphic references without validation strategy.
- Achievement 1:N user achievement unlocks.

## 4. Critical domain decisions

1. Can one mission contribute to multiple vectors?
2. Is mission progress task-count, weighted, milestone-based or manual?
3. Does a completed task always grant XP?
4. Can XP awards be reversed? How are corrections represented?
5. How are duplicate/imported events deduplicated?
6. What is the exact level and rank progression curve?
7. How are rest days and missed habit days treated?
8. How are bodyweight and assisted exercises calculated?
9. Which nutrition data sources are trusted?
10. Is Money tracking manual only, or will financial integrations exist?
11. How is user timezone handled for streaks and calendar grouping?
12. What is the retention and deletion policy for sensitive records?

## 5. Example XP ledger fields

```ts
type Vector = "mind" | "money" | "muscle";

interface XpLedgerEvent {
  id: string;
  userId: string;
  vector: Vector;
  sourceType: string;
  sourceId: string;
  amount: number;
  ruleVersion: string;
  explanation: string;
  createdAt: string; // ISO timestamp
  reversesEventId?: string;
}
```

This is illustrative TypeScript, not a final API contract.

## 6. Integrity and security

- Enforce ownership server-side.
- Never trust a client-submitted XP amount.
- Award XP through trusted server logic.
- Validate source record completion before awarding.
- Add idempotency keys for event creation.
- Use row-level access controls if supported by the selected backend.
- Keep integration credentials server-side and encrypted/secret-managed.
- Log sensitive account/security changes.
- Provide export and deletion paths according to policy.
