# M3 Triad — Implementation Roadmap

**Purpose:** Step-by-step guide to build the LIFE RPG system from scratch.

**Timeline:** 6 Phases over development cycle

---

## Overview

```
Phase 1: Data Foundation (Weeks 1-2)
   ↓
Phase 2: Core Progression (Weeks 3-4)
   ↓
Phase 3: Achievements (Weeks 5-6)
   ↓
Phase 4: Domain Integrations (Weeks 7-10)
   ↓
Phase 5: Read Models & Polish (Weeks 11-13)
   ↓
Phase 6: Validation & Launch (Weeks 14-15)
```

---

## Phase 1: Data Foundation (Weeks 1-2)

### Goal
Establish immutable, auditable XP ledger and progression tracking.

### Tasks

#### 1.1 — Inspect Existing Schema
- [ ] Review existing Supabase tables
- [ ] Document current user, auth, profile tables
- [ ] Identify what can be reused vs. what needs creation
- [ ] Check for naming conventions and patterns

**Deliverable:** `docs/CURRENT_SCHEMA.md` documenting existing tables

#### 1.2 — Create Progression Event Table
```sql
-- Table: progression_events
-- Purpose: Durable, idempotent record of activities
-- Never modified after creation

CREATE TABLE progression_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_key TEXT NOT NULL,  -- Stable identifier for idempotency
  source_type TEXT NOT NULL, -- habit, workout, nutrition, focus, money, quest, mission, etc.
  source_id UUID NOT NULL,   -- Reference to source record
  occurred_at TIMESTAMPTZ NOT NULL,
  local_date DATE NOT NULL,  -- Resolved from timezone
  timezone TEXT NOT NULL,    -- IANA timezone (e.g., 'Asia/Kolkata')
  verification_level TEXT NOT NULL, -- self_reported, app_validated, integration_verified, system_verified
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Context, snapshot data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, event_key),  -- Prevents duplicate events
  INDEX idx_user_id (user_id),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_local_date (local_date)
);
```

**Deliverable:** Migration file and table creation script

#### 1.3 — Create XP Ledger Table
```sql
-- Table: xp_ledger
-- Purpose: Append-only record of all XP awards and corrections
-- Never modified or deleted; corrections create new entries

CREATE TABLE xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES progression_events(id),
  vector TEXT NOT NULL,  -- mind, muscle, money
  xp_delta INTEGER NOT NULL,  -- Can be negative for corrections
  reward_key TEXT NOT NULL,  -- Stable identifier (e.g., 'habit_completion', 'workout_session')
  reason_code TEXT NOT NULL,  -- Human-readable reason
  description TEXT NOT NULL,  -- Full description
  rule_version TEXT NOT NULL,  -- Config version for auditability
  correction_of_id UUID REFERENCES xp_ledger(id),  -- If this is a correction
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(event_id, reward_key),  -- Prevents duplicate awards from same event
  INDEX idx_user_id (user_id),
  INDEX idx_vector (vector),
  INDEX idx_created_at (created_at)
);
```

**Deliverable:** Migration file

#### 1.4 — Create Vector & Character Progress Cache Tables
```sql
-- Table: vector_progress
-- Purpose: Cached progression summary for each vector
-- Rebuildable from xp_ledger; updated after each XP award

CREATE TABLE vector_progress (
  user_id UUID PRIMARY KEY,
  vector TEXT NOT NULL,  -- mind, muscle, money
  lifetime_xp BIGINT NOT NULL DEFAULT 0,
  vector_level INTEGER NOT NULL DEFAULT 0,  -- Derived from lifetime_xp
  tier_xp BIGINT NOT NULL DEFAULT 0,  -- XP in current level
  tier_xp_required BIGINT NOT NULL DEFAULT 1000,  -- XP needed for next level
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY(user_id) REFERENCES auth.users(id),
  UNIQUE(user_id, vector),
  INDEX idx_vector_level (vector_level)
);

-- Table: character_progress
-- Purpose: Overall character progression (separate from vector levels)

CREATE TABLE character_progress (
  user_id UUID PRIMARY KEY,
  lifetime_xp BIGINT NOT NULL DEFAULT 0,  -- Sum of all vector XP
  character_level INTEGER NOT NULL DEFAULT 0,
  rank_id UUID REFERENCES rank_definitions(id),
  harmony_score NUMERIC(5, 2) NOT NULL DEFAULT 50.0,  -- 0-100 scale
  current_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY(user_id) REFERENCES auth.users(id),
  INDEX idx_character_level (character_level),
  INDEX idx_lifetime_xp (lifetime_xp)
);
```

