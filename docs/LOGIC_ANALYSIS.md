# M3 Triad Logic Analysis — Comprehensive Overview

**Date:** November 23, 2026  
**Source:** `logic.md` — 2,087 lines of detailed specification  
**Purpose:** Complete breakdown of the LIFE RPG system design for implementation

---

## Executive Summary

M3 Triad is a **personal operating system gamified as a LIFE RPG** that transforms real-world actions into measurable progress across **three attribute vectors:**

1. **Mind** — Intellect, learning, focus, cognitive work
2. **Muscle** — Physical training, nutrition, hydration, recovery
3. **Money** — Capital, revenue, business execution, sovereignty

The system is fundamentally **non-punitive** and **immutable**:
- Lifetime progress is never deleted
- Missed days don't subtract XP or remove achievements
- Breaks in streaks don't roll back levels or badges
- Balance (harmony) gates progression but never erases earned value

---

## Core Architecture

### 1. XP System (Sections 4–5)

#### Three Independent Wallets
```
lifetime_xp = mind_xp + muscle_xp + money_xp
```

**Key Rule:** Every XP award must be assigned to exactly ONE vector. Cross-vector rewards are split into separate ledger entries for auditability.

#### XP Eligibility Pipeline (4.4)
Before any award, backend confirms:
1. ✓ Authenticated user owns the source record
2. ✓ Source record is valid and complete
3. ✓ Action meets configured reward condition
4. ✓ Event is not a duplicate
5. ✓ Action hasn't already received that reward
6. ✓ Reward cap/cooldown permits the award
7. ✓ Vector is defined by the rule
8. ✓ Event is within permitted date/time window
9. ✓ Verification requirement is satisfied

#### Event Idempotency (4.5)
Stable event keys prevent duplicate awards:
```
habit_completion:{completion_id}
nutrition_protein_target:{user_id}:{local_date}
workout_completion:{workout_session_id}
mission_task:{task_id}:completed
focus_session:{session_id}:completed
```

**Same event key = never awarded twice. Retried requests return original result.**

#### Anti-Farming Safeguards (4.6)
- One protein-target reward per 24-hour cycle
- One completion reward per habit occurrence
- One completion reward per workout session
- PR rewards only for verified improvement
- Mission task rewards only once per completion
- Focus rewards use completed sessions, not app-open time
- Repeated tiny entries must not create rewards

#### XP Corrections (4.7) — Non-Destructive
- Ledger entries are **append-only** (never delete)
- Never silently edit a credited amount
- Invalid awards create audited reversal entries
- Never delete badges or levels
- Never subtract XP for missed habits

---

### 2. Vector Levels (Section 5)

**Three independent level tracks:**

Each vector (Mind, Muscle, Money) has:
- Current vector level
- Lifetime XP total
- Tier XP / XP required (for current level)
- Core metrics logged
- Recent actions

**Level Calculation:**
```
vector_level = highest level whose cumulative threshold <= vector_lifetime_xp
tier_xp = vector_lifetime_xp - threshold_for_current_level
tier_xp_required = threshold_for_next_level - threshold_for_current_level
tier_progress = tier_xp / tier_xp_required
```

**⚠️ Needs Confirmation:** Do all levels require exactly 1,000 XP, or is there a scaling table?

**UI Display Example:** `840 / 1,000 XP` (from Profile design)

---

### 3. Character Level (Section 6)

**Separate from vector levels** — derived from overall lifetime XP.

**Example Profile:**
- Character Level: 24
- Mind Level: 26
- Muscle Level: 23
- Money Level: 21

**Calculation:**
```
character_level = highest level whose total_xp_threshold <= lifetime_xp
character_tier_xp = lifetime_xp - character_threshold(current_level)
character_progress = character_tier_xp / character_tier_required
```

**⚠️ Needs Confirmation:** Character level thresholds (shown as `2,450 / 3,000` and `3,450 / 5,600` in designs — are these universal or samples?)

---

### 4. Tri-Vector Harmony / Equilibrium (Section 7)

**Purpose:** Prevent one vector from dominating; encourage balanced growth.

**Design-Confirmed Formula:**
```
harmony_score = (min_score × 0.4) + (avg_score × 0.6)
```

