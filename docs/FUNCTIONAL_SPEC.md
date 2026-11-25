# M3 Triad — Functional Specification

**Evidence labels**
- **[Reference]** Visible in the supplied SVG designs.
- **[Project context]** Stated in the project conversation.
- **[Proposal]** Recommended behaviour to make the product coherent; requires product validation.

## 1. Core product loop

1. Define a goal with a clear outcome.
2. Set a deadline.
3. Create a plan, milestones and tasks.
4. Schedule actions and/or recurring habits.
5. Execute and record evidence.
6. Award progression according to transparent rules.
7. Review results in Dashboard, Calendar, Analytics and Profile.
8. Adjust the plan.

The planning principle “GOAL + DEADLINE + PLAN + ACTION = SUCCESS” is [Project context].

## 2. Tri-vector progression

### Mind
[Reference] Mind-related telemetry includes focus/deep work, reading/learning, intellectual work and task execution.

Potential events [Proposal]:
- Completed focus session.
- Learning or reading session.
- Completed Mind mission task.
- Verified milestone.

### Muscle
[Reference] Workout, exercise sets, tonnage, personal records, nutrition and recovery-related summaries appear in the designs.

Potential events [Proposal]:
- Completed workout.
- Completed exercise set.
- Personal record.
- Completed planned physical habit.
- Nutrition logging should not automatically award performance XP until the scoring rule is agreed.

### Money
[Reference] Money vector appears in Profile and Analytics, with business/client operations, revenue actions, recurring retainers, and financial telemetry.

Potential events [Proposal]:
- Completed business/revenue action.
- Client milestone.
- Recorded revenue milestone.
- Completed Money mission task.

**Important:** do not infer that a financial transaction occurred merely because a user completed a task. Money progress and actual account balances are different data concepts.

## 3. XP and rank

[Reference] The designs show XP values, vector levels, overall character level, rank/tier ladder, earned rewards, milestones and an immutable-looking chronology.

[Proposal] Every XP award should be represented by a ledger event with:
- User ID.
- Vector.
- Source type and source record.
- XP amount.
- Timestamp.
- Rule/version used.
- Optional explanation.
- Reversal/correction reference if an award is invalidated.

Do not implement a final scoring formula until thresholds, duplicate prevention, event reversals, caps, and anti-abuse rules are agreed. Never silently edit historical XP. Corrections should be traceable.

Do not conflate:
- Overall character level.
- Per-vector level.
- Rank/tier.
- Achievement/badge.

## 4. Missions and quests

[Reference] Mission screen contains major mission/project progress, milestones, task execution plan, task lists, completion counts, and action/work records.

[Project context] Goal, deadline, plan and action are core planning concepts.

[Proposal] Mission lifecycle:
- Draft
- Active
- Paused
- Completed
- Archived
- Cancelled

Task lifecycle:
- Not started
- In progress
- Blocked
- Completed
- Skipped / cancelled

A mission should support:
- Title and description.
- Primary vector (one or more only if product rules allow).
- Goal/outcome.
- Start date and deadline.
- Milestones.
- Tasks with due dates, priority and optional estimates.
- Progress calculation.
- Activity/evidence history.
- Completion criteria.

Progress calculation must be explicit: task-count based, weighted, milestone based, or manual. Do not mix these without explaining the result.

## 5. Habits

[Reference] Habits page shows repeatable protocols, daily schedule, adherence, streaks, templates, scheduled check-ins, momentum and protection concepts.

[Proposal] A habit should include:
- Name and description.
- Vector association.
- Schedule (days/times/frequency).
- Completion rule (binary, count, duration, quantity).
- Target and unit where applicable.
- Reminder preference.
- Start/end or pause state.
- Check-in history.

Streak rules must define timezone, missed days, grace periods, pause behaviour and schedule exceptions. Avoid destructive streak resets without clear explanation.

A “protection” or “counter-action” concept appears in the design, but exact mechanics are unclear. Treat it as a habit support feature, not an automated blocker, until defined.

## 6. Workout tracking

[Reference] Workout page contains:
- Routine creation.
- Workout/session summary.
- Exercise list.
- Set-by-set logging.
- Weight, reps and potentially set type.
- Session timer / elapsed time.
- Volume / tonnage summaries.
- Progressive overload indicators.
- Saved routines/templates.
- Workout history and PR ledger.
- Recovery/session notes.