**Deliverable:** Migration file

#### 1.5 — Add RLS Policies
```sql
-- RLS Policy: Users can read their own progression
CREATE POLICY "Users can read own progression"
  ON progression_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only server can write XP ledger
CREATE POLICY "Only service role can write xp_ledger"
  ON xp_ledger
  FOR INSERT
  WITH CHECK (false);  -- No client-side inserts
```

**Deliverable:** SQL policy files

#### 1.6 — Create Configuration Tables
```sql
-- Table: xp_reward_rules
-- Purpose: Configurable reward definitions (never hardcoded)

CREATE TABLE xp_reward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT NOT NULL UNIQUE,  -- e.g., 'habit_completion', 'workout_session'
  source_type TEXT NOT NULL,  -- habit, workout, nutrition, etc.
  vector TEXT NOT NULL,  -- mind, muscle, money
  base_xp INTEGER NOT NULL,
  cap_scope TEXT,  -- per_day, per_week, per_occurrence, per_24h, etc.
  cap_count INTEGER,  -- Max number of times per cap_scope
  cooldown_seconds INTEGER,  -- Minimum seconds between awards
  eligibility_config JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Custom conditions
  verification_level TEXT NOT NULL,  -- self_reported, app_validated, integration_verified, system_verified
  active_from TIMESTAMPTZ,
  active_to TIMESTAMPTZ,
  config_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: level_thresholds
-- Purpose: XP curves for vector and character levels

CREATE TABLE level_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,  -- character, mind, muscle, money
  level INTEGER NOT NULL,
  total_xp_required BIGINT NOT NULL,
  config_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(scope, level, config_version),
  INDEX idx_scope_level (scope, level)
);
```

**Deliverable:** Migration file

### Testing
- [ ] Write SQL tests for idempotency (duplicate event keys)
- [ ] Write tests for RLS policies
- [ ] Verify unique constraints work

**Deliverable:** `tests/integration/database-constraints.test.ts`

---

## Phase 2: Core Progression (Weeks 3-4)

### Goal
Implement XP calculation, vector levels, character level, rank eligibility, and harmony.

### Tasks

#### 2.1 — Implement XP Calculator Service
File: `src/lib/services/progression.ts`

```typescript
// Core functions
export async function awardXP(
  userId: string,
  eventKey: string,
  sourceType: string,
  sourceId: string,
  vector: 'mind' | 'muscle' | 'money'
): Promise<{ success: boolean; xp: number; leveledUp: boolean }> {
  // 1. Verify user owns source record
  // 2. Verify source record is valid
  // 3. Check if event already awarded (idempotency)
  // 4. Load reward rule
  // 5. Verify rule is active
  // 6. Check caps/cooldowns
  // 7. Verify verification requirement
  // 8. Create progression_event entry
  // 9. Create xp_ledger entry
  // 10. Update vector_progress cache
  // 11. Update character_progress cache
  // 12. Check for level-up
  // 13. Check for rank eligibility
  // 14. Create notifications
  // 15. Return result
}

export async function recalculateVectorXP(
  userId: string,
  vector: 'mind' | 'muscle' | 'money'
): Promise<{ lifetime_xp: bigint; level: number }> {
  // Rebuild from ledger (for data integrity verification)
}

export async function recalculateCharacterXP(userId: string): Promise<bigint> {
  // Sum all vector XP
}
```

**Deliverable:** Service with comprehensive error handling and logging

#### 2.2 — Implement Level Calculator
File: `src/lib/utils/level-calculator.ts`

```typescript
export interface LevelInfo {
  level: number;
  tierXP: bigint;
  tierXPRequired: bigint;
  tierProgress: number;  // 0.0 to 1.0
}

export function calculateVectorLevel(
  vectorXP: bigint,
  thresholds: LevelThreshold[]
): LevelInfo {
  // Find highest level whose threshold <= vectorXP
  // Calculate tier_xp and tier_xp_required
}

export function calculateCharacterLevel(
  lifetimeXP: bigint,
  thresholds: LevelThreshold[]
): LevelInfo {
  // Same pattern as vector level
}
```

**Deliverable:** Pure functions with unit tests

#### 2.3 — Implement Harmony Calculator
File: `src/lib/utils/harmony-calculator.ts`

**⚠️ WAIT:** Product must confirm normalization function before implementation.