**Implementation:**
1. Normalize Mind, Muscle, Money to 0–100 scale
2. Calculate min_score and avg_score
3. Apply formula
4. Clamp result to 0–100%

**Effects:**
- Displayed on Character Profile and Analytics
- System uses balance to throttle or calibrate advancement
- Rank promotions require vector stability (not just total XP)
- **Harmony never deletes XP** — it's a progression gate, not punishment
- Low score may delay rank eligibility or reduce balance-based bonuses

**⚠️ Needs Confirmation:** Exact normalization function (how to convert vector level/progress to 0–100?). Design examples show 92% and 78.4%, but these are samples.

---

### 5. Rank and Tier Ladder (Section 8)

**Official Ladder (8.1):**
| Rank | Name | Level Range |
|------|------|-------------|
| E | Novice | Unlocked starting tier |
| D | Apprentice | Unlocked progression tier |
| C | Warrior | 20–29 |
| B | Elite | 30–44 |
| A | Master | 45–59 |
| S | Grandmaster | 60–74 |
| SS | Legend | 75–89 |
| SSS | Mythic | 90+ |

**Current Example:** Rank C — Warrior, Level 24

**Rank B (Elite) Requirements — Design-Confirmed:**
- Character Level 30
- Lifetime XP 65,000
- Each of Mind, Muscle, Money above Level 25 (exact boundary TBD)
- Minimum harmony requirement (level not specified)

**Non-Level Factors (8.2):**
Ranks unlock:
- Equipment slots
- Titles
- Guild authority

**Promotion Algorithm (8.3):**
```
Check character_level >= min_level
Check lifetime_xp >= min_lifetime
Check each vector_level >= min_vector_level
Check harmony_score >= min_harmony
Check any required badge/milestone
Evaluate rank-specific conditions

If all pass:
    Mark rank eligible
    Allow promotion
Else:
    Show unmet requirements
```

**⚠️ Needs Confirmation:** Complete requirements for Novice through Mythic (only Warrior and Elite are visible).

---

## Domain-Owned Systems

### 6. Habits & Protocols (Section 10)

**Definition:** Repeatable behaviors assigned to one vector.

**Visible Examples:**
- Read 10 Pages (Mind)
- Deep Work Focus Block (Mind)
- Complete Planned Workout (Muscle)
- Hydration Benchmark (Muscle)
- Sleep Target 7h 30m+ (Muscle)
- High-Leverage Business Action (Money)
- Daily Revenue Action (Money)

**Protocol Structure (10.2):**
- Name and description
- Vector (Mind, Muscle, or Money)
- Schedule/cadence
- Target and unit
- Completion type (binary, numeric, duration, count, externally synced)
- Reward rule
- Optional quest/mission link
- Optional enemy/counter-strategy
- Status (active, paused, archived)
- Effective dates

**Completion & Reward (10.3):**
- For numeric protocols:
  - Store raw value and unit
  - Store target snapshot used for evaluation
  - Store local activity date
  - Calculate completion server-side
  - Do NOT repeatedly award as user updates 50% → 80% → 100%
- For binary protocols:
  - One completion per scheduled occurrence (unless explicitly allows multiple)

**Missed Days & Streaks (10.4) — Non-Punitive:**
- Missed protocols incur **zero XP penalties**
- Missed days never delete lifetime XP
- Breaks never reduce permanent progression
- Current streak can pause/reset, but best streak is permanent
- Unscheduled days don't count as misses
- Paused/archived protocols don't accrue missed-day penalties

**Streak Metrics (10.5) — Keep Separate:**
- Current protocol streak
- Best protocol streak
- Character/cross-vector consistency streak
- Seven-day rolling adherence
- Thirty-day consistency rate
- Lifetime protocol hits

**Cross-Vector Consistency (10.6):**
Consistent Striker badge requires 14 consecutive days with:
- ≥1 Mind protocol completed
- ≥1 Muscle protocol completed
- ≥1 Money protocol completed

---

### 7. Nutrition & Muscle Progression (Section 11)

**Nutrition & Fuel Matrix includes:**
- Calories/energy
- Protein
- Carbohydrates
- Fats
- Dietary fiber
- Hydration
- Electrolytes
- Meals and food logs
- Verified/estimated sources
- Regional foods and unit conversion
- Macro targets
- RPG ledger integrity