[Proposal] A workout session should support:
- Start, pause, resume, finish and discard.
- Routine selection.
- Exercise ordering.
- Set entries: load, reps, optional RPE/RIR, set type, completion status.
- Units (kg/lb).
- Rest timer.
- Session duration.
- Notes.
- PR detection rules.
- Derived volume calculation.

Define tonnage carefully. A common proposal is `load × reps` summed over completed sets, but this is a product rule to confirm; bodyweight, unilateral and assisted movements need explicit handling.

## 7. Nutrition tracking

[Reference] Nutrition page shows daily calories, macro targets/progress, remaining calories, meals (breakfast/lunch/snacks/dinner), food entries, portion sizes, nutrient details and a food discovery/search area.

[Proposal] Food log:
- Date and meal.
- Food item.
- Serving amount and unit.
- Calories and macro values per serving.
- Source (manual, saved food, imported).
- Optional micronutrients.
- Edit/delete with audit-friendly updates.

Do not present estimates as verified nutrition facts. Show source and confidence where relevant. Avoid medical claims or prescriptive diets.

## 8. Calendar and daily chronology

[Reference] Calendar includes:
- Year/month navigation.
- Annual activity matrix / heatmap.
- Daily and date-level summaries.
- Time-block planner.
- Planned tasks and sessions.
- Daily commitments and habit execution.
- Day chronology.
- XP ledger for selected day.
- Workout details.
- Daily reflection/debrief.

[Proposal] Calendar should unify scheduled items from Missions, Habits, Workout and focus/work sessions. It should not become a separate source of truth for tasks; it is a time-oriented view of shared records.

Timezone and recurring-event behaviour must be defined.

## 9. Dashboard

[Reference] Dashboard includes a greeting, daily focus, character/attribute summary, quest/task overview, priority panel, daily snapshot, quick actions and upcoming/deadline context.

[Proposal] Dashboard is an overview and launchpad. It should prioritise:
- Today's focus / top priority.
- Incomplete due actions.
- Current mission.
- Habit commitments.
- Recent progress.
- Three-vector balance.
- Quick capture / log actions.

Avoid duplicating every detail page.

## 10. Analytics

[Reference] Analytics contains executive telemetry, selected date range, attribute distribution, vector-specific metrics and longer-term behavioural metrics.

[Proposal] Analytics should support:
- Date range selection.
- Mind/Money/Muscle breakdown.
- Trend and consistency.
- Goal vs actual.
- Activity volume and frequency.
- Drill-down to underlying records.

Every metric needs a definition, unit, aggregation window, source and empty state. Do not create a metric merely because a design card needs a number.

## 11. Profile and character

[Reference] Profile includes identity, character level, XP, rank, attribute levels, vector architecture, official rank ladder, honours/badges/titles, milestone chronology, XP ledger, privacy and account security.

[Proposal] Separate public-facing profile information (if any) from private character data. Default personal tracking and financial/nutrition data to private. Account security settings should not be mixed with gamification settings.

## 12. Notifications

[Reference] Notifications page includes inbox/dispatch priority, read/archive controls, delivery channels, quiet hours, priority handling and subscriptions/preferences.

[Proposal] Notification record:
- Type and source.
- Title/body.
- Created timestamp.
- Read status.
- Priority.
- Action destination.
- Delivery channel status.

Support in-app first. Push/email delivery requires explicit user preferences and platform integration. Quiet hours should respect user timezone. Do not claim push delivery until implemented.

## 13. Cross-feature behaviour

- Completing a mission task may create an XP ledger event.
- Completing a habit check-in may contribute to adherence and potentially XP.
- Completing a workout may update workout history, PRs, Muscle analytics and Calendar.
- Logging food updates Nutrition summaries and Calendar.
- A focus session may update Mind analytics and Calendar.
- All progress views should derive from canonical records rather than independent duplicated counters.

These are proposed relationships; confirm exact XP and data rules before implementation.

## 14. Loading, empty, error and offline states

Every screen needs:
- Loading skeleton or clear loading state.
- Empty state with a useful next action.
- Error state with retry and understandable message.
- Permission/connection state where external data is involved.
- Partial-data state when some sources are unavailable.
- Offline or unsynced state if offline support is implemented.

Never show a fabricated zero as if it were a verified measurement when data has not loaded.