```typescript
interface HarmonyInput {
  mindLevel: number;
  muscleLevel: number;
  moneyLevel: number;
}

export function calculateHarmony(input: HarmonyInput): number {
  // 1. Normalize Mind, Muscle, Money to 0-100 scale
  //    (PENDING PRODUCT CONFIRMATION on normalization)
  // 2. Calculate min_score and avg_score
  // 3. Apply: (min_score × 0.4) + (avg_score × 0.6)
  // 4. Clamp to 0-100
}
```

**Deliverable:** Placeholder with clear product decision point

#### 2.4 — Create XP Configuration Files
File: `config/xp-reward-rules.json`

```json
[
  {
    "rule_key": "habit_completion",
    "source_type": "habit",
    "vector": "mind",
    "base_xp": 20,
    "cap_scope": "per_occurrence",
    "cap_count": 1,
    "verification_level": "app_validated"
  },
  {
    "rule_key": "workout_session",
    "source_type": "workout",
    "vector": "muscle",
    "base_xp": 50,
    "cap_scope": "per_session",
    "cap_count": 1,
    "verification_level": "app_validated"
  }
  // ... other rules
]
```

File: `config/level-thresholds.json`

```json
{
  "character": [
    { "level": 1, "total_xp_required": 0 },
    { "level": 2, "total_xp_required": 1000 },
    { "level": 3, "total_xp_required": 2500 },
    // ... (PENDING PRODUCT CONFIRMATION on exact thresholds)
  ],
  "mind": [
    { "level": 1, "total_xp_required": 0 },
    { "level": 2, "total_xp_required": 1000 },
    // ... (possibly uniform 1000 per level, TBD)
  ],
  "muscle": [ /* same */ ],
  "money": [ /* same */ ]
}
```

**Deliverable:** JSON config files and loader functions

#### 2.5 — Implement Rank Definitions & Eligibility
File: `config/rank-requirements.json`

```json
[
  {
    "rank_code": "C",
    "name": "Warrior",
    "min_character_level": 20,
    "max_character_level": 29,
    "requirements": {
      "min_lifetime_xp": 10000,
      "min_vector_levels": {
        "mind": 15,
        "muscle": 15,
        "money": 15
      },
      "min_harmony": 50.0
    },
    "rewards": {
      "equipment_slots": 2,
      "titles": ["warrior_title"]
    }
  },
  {
    "rank_code": "B",
    "name": "Elite",
    "min_character_level": 30,
    "max_character_level": 44,
    "requirements": {
      "min_lifetime_xp": 65000,
      "min_vector_levels": {
        "mind": 25,
        "muscle": 25,
        "money": 25
      },
      "min_harmony": 60.0
    },
    "rewards": {
      "equipment_slots": 4,
      "titles": ["elite_title"]
    }
  }
  // ... (others PENDING PRODUCT CONFIRMATION)
]
```

File: `src/lib/services/rank-service.ts`

```typescript
export async function checkRankEligibility(
  userId: string
): Promise<RankEligibility> {
  // Load character progress, vector levels, harmony
  // Check all rank requirements
  // Return current rank and eligible next rank
}
```

**Deliverable:** Rank service with configurable requirements

#### 2.6 — Create Notification System (Minimal)
File: `src/lib/services/notifications.ts`

```typescript
export async function createNotification(
  userId: string,
  type: 'level_up' | 'rank_up' | 'badge_unlock',
  data: Record<string, any>
): Promise<void> {
  // Create notification_events record
  // Determine delivery channels (in-app, push, email)
  // Queue for delivery
}
```

**Deliverable:** Basic notification creation; delivery details deferred to Phase 5

### Testing
- [ ] Unit tests for level calculations with sample data
- [ ] Unit tests for harmony calculation (with mock normalization)
- [ ] Integration test: Award XP → check ledger → check cache update
- [ ] Integration test: Idempotency (award same event twice)
- [ ] Integration test: Level-up detection

**Deliverable:** `tests/unit/progression.test.ts` and `tests/integration/xp-award.test.ts`

---

## Phase 3: Achievements (Weeks 5-6)

### Goal
Implement badges, titles, and perks system.

### Tasks