**Protein Reward Rule (11.2) — Design-Confirmed:**
- User sets customized protein target
- Hitting it awards `+40 Muscle XP`
- **Credited precisely once per 24-hour cycle**
- Micro-entries or calorie spikes generate zero XP

**Implementation (11.2):**
1. Store target snapshot for nutrition day
2. Calculate total protein from accepted food entries
3. Apply source confidence/verification
4. Detect first valid crossing of target
5. Award configured Muscle XP once
6. Record event key and target snapshot
7. Ignore later updates for additional XP

**Other Nutrition Metrics (11.3):**
- Calories, carbs, fats, fiber, hydration, electrolytes are telemetry only
- Do NOT automatically award XP unless configured
- Hydration has separate protocol with example `+20 Muscle XP`
- Don't double-reward if hydration protocol and nutrition both cover it

---

### 8. Workouts & Muscle Progression (Section 12)

**Workout Data includes:**
- Routines and templates
- Exercise library
- Training sessions
- Sets, reps, weight, RPE, notes, status
- Rest timer and elapsed time
- Session tonnage
- Exercise substitution
- Progressive overload comparison
- Hall of Fame/PRs
- Linked guild mission

**Workout XP (12.2):**
- Completed workout can award Muscle XP based on configured rules
- Example: current-session reputation yield of `+120 XP` (sample value)
- Backend evaluates:
  - Session is saved and completed
  - ≥1 valid exercise/set exists per config
  - Set data is valid
  - Session is not a duplicate
  - User owns the session
  - Daily/weekly caps respected
- **Do NOT award for:**
  - Starting a workout
  - Opening an exercise
  - Repeatedly saving the same session

**PR Logic (12.3):**
PR must compare like-for-like:
- Same exercise identity or approved equivalent
- Same measurement type
- Same unit
- Valid load/reps/form conditions
- Exclude warm-up/invalid sets if required

**Hall of Fame shows:**
- PR alerts during session
- Previous best
- New record
- Estimated 1RM
- All-time bests
- Example: +2.5 kg leap

**PR can trigger:**
- PR event
- Muscle XP bonus (if configured)
- Badge evaluation
- Hall of Fame update
- Notification

**Anti-Farming:** Don't reward repeated re-entry of same PR, invalid unit changes, or trivial edits.

**Tonnage & Volume (12.4):**
```
set_tonnage = load × reps
session_tonnage = sum(set_tonnage for eligible sets)
```
- Define unit conversions consistently
- Tonnage/volume are analytics and evidence
- Do NOT award unlimited XP per kilogram

---

### 9. Mind Progression: Focus, Reading, Cognitive Work (Section 13)

**Visible Examples:**
- Reading pages
- Focus blocks
- Deep work sessions
- Technical study
- Coding/architecture work
- Focus duration
- Reading velocity
- Screen-time protocols
- Completed focus sprints

**Focus Session (13.1):**
Store:
- Planned duration
- Actual focused duration
- Start/end time
- Paused duration
- Focus preset (e.g. Pomodoro)
- Linked priority task/mission
- Completion status
- Vector
- XP reward rule

**Award XP only after valid completion threshold.** Do NOT award based on open timer or background app time.

**Dashboard Example:**
- 25:00 Pomodoro
- 50/10 Ultra
- Custom option
- Linked priority task
- Daily deep-work progress: 45m / 120m

**Reading (13.2):**
Store:
- Book/resource
- Pages read
- Current page/total pages
- Session date
- Optional notes
- Vector assignment
- Reward event

Reading target (e.g. 10 pages) is rewarded once per scheduled occurrence. Logging 20 pages ≠ multiple daily rewards unless rule explicitly rewards incremental milestones.

**Mind Telemetry (13.3):**
Analytics can display:
- Reading velocity (daily average pages)
- Focus hours
- Focus blocks
- Habit adherence
- Current learning resource and completion %

**Analytics metrics are NOT independent XP events.**

---

### 10. Money Progression (Section 14)

**Visible Examples:**
- Business actions
- Revenue actions
- Client delivery
- Invoicing
- SaaS/business tracks
- Business sprints
- MRR milestones
- Financial/budget review