#### 3.1 — Create Badge Definitions Table & Config
```sql
CREATE TABLE badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,  -- e.g., 'deep_work_monk', 'century_press'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  vector TEXT,  -- mind, muscle, money, or NULL for cross-vector
  tier TEXT,  -- Tier I, Tier II, etc.
  criteria_type TEXT NOT NULL,  -- count, duration, verification, custom
  criteria_config JSONB NOT NULL,  -- e.g., {"target": 100, "unit": "hours"}
  reward_xp INTEGER NOT NULL,
  reward_vector TEXT NOT NULL,  -- mind, muscle, money
  title_unlock_id UUID REFERENCES title_definitions(id),
  perk_unlock_id UUID REFERENCES perk_definitions(id),
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  badge_id UUID NOT NULL REFERENCES badge_definitions(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_event_id UUID REFERENCES progression_events(id),
  progress_snapshot JSONB,  -- e.g., {"progress": 82, "target": 100}
  
  UNIQUE(user_id, badge_id),
  INDEX idx_user_id (user_id)
);
```

**Deliverable:** Migration file

#### 3.2 — Implement Badge Evaluator
File: `src/lib/services/badge-service.ts`

```typescript
export async function evaluateBadgeEligibility(
  userId: string,
  eventType: string  // 'habit_completed', 'workout_session', etc.
): Promise<Badge[]> {
  // 1. Load all active badge definitions relevant to eventType
  // 2. For each badge:
  //    a. Load badge criteria_config
  //    b. Query relevant source records (habits, workouts, etc.)
  //    c. Check if criteria met
  //    d. If yes and not already unlocked, award badge
  // 3. Award badge XP through xp_ledger
  // 4. Create notification
  // 5. Unlock related title/perk if configured
}

export interface BadgeProgress {
  badge_id: string;
  code: string;
  progress: number;  // e.g., 82
  target: number;    // e.g., 100
  percentage: number;  // e.g., 82%
}

export async function getBadgeProgress(
  userId: string
): Promise<BadgeProgress[]> {
  // Return progress toward all locked badges
}
```

**Deliverable:** Badge service with evaluation logic

#### 3.3 — Create Title & Perk Tables
```sql
CREATE TABLE title_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unlock_criteria JSONB NOT NULL,  -- e.g., {"badge_id": "..."}
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title_id UUID NOT NULL REFERENCES title_definitions(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  equipped_at TIMESTAMPTZ,
  
  UNIQUE(user_id, title_id),
  INDEX idx_user_equipped (user_id, equipped_at)
);

CREATE TABLE perk_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  effect_type TEXT NOT NULL,  -- xp_boost, cooldown_reduction, etc.
  effect_config JSONB NOT NULL,  -- e.g., {"boost_percent": 10}
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE user_perks (
  user_id UUID PRIMARY KEY,
  perk_id UUID NOT NULL REFERENCES perk_definitions(id),
  active_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active_to TIMESTAMPTZ,
  
  FOREIGN KEY(user_id) REFERENCES auth.users(id)
);
```

**Deliverable:** Migration file

#### 3.4 — Implement Title & Perk Service
File: `src/lib/services/achievement-service.ts`

```typescript
export async function equipTitle(
  userId: string,
  titleId: string
): Promise<void> {
  // Verify user owns title
  // Update equipped_at timestamp
  // Create event log
}

export async function getActivePerkEffects(userId: string): Promise<Perk[]> {
  // Load active perks and their configurations
  // Used when calculating XP bonuses, cooldowns, etc.
}
```

**Deliverable:** Service for managing titles and perks

#### 3.5 — Seed Badge Catalog
File: `config/badge-definitions.json`

```json
[
  {
    "code": "deep_work_monk",
    "name": "Deep Work Monk",
    "vector": "mind",
    "tier": "Tier II",
    "criteria_type": "count",
    "criteria_config": {
      "event_type": "focus_session",
      "target": 100,
      "unit": "hours"
    },
    "reward_xp": 100,
    "reward_vector": "mind"
  },
  {
    "code": "century_press",
    "name": "Century Press",
    "vector": "muscle",
    "tier": "Tier II",
    "criteria_type": "pr_achievement",
    "criteria_config": {
      "exercise": "flat_barbell_bench_press",
      "threshold": 100,
      "unit": "kg"
    },
    "reward_xp": 150,
    "reward_vector": "muscle"
  },
  {
    "code": "consistent_striker",
    "name": "Consistent Striker",
    "vector": null,
    "tier": null,
    "criteria_type": "cross_vector",
    "criteria_config": {
      "consecutive_days": 14,
      "require_mind": true,
      "require_muscle": true,
      "require_money": true
    },
    "reward_xp": 100,
    "reward_vector": "mind"
  }
]
```

**Deliverable:** JSON config file

### Testing
- [ ] Unit tests for badge evaluation logic
- [ ] Integration test: Habit → badge unlock flow
- [ ] Integration test: Title equipping
- [ ] Integration test: Perk activation

**Deliverable:** `tests/integration/badges.test.ts`

---

## Phase 4: Domain Integrations (Weeks 7-10)

### Goal
Connect all major domains (habits, workouts, nutrition, missions, etc.) to progression system.

### 4.1 — Habits Domain (Week 7)

#### Database
```sql
CREATE TABLE habit_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  vector TEXT NOT NULL,  -- mind, muscle, money
  description TEXT,
  completion_type TEXT NOT NULL,  -- binary, numeric, duration, count
  target_value NUMERIC,
  target_unit TEXT,
  schedule_config JSONB NOT NULL,  -- e.g., {"type": "daily", "days": [0,1,2,3,4,5,6]}
  reward_rule_key TEXT REFERENCES xp_reward_rules(rule_key),
  status TEXT NOT NULL DEFAULT 'active',  -- active, paused, archived
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE habit_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habit_protocols(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scheduled_local_date DATE NOT NULL,
  target_snapshot JSONB NOT NULL,  -- Frozen snapshot of target at time of completion
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, skipped, missed
  completed_at TIMESTAMPTZ,
  logged_value NUMERIC,
  logged_unit TEXT,
  
  UNIQUE(habit_id, scheduled_local_date),
  INDEX idx_user_date (user_id, scheduled_local_date)
);

CREATE TABLE habit_streaks (
  habit_id UUID PRIMARY KEY REFERENCES habit_protocols(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_qualified_local_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Service
File: `src/lib/services/habits.ts`

```typescript
export async function completeHabitOccurrence(
  userId: string,
  habitId: string,
  loggedValue?: number,
  loggedUnit?: string
): Promise<{ success: boolean; xp: number }> {
  // 1. Load habit and validate user owns it
  // 2. Load today's occurrence
  // 3. Validate completion (numeric vs binary)
  // 4. Load reward rule
  // 5. Award XP (if criteria met)
  // 6. Update streak
  // 7. Create notification
  // 8. Trigger badge evaluation
}

export async function markHabitMissed(
  userId: string,
  habitId: string,
  localDate: string
): Promise<void> {
  // Mark occurrence as missed
  // Update current streak (pause or reset)
  // Do NOT subtract XP
  // Do NOT remove badges
}
```

#### API Routes
File: `src/app/api/habits/[habitId]/complete/route.ts`

```typescript
export async function POST(req: Request) {
  // 1. Validate auth
  // 2. Parse request body
  // 3. Call habits service
  // 4. Return result
}
```

**Deliverable:** Habit system with completion, streak, and non-punitive missed-day handling

### 4.2 — Nutrition Domain (Week 7)

#### Database
```sql
CREATE TABLE nutrition_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  local_date DATE NOT NULL,
  timezone TEXT NOT NULL,
  protein_target_snapshot NUMERIC NOT NULL,  -- Frozen target at start of day
  protein_total NUMERIC NOT NULL DEFAULT 0,
  protein_target_reached_at TIMESTAMPTZ,
  protein_reward_event_id UUID REFERENCES progression_events(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, local_date),
  INDEX idx_user_date (user_id, local_date)
);

CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nutrition_day_id UUID NOT NULL REFERENCES nutrition_days(id),
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  protein NUMERIC NOT NULL,
  calories NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  fiber NUMERIC,
  hydration_ml INTEGER,
  verification_source TEXT,  -- self_reported, database, integration
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Service
File: `src/lib/services/nutrition.ts`

```typescript
export async function logFoodEntry(
  userId: string,
  localDate: string,
  entry: FoodEntry
): Promise<{ success: boolean; proteinProgress: number; xpAwarded?: number }> {
  // 1. Load nutrition_day for localDate (create if doesn't exist)
  // 2. Insert food_entry
  // 3. Recalculate protein_total
  // 4. Check if protein_target_reached for first time (idempotent)
  // 5. If yes, award +40 Muscle XP
  // 6. Update nutrition_day
  // 7. Return progress
}
```

**Deliverable:** Nutrition tracking with once-per-24-hour protein reward

### 4.3 — Workout Domain (Week 8)