**Money Action (14.1):**
Define:
- Action
- Target outcome
- Proof type
- Completion criteria
- Reward
- Optional linked mission/revenue goal

**Shown Rewards:**
- Review client contract: `+30 Money XP`
- Verified client milestone: `+60 Money XP`
- Shipped backend mission: `+120 Money XP`
- First Rev Sprint badge: Invoiced + completed client delivery >$3,000 USD

**Verification Levels (14.2):**
- Self-reported completion
- Uploaded proof/note
- Linked invoice or deliverable
- Verified milestone approval

**⚠️ Important:** Do NOT assume entering a revenue number proves revenue was earned. Define explicit verification policy per action.

---

### 11. Quests & Daily Command Center (Section 15)

**Daily Quests Display:**
- Completed count (e.g. 3 of 7)
- XP gained today from quests
- Vector label
- Target
- Current logged progress
- Reward amount
- State: done, scheduled, start, on track, pending

**Example Daily Quests:**
- Sleep 7–7.5 hours → Muscle → `+25 XP`
- Read 10 pages → Mind → `+20 XP`
- Hydration 2.5 / 3.0 L → Muscle → `+15 XP`
- Planned gym session → Muscle → `+50 XP`
- Deep Work 2 Hours → Mind → `+40 XP`
- Screen Time Under 3 Hours → Mind → `+20 XP`
- Daily Money Action → Money → `+30 XP`

**⚠️ Not fixed templates:** Generated from enabled protocols, active missions, schedule, and configured challenges.

**Quest States (15.2):**
- `available`
- `scheduled`
- `in_progress`
- `completed`
- `expired`
- `skipped` (optional, non-punitive)

**Daily Boss Encounter (15.3):**
Example: "Procrastination Specter" — 7-Day Focus Sprint
- Enemy name
- Challenge description
- Day count (e.g. Day 4 of 7)
- Boss HP/remaining progress
- Reward: `+200 Mind XP` + "Unbroken" badge
- "Log today's sprint" action

**⚠️ Needs Confirmation:** Exact HP damage formula and missed-day behavior. Keep non-destructive.

---

### 12. Enemies, Defenses & Counter-Strategies (Section 16)

**Visible Examples:**
- Procrastination Specter/Hydra
- Enemy or defense tracking
- Counter-action (e.g. 5-minute focus rule)
- Intercepted impulses
- Counter-strategy (e.g. bedside Kindle only, grayscale toggle)
- Streak protection
- Zero-shame safeguards

**Enemy Record:**
- Name
- Category
- Trigger/context
- Counter-strategy
- Active schedule
- Encounter events
- Optional boss/quest link
- Privacy level

**Defense Event:**
- Trigger detected or user-reported
- Counter-strategy used
- Outcome
- Timestamp
- Optional evidence/note

**Important:** Do NOT award XP simply because app inferred distraction. Successful counter-actions may progress quests/badges if configured.

---

### 13. Missions: Long-Term Goals, Plans, Milestones, Tasks (Section 17)

**Hierarchy:**
```
Mission
  ├── Success criteria / Definition of Done
  ├── Plans / Phases
  │     ├── Milestones
  │     ├── Dependencies
  │     └── Tactical tasks
  ├── Task execution log
  ├── Action / work records
  ├── Mission attribute yield
  └── Mission activity history
```

**Examples from Design:**
- Build Olywood — 42% overall
- Sub-3:45 Marathon — 68%
- Reach $10K MRR SaaS — 25%

**Mission Cards Show:**
- Vector/category
- Status: on track, at risk, completed
- Overall progress
- Plans complete
- Deadline
- Next telemetry/health

**Definition of Done (17.2):**
Every mission must have written success criteria. Example:
> "A fully operational application is deployed to production and actively used by intended beta cohorts, supported by automated Stripe billing tiers, Supabase JWT authentication, and sub-100ms API response rates."

**Mission completion based on DoD, not just tasks checked.**

**Plans & Milestones (17.3):**
Example phases:
- Discovery
- Prototyping
- Backend Development
- Frontend Development
- Testing & Public Launch

Each plan has:
- Task count
- Weighted progress
- Due date
- Status
- Dependencies
- Completion criteria

**Milestone can verify and unlock dependent plans.**

**Weighted Mission Progress (17.4):**
Example: `42% (24 / 52 Tasks)`

```
plan_progress = sum(weight of completed/verified tasks) / sum(weight of all tasks)
mission_progress = sum(weight of completed/verified plans or tasks) / total configured weight
```

**Choose one canonical calculation (plan-weighted or task-weighted), use consistently.**

**Tactical Task XP (17.5):**
Examples:
- Define database schema & ORM migrations — queued reward
- Configure RLS policies — queued reward
- Build integration test suite — queued reward
- Work records verified by system

**Task Reward:**
1. Assigned to vector
2. Configured XP amount
3. Awarded once at required completion/verification state
4. Respects dependencies
5. Recorded with task ID and evidence
6. Auditable

**Queued XP ≠ Earned XP:**
- Distinguish potential/queued
- Completed but awaiting verification
- Verified and credited

**Mission Milestones & XP (17.6):**
Verified milestone awards larger vector XP. Example:
- Shipped Phase 1 Backend: `+120 Money XP`
- SaaS milestone check: `+60 Money XP`

**Milestone also:**
- Unlocks dependent plans
- Updates mission progress
- Unlocks badges/titles
- Creates notification
- Creates ledger entry

**Work Records (17.7):**
Action Log & Work Records area:
- Description of work
- XP credited
- Time spent/focus duration
- Timestamp
- Evidence attachment
- Verification status

**Work records are append-only.** Edits preserve previous version or create audit event.

---

### 14. Calendar & Daily Activity Audit (Section 18)

**Timeline & Proof-of-Work includes:**
- Annual activity matrix/heatmap
- Daily activity summary
- XP earned on selected day
- Commitment hits
- Qualifying logs
- Day planner/time-block schedule
- Mind, Muscle, Money, and rest streams
- Daily commitment execution
- Mission tasks
- Daily XP ledger
- Tamper-proof audit/sync hash
- Daily reflection and debrief

**Calendar does NOT award XP independently** — displays source events and ledger records.

**Daily Activity Matrix (18.1):**
- Active
- Rest
- Unlogged
- Partial/low intensity
- High intensity

**Do NOT equate rest day with failed day.**

**Daily Summary (18.2):**
- Total XP earned
- Commitments hit
- Qualifying logs
- Vector XP breakdown
- Completed missions/tasks
- Workout details
- Focus sessions
- Nutrition/hydration targets
- Reflection/debrief

**Ledger Audit (18.3):**
Read-only view of same immutable XP ledger used by Character and Profile. **Do NOT create second ledger or calculate XP independently.**

---

### 15. Analytics & Telemetry (Section 19)

**Analytics is read-only.** Aggregates events and progression data over selected period.

**Features:**
- Date range filters (This Week, Last Week, Last 30 Days, This Month, Last 90 Days, Custom)
- Stream filter (All, Mind, Muscle, Money)
- Total XP yield for period
- Hero tier/status
- Deep Work Engine execution
- Execution adherence
- Three-attribute distribution
- System equilibrium
- Mind telemetry: reading velocity, focus sessions, screen time, current book/resource
- Muscle telemetry: volume, hard set distribution, sleep, hydration, protein, PRs
- Money telemetry: active tracks, revenue milestone, strategic deep time, business sprints

**Rules (19.1):**
- All metrics derived from source records or ledger events
- Period filters use clearly defined timezone
- Lifetime XP must NOT be mislabeled as period XP
- XP distribution calculated from ledger entries for selected period
- Harmony uses same calculation service as Character/Profile
- **Analytics must NOT award XP**
- Historical values should remain reproducible if reward rules change

---

### 16. Notifications (Section 20)

**Centralized Asynchronous Telemetry Feed includes:**
- Unread transmissions
- Delivery integrity
- Quiet hours engine
- Zero-shame safeguard
- In-app dispatch
- Browser push
- Daily email brief
- Quiet-hours shield
- Critical security bypass
- Category filters
- Mark all as read
- Archive selected
- Privacy-shielded banners