#### Database
```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  routine_id UUID,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',
  duration_seconds INTEGER,
  total_tonnage NUMERIC,
  xp_event_id UUID REFERENCES progression_events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id),
  exercise_id TEXT NOT NULL,  -- e.g., 'flat_barbell_bench_press'
  set_index INTEGER NOT NULL,
  load NUMERIC,
  load_unit TEXT,  -- kg, lbs
  reps INTEGER,
  rpe NUMERIC,  -- Rate of Perceived Exertion (1-10)
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_id TEXT NOT NULL,
  metric TEXT NOT NULL,  -- max_weight, max_reps, max_volume
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL,
  source_set_id UUID REFERENCES workout_sets(id),
  prior_record_id UUID REFERENCES personal_records(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_user_exercise (user_id, exercise_id)
);
```

#### Service
File: `src/lib/services/workouts.ts`

```typescript
export async function completeWorkoutSession(
  userId: string,
  sessionId: string
): Promise<{ success: boolean; xp: number; prCount: number }> {
  // 1. Load session and validate user owns it
  // 2. Validate at least 1 valid set exists
  // 3. Calculate total_tonnage from completed sets
  // 4. Award session completion XP
  // 5. Detect PRs (compare like-for-like)
  // 6. Award PR bonuses for each
  // 7. Update Hall of Fame
  // 8. Create notifications
  // 9. Trigger badge evaluation
  // 10. Return summary
}

export function calculateTonnage(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => {
    return total + (set.load * set.reps);
  }, 0);
}

export async function detectPR(
  userId: string,
  exercise: string,
  metric: string,
  value: number,
  unit: string
): Promise<{ isNewPR: boolean; priorValue?: number }> {
  // Find prior best for same exercise/metric/unit
  // Compare for like-for-like compatibility
  // Return if new PR
}
```

**Deliverable:** Workout completion with PR detection and anti-farming

### 4.4 — Focus & Reading Domain (Week 8)

#### Database
```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  planned_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  paused_duration_minutes INTEGER DEFAULT 0,
  focus_preset TEXT,  -- Pomodoro, Custom, etc.
  linked_task_id UUID,  -- Optional mission task
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  xp_event_id UUID REFERENCES progression_events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  resource_title TEXT NOT NULL,
  pages_read INTEGER NOT NULL,
  current_page INTEGER,
  total_pages INTEGER,
  session_date DATE NOT NULL,
  notes TEXT,
  xp_event_id UUID REFERENCES progression_events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Service
File: `src/lib/services/focus.ts`

```typescript
export async function completeFocusSession(
  userId: string,
  sessionId: string
): Promise<{ success: boolean; xp: number }> {
  // 1. Load session
  // 2. Validate completion (actual_duration >= threshold)
  // 3. Award focus XP
  // 4. Trigger badge evaluation
  // 5. Return result
}

export async function logReadingSession(
  userId: string,
  resourceTitle: string,
  pagesRead: number,
  notes?: string
): Promise<{ success: boolean; xp: number }> {
  // Award reading XP if pages >= target
}
```

**Deliverable:** Focus and reading tracking

### 4.5 — Money Domain (Week 9)

#### Database
```sql
CREATE TABLE money_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,  -- business_action, client_milestone, revenue_milestone
  title TEXT NOT NULL,
  description TEXT,
  verification_level TEXT NOT NULL,  -- self_reported, proof_uploaded, verified
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID,
  revenue_amount NUMERIC,
  linked_mission_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  xp_event_id UUID REFERENCES progression_events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Service
File: `src/lib/services/money.ts`

```typescript
export async function recordMoneyAction(
  userId: string,
  action: MoneyActionInput
): Promise<{ success: boolean; xp: number }> {
  // 1. Create money_action record
  // 2. Load reward rule based on action_type
  // 3. Check verification level matches requirement
  // 4. Award XP if verified
  // 5. Return result
}

export async function verifyMoneyAction(
  userId: string,
  actionId: string,
  verificationData: VerificationData
): Promise<{ success: boolean; xpAwarded: number }> {
  // For unverified actions waiting on proof
}
```

**Deliverable:** Money tracking with verification

### 4.6 — Quests Domain (Week 9)

#### Database
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID,
  title TEXT NOT NULL,
  vector TEXT NOT NULL,  -- mind, muscle, money
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  completion_criteria JSONB NOT NULL,
  reward_config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  progress_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMPTZ,
  
  UNIQUE(quest_id, user_id)
);
```

#### Service
File: `src/lib/services/quests.ts`

```typescript
export async function completeQuest(
  userId: string,
  questId: string
): Promise<{ success: boolean; xp: number }> {
  // 1. Load quest
  // 2. Validate completion criteria met
  // 3. Award quest XP
  // 4. Mark as completed
  // 5. Return result
}

export async function generateDailyQuests(userId: string): Promise<Quest[]> {
  // Load user's enabled habits and protocols
  // Create quests from templates
  // Return today's quest list
}
```

**Deliverable:** Quest system with daily generation

### 4.7 — Missions Domain (Weeks 9-10)

#### Database
```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  vector TEXT,
  description TEXT,
  definition_of_done TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',  -- active, at_risk, completed, archived
  health_status TEXT DEFAULT 'on_track',  -- on_track, at_risk
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mission_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id),
  plan_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'pending',
  
  UNIQUE(mission_id, plan_order)
);

CREATE TABLE mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES mission_plans(id),
  title TEXT NOT NULL,
  description TEXT,
  vector TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  priority TEXT,
  due_date TIMESTAMPTZ,
  reward_rule_key TEXT REFERENCES xp_reward_rules(rule_key),
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, in_progress, completed, verified
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mission_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES mission_tasks(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  work_description TEXT NOT NULL,
  time_spent_minutes INTEGER,
  evidence_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mission_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id),
  title TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  reward_rule_key TEXT REFERENCES xp_reward_rules(rule_key),
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Service
File: `src/lib/services/missions.ts`

```typescript
export async function completeTask(
  userId: string,
  taskId: string,
  workRecord: WorkRecord
): Promise<{ success: boolean; xpQueued: number; requiresVerification: boolean }> {
  // 1. Create work_record
  // 2. Mark task as completed
  // 3. Load reward rule (queued, not awarded yet)
  // 4. If system-verified: award immediately
  // 5. If manual-verified: mark as pending
  // 6. Update plan progress
  // 7. Return result
}

export function calculateMissionProgress(mission: Mission): number {
  // Weight-based progress calculation
  // sum(weight of completed/verified tasks) / sum(weight of all tasks)
}

export async function verifyMilestone(
  userId: string,
  milestoneId: string,
  verificationData: VerificationData
): Promise<{ success: boolean; xpAwarded: number; unlockedPlans: string[] }> {
  // 1. Mark milestone as verified
  // 2. Award milestone XP
  // 3. Unlock dependent plans
  // 4. Update mission progress
  // 5. Return result
}
```

**Deliverable:** Mission system with weighted progress and milestone verification

### Testing
- [ ] Integration test: Complete habit → XP → level-up flow
- [ ] Integration test: Protein target → XP (once per 24h)
- [ ] Integration test: Workout session → PR detection → XP bonus
- [ ] Integration test: Mission task completion → queued/verified XP
- [ ] Integration test: Anti-farming (caps and cooldowns)

**Deliverable:** `tests/integration/domains.test.ts`

---

## Phase 5: Read Models & Polish (Weeks 11-13)

### Goal
Build user-facing screens and analytics dashboards.

### Tasks

#### 5.1 — Dashboard Screen
File: `src/components/screens/DashboardScreen/index.tsx`

Display:
- Overall character level and progress
- Today's XP earned
- Daily quest list with progress
- Today's protocols by vector
- Active boss challenge
- Recent XP ledger entries

#### 5.2 — Character / Profile Screen
File: `src/components/screens/CharacterScreen/index.tsx`

Display:
- Character avatar and title
- Current rank and level
- Lifetime XP and lifetime per vector
- Three vector cards (level, tier progress, telemetry)
- Tri-vector harmony score
- Rank ladder with requirements
- Badge catalog and progress
- Title vault
- XP ledger view
- Privacy settings

#### 5.3 — Calendar Screen
File: `src/components/screens/CalendarScreen/index.tsx`

Display:
- Annual activity heatmap
- Daily summary (selected date)
- XP earned breakdown
- Commitment hits
- Activity intensity
- Reflections

#### 5.4 — Analytics Screen
File: `src/components/screens/AnalyticsScreen/index.tsx`

Display:
- Period filters (This Week, Last 30 Days, etc.)
- Total XP for period
- Vector distribution
- Harmony score
- Telemetry by vector
- Trends and charts

#### 5.5 — Notifications System (Full)
File: `src/app/api/notifications/deliver/route.ts`

Features:
- In-app notification center
- Browser push notifications
- Email digest (daily/weekly)
- Quiet hours deferral
- Privacy masking
- Read state tracking

**Deliverable:** Full notification system with delivery channels

### Testing
- [ ] Component tests for screen rendering
- [ ] Integration test: Award XP → notification → dashboard update
- [ ] E2E test: Complete daily quests → level-up flow