**Notification Types (20.1):**
- Attribute level-up/rank advancement
- Quest approaching deadline
- Hydration milestone reminder
- Personal guardian/counter-strategy reminder
- Mission milestone completed
- Operator session authenticated
- Deep work session logged

**Delivery (20.2):**
Notifications generated from durable domain events. Delivery channels separate from event creation.

Store:
- Notification ID
- User ID
- Event ID
- Type/category
- Title/body
- Created time
- Read time
- Archived time
- Channel delivery state
- Quiet-hours deferred state
- Privacy classification

**Quiet Hours & Privacy (20.3):**
- Quiet hours defer non-essential notifications
- Critical security alerts may bypass per user settings
- Privacy shielding masks sensitive enemy names, financial amounts, personal habits
- No lock-screen/browser exposure of private Nutrition, Workout, Money, Habit details
- "Zero shame" = supportive reminders, not punitive

---

## Data Model for Supabase/PostgreSQL (Section 22)

### Core User/Character
- `profiles` (id PK, display_name, avatar_url, timezone, profile_visibility, created_at, updated_at)
- `character_progress` (user_id PK, lifetime_xp, character_level, rank_id, harmony_score, current_streak, updated_at)
- `vector_progress` (user_id, vector, lifetime_xp, vector_level, tier_xp, tier_xp_required, updated_at)

### XP Events & Ledger
- `progression_events` (id, user_id, event_key, source_type, source_id, occurred_at, local_date, timezone, verification_level, metadata, created_at)
- `xp_ledger` (id, user_id, event_id, vector, xp_delta, reward_key, reason_code, description, rule_version, correction_of_id, created_at)

### Configuration
- `xp_reward_rules` (id, rule_key, source_type, vector, base_xp, cap_scope, cap_count, cooldown_seconds, eligibility_config, verification_level, active_from, active_to, config_version)
- `level_thresholds` (scope, level, total_xp_required, config_version)
- `rank_definitions` (id, rank_code, name, min_character_level, max_character_level, requirements, rewards, sort_order, config_version, is_active)

### Badges, Titles, Perks
- `badge_definitions`, `user_badges`, `title_definitions`, `user_titles`, `perk_definitions`, `user_perks`

### Domain-Specific Tables
- Habits: `habit_protocols`, `habit_occurrences`, `habit_streaks`
- Nutrition: `nutrition_days`, `food_entries`
- Workout: `workout_sessions`, `workout_sets`, `personal_records`
- Focus/Reading/Money: Domain-specific source tables
- Quests/Missions: `quests`, `quest_progress`, `missions`, `mission_plans`, `mission_tasks`, `mission_work_records`, `mission_milestones`
- Enemies/Notifications/Calendar: `enemy_challenges`, `defense_events`, `notification_events`, `notification_deliveries`, `daily_summaries`

---

## Backend Processing Architecture (Section 23)

### Trusted Event Flow
```
User action
   ↓
Domain API / Edge Function
   ↓
Validate auth + record ownership
   ↓
Validate domain completion
   ↓
Create idempotent progression event
   ↓
Evaluate XP rule + cap
   ↓
Append vector XP ledger entry
   ↓
Recompute vector + character totals
   ↓
Recompute vector levels + character level
   ↓
Recompute harmony
   ↓
Evaluate rank eligibility
   ↓
Evaluate badges / titles / perks
   ↓
Create durable notifications
   ↓
Refresh Dashboard / Character / Analytics / Calendar
```

### Transaction Requirements
- Event idempotency
- XP ledger insert
- Cached XP summary update
- Level/rank recomputation
- Badge unlock insert
- Badge reward ledger insert
- Notification event creation

**Use database transactions or reliable outbox/event-processing pattern.**

### Rebuildability
Cached totals are performance-only. System must rebuild:
- Vector XP totals
- Character lifetime XP
- Vector levels
- Character level
- Rank eligibility
- Harmony score
- Badge progress (where derived from source data)

**Ledger and domain source records are authoritative.**

---

## Security & Supabase Rules (Section 24)

1. Enable Row Level Security on all user-owned tables
2. Users can read their own private data
3. Public/guild profile reads expose only explicitly approved fields
4. Clients cannot directly insert XP ledger entries
5. Clients cannot update lifetime XP, vector XP, levels, rank, harmony, or badge state
6. XP awards run through trusted server-side code or secured database functions
7. Never expose Supabase service-role key in client
8. Validate ownership for every referenced domain record
9. Use unique constraints for event idempotency and badge uniqueness
10. Use database transactions for progression changes
11. Validate all numeric values, units, timestamps, source records
12. Store UTC timestamps and resolved local date/timezone for daily rules
13. Keep audit trails for verification and XP corrections
14. Apply rate limits to event creation, mission updates, notification endpoints
15. Do NOT trust client-supplied XP amounts, vector IDs, verification flags, completion claims

---

## Timezone & Date Handling (Section 25)

- Store timestamps in UTC
- Store user's IANA timezone
- Calculate scheduled local dates using that timezone
- Save resolved `local_date` on event
- Do NOT recalculate historical dates after timezone change
- **Protein reward cycle:** Confirm local calendar day vs rolling 24-hour window
- Apply same daily boundary consistently across Habits, Quests, Calendar, XP caps
- Distinguish rest days, unlogged days, missed scheduled days

---

## Edge Cases & Non-Destructive Safeguards (Section 27)

1. Duplicate button tap ≠ double XP
2. Retried API request = original reward
3. Client cannot award XP to another user
4. Editing completed record ≠ second reward
5. Deleting source record ≠ delete ledger history
6. Corrected record requires audited correction entry
7. Missed habits ≠ subtract XP
8. Broken streaks ≠ delete badges/levels
9. Rest days ≠ automatic failures
10. Unlogged days distinguishable from confirmed misses
11. Timezone changes ≠ rewrite historical dates
12. Nutrition target changes ≠ retroactively alter snapshot
13. Protein target crossing rewarded once per cycle
14. Multiple PR edits ≠ repeated rewards
15. Workout in progress ≠ completion XP
16. Mission task rewards only once per completion
17. Queued/potential XP ≠ earned until verified
18. Mission progress must not exceed 100%
19. Dependent plans unlock only after dependencies verified
20. Badge criteria changes preserve previously earned badges
21. Rank config changes ≠ silently downgrade users
22. Harmony recalculation ≠ delete XP
23. Notification retry ≠ duplicate notifications
24. Quiet hours defer delivery; never lose notification
25. Private data (health, nutrition, workout, habit, financial) ≠ leak into public notifications

---

## Implementation Order (Section 29)

### Phase 1 — Data Foundation
1. Inspect existing Supabase schema
2. Confirm domain source tables
3. Add progression event identity and idempotency
4. Create append-only vector XP ledger
5. Add vector and character progression summaries
6. Add RLS and server-only reward writes

### Phase 2 — Core Progression
7. Implement configurable XP rules
8. Implement vector XP totals and vector levels
9. Implement character lifetime XP and character level
10. Implement approved harmony normalization and formula
11. Implement rank definitions and eligibility

### Phase 3 — Achievements
12. Implement badge definitions and evaluators
13. Implement title vault and equipped title
14. Implement perk definitions (effects must be approved)
15. Add level-up, rank-up, badge notifications

### Phase 4 — Domain Integrations
16. Connect Habit protocols and streaks
17. Connect Nutrition protein/hydration reward rules
18. Connect Workout completion, tonnage, PR logic
19. Connect Focus/reading events
20. Connect Money actions and verification
21. Connect Quest and boss progress
22. Connect Mission plans, tasks, work records, milestones

### Phase 5 — Read Models & Polish
23. Build Dashboard progression summaries
24. Build Character/Profile sheet
25. Build Calendar daily audit
26. Build Analytics aggregations
27. Build Notifications delivery/quiet hours
28. Add data export and privacy controls

### Phase 6 — Validation
29. Simulate progression over 7, 30, 90, 365 days
30. Test balance across all three vectors
31. Test anti-farming and idempotency
32. Test rank gates and badge criteria
33. Test timezone, offline, retry behavior
34. Run acceptance tests before production

---

## Product Decisions Required Before Production (Section 30)

The designs provide strong system model, but these details need confirmation:

1. **Vector level curve:** 1,000 XP per level or scaling table?
2. **Character level curve:** Cumulative XP thresholds for each overall level?
3. **Harmony normalization:** How to convert Mind, Muscle, Money to 0–100?
4. **Harmony gating:** Minimum harmony score for each rank promotion?
5. **Rank requirements:** Exact requirements for all 8 ranks (only Warrior/Elite visible)?
6. **Elite gate boundary:** Does "above Level 25" mean 26+ or does 25 qualify?
7. **XP reward table:** Confirm all action values and difficulty variations?
8. **Workout XP:** How do session XP, PR XP, volume bonuses combine?
9. **Nutrition cycle:** Local calendar day or rolling 24 hours?
10. **Streak behavior:** Miss = pause, break, or grace period for current streak?
11. **Quest expiry:** What happens to unfinished daily quests?
12. **Boss HP:** Define damage formula and missed-day behavior?
13. **Mission verification:** Which task/milestone types require system verification?
14. **Cross-vector badge:** Exact minimum daily activity per vector for Consistent Striker?
15. **Perk effects:** Define actual effects for Equilibrium Perk and future perks?
16. **Guild/leaderboard:** Social visibility in v1? Which fields are public?

---

## Non-Negotiable System Rules (Section 31)

- M3 Triad progression built around Mind, Muscle, Money
- Each vector has own XP and level
- Character level separate from vector levels
- Lifetime XP = sum of credited vector XP
- Harmony measures balance; supports non-destructive progression gating
- Ranks earned through configured level, XP, vector-stability requirements
- Badges recognize verifiable milestones; may award XP/titles/perks
- Habits are protocols, assigned to vector, with non-punitive missed-day handling
- Nutrition protein reward is verified and capped once per 24-hour cycle
- Workout XP based on valid completed sessions and verified PR logic
- Quests are bounded objectives; Missions are strategic goal hierarchies
- Mission tasks/milestones can produce vector XP after completion/verification
- Calendar and Analytics are read-only views of source data and ledger
- Notifications are durable, privacy-aware, quiet-hours capable
- **XP ledger is immutable and auditable**
- **Server is authoritative** for XP, levels, ranks, harmony, badges, rewards
- **No missed day, broken streak, failed quest deletes lifetime XP, earned levels, or unlocked badges**
- Do not implement unconfirmed formulas or rank gates by guessing

---

## Summary of Key Takeaways

### System Philosophy
M3 Triad is **built on trust in the user's real-world effort, not suspicious enforcement.**
- Reward meaningful work, not app time
- Never punish setbacks with XP loss
- Badges and levels are permanent
- Streaks pause but progress is immutable

### Three Pillars
1. **Mind** — Learning, focus, cognitive work
2. **Muscle** — Training, nutrition, recovery
3. **Money** — Business, revenue, sovereignty

Each has independent XP, levels, telemetry, and progression.

### Core Guarantees
- Lifetime XP sums vector XP (never confused with current-tier)
- Character level separate from vector levels
- Harmony gates progression without deleting achievement
- Rank promotions require vector stability, not just large totals
- Badges, titles, perks unlock achievements
- Habits are non-punitive; streaks reset but progress persists
- Missions structure long-term goals into verifiable plans
- Calendar and Analytics are read-only audit views
- Notifications are durable, private, and quiet-hours aware
- Server is source of truth for all progression claims

### Critical Configuration Gaps
Specification defines behavior but needs product approval for:
- Exact XP curves (vector and character)
- Harmony normalization function
- Rank-by-rank requirements
- Specific reward table values
- Protein reward cycle definition
- Streak pause/break/grace policy
- Boss encounter damage formula
- Mission verification tiers
- Perk actual effects

---

## Navigation & System Boundaries (Section 2)

**Main Destinations:**
- Dashboard
- Quests
- Character
- Missions
- Habits
- Workouts
- Analytics
- Calendar

**Supporting Systems:**
- Nutrition & Fuel Matrix
- Notifications
- Profile / Character & Identity Matrix
- XP Ledger
- Daily Command Center
- Focus Session
- Daily snapshots
- Boss / enemy encounters
- Badges, titles, rank ladder, progression history

**Critical:** Do NOT merge these into one generic tracker. Each domain owns its own source records and validation rules.

---

**Analysis Complete** — Ready for implementation planning and architecture design.