**Deliverable:** `tests/e2e/user-progression.test.ts`

---

## Phase 6: Validation & Launch (Weeks 14-15)

### Goal
Comprehensive testing, performance validation, and production readiness.

### Tasks

#### 6.1 — Acceptance Tests (Section 28 of logic.md)
- [ ] XP and vectors (8 tests)
- [ ] Vector levels (4 tests)
- [ ] Character level (4 tests)
- [ ] Harmony (4 tests)
- [ ] Ranks (4 tests)
- [ ] Badges and titles (6 tests)
- [ ] Habits and streaks (6 tests)
- [ ] Nutrition (4 tests)
- [ ] Workout (4 tests)
- [ ] Quests and missions (6 tests)
- [ ] Privacy and notifications (3 tests)

**Total: 54 acceptance tests**

#### 6.2 — Progression Simulation
- [ ] 7-day simulation: Check daily quest completion → XP → progression
- [ ] 30-day simulation: Check vector balance and harmony
- [ ] 90-day simulation: Check level-up frequency and rank gates
- [ ] 365-day simulation: Check long-term balance

#### 6.3 — Anti-Farming Tests
- [ ] Duplicate event key awards XP only once
- [ ] Caps prevent excess rewards without blocking activity
- [ ] Cooldowns space out awards correctly
- [ ] Protein target rewards exactly once per 24h
- [ ] PR bonus not awarded on re-entry

#### 6.4 — Timezone & Offline Tests
- [ ] Timezone change doesn't rewrite historical dates
- [ ] Daily boundary consistent across domains
- [ ] Offline actions sync correctly on reconnect
- [ ] Retried requests return original result

#### 6.5 — Performance Validation
- [ ] XP award completes in <100ms
- [ ] Level recalculation completes in <50ms
- [ ] Harmony recalculation completes in <50ms
- [ ] Dashboard loads in <1s
- [ ] Ledger query paginated for large datasets

#### 6.6 — Data Integrity Validation
- [ ] Rebuild vector XP from ledger matches cache
- [ ] Rebuild character XP from vector XP matches cache
- [ ] No orphaned ledger entries
- [ ] All progression events have matching ledger entries
- [ ] No XP ledger duplicates

#### 6.7 — Security Validation
- [ ] RLS policies prevent cross-user data access
- [ ] Clients cannot directly insert XP ledger
- [ ] Clients cannot update cached totals
- [ ] Event idempotency keys work correctly
- [ ] Admin functions use service role (never exposed)

**Deliverable:** Comprehensive test suite with CI/CD integration

---

## Critical Product Decisions Needed

Before moving to production, confirm:

1. **XP Curves** — Exact thresholds for all levels
2. **Harmony Normalization** — Conversion formula to 0–100 scale
3. **Rank Requirements** — Complete definition for all 8 ranks
4. **Reward Table** — Final values for all action types
5. **Nutrition Cycle** — Local calendar day or rolling 24h
6. **Streak Behavior** — Pause, break, or grace period
7. **Boss HP Formula** — Damage calculation and missed-day handling
8. **Mission Verification** — Which tasks require manual vs. system verification
9. **Perk Effects** — Actual gameplay effects (not just names)
10. **Guild/Social** — Whether leaderboards are in v1

---

## Success Criteria

### Launch Readiness
- ✅ All 6 phases complete
- ✅ 54+ acceptance tests passing
- ✅ Progression simulation showing balanced growth
- ✅ No XP farming exploits found
- ✅ <100ms XP award latency
- ✅ Zero data integrity issues
- ✅ All RLS policies verified
- ✅ User documentation complete

### Post-Launch Monitoring
- Monitor XP distribution for fairness
- Track rank promotion rates
- Monitor habit adherence rates
- Watch for data anomalies
- Collect user feedback on rewards
- Track notification delivery success

---

## Summary

```
Phase 1: Data Foundation
  ↓
Phase 2: Core Progression (XP, levels, ranks, harmony)
  ↓
Phase 3: Achievements (badges, titles, perks)
  ↓
Phase 4: Domain Integrations (habits, workouts, missions, etc.)
  ↓
Phase 5: Read Models (dashboards, analytics, notifications)
  ↓
Phase 6: Validation (testing, performance, security, launch)
```

Each phase builds on the previous one. Do not skip phases or shortcuts will compound.

**Estimated timeline:** 15 weeks for full implementation with 1 developer or 8 weeks with 2 developers.

---

**Ready to start? Begin with Phase 1, Task 1.1 — Inspect Existing Schema.**
