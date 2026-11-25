# M3 Triad Progression System - Implementation Guide

## Overview

This document outlines the complete progression logic implementation based on `logic.md`. The system has been designed to be modular, testable, and closely follows the M3 Triad design specifications.

## Architecture

### Core Modules

#### 1. **Progression Configuration** (`src/lib/progression/config.ts`)
Defines all configurable parameters for the progression system:

- **Vector Level Thresholds**: Progressive XP curve for each vector (Mind, Muscle, Money)
- **Character Level Thresholds**: Cumulative XP requirements for overall character progression
- **Rank Definitions**: 8 ranks (E-SSS) with specific requirements for promotion
- **XP Reward Rules**: 20+ configurable reward patterns for different activities
- **Harmony Configuration**: Settings for tri-vector equilibrium calculations
- **Badge Definitions**: 6 example badges with criteria and rewards
- **Helper Functions**: Utility functions for level calculations

#### 2. **Progression Calculator** (`src/lib/progression/calculator.ts`)
Pure calculation functions that derive all progression values:

- `calculateVectorLevel()`: Determines level for a given vector XP
- `calculateCharacterLevel()`: Determines overall character level
- `normalizeVectorScore()`: Converts vector levels to 0-100 scale
- `calculateHarmony()`: Computes tri-vector harmony score
- `calculateProgressionSnapshot()`: Complete character state calculation
- `determineRank()`: Current rank based on all progression metrics
- `getEligibleRanks()`: All ranks the user qualifies for
- `calculateRankProgress()`: Shows what's needed for the next rank

#### 3. **Data Service** (`src/lib/progression/data.ts`)
Fetches data from Supabase and integrates with the calculator:

- `getUserProgressionData()`: Fetches all progression data and returns calculated snapshot
- `getRecentXpActivities()`: Retrieves XP ledger entries
- `getTodayXpTotal()`: Summarizes today's earned XP by vector
- `getTodayHabitCompletions()`: Lists completed habits
- `getRecentFocusSessions()`: Recent focus session data
- `getRecentWorkoutSessions()`: Recent workout data
- `getTodayNutritionSummary()`: Daily nutrition metrics

#### 4. **React Hook** (`src/hooks/useProgression.ts`)
Custom hook for using progression data in components:

```typescript
const { snapshot, todayXp, loading, error, refetch } = useProgression(userId);
```

## Implementation Status

### ✅ Completed

1. **Core Progression Logic**
   - Vector level calculations with progressive curve
   - Character level calculation from lifetime XP
   - Harmony/equilibrium scoring (40% min + 60% average)
   - Rank eligibility checking with multi-condition requirements

2. **XP Configuration**
   - 20+ reward rules defined for different activities
   - Configurable caps and cooldowns per rule
   - Verification levels (self-reported, app-validated, integration-verified)

3. **Rank System**
   - 8-rank ladder (E=Novice → SSS=Mythic)
   - Requirements include character level, lifetime XP, vector levels, and harmony
   - Rank eligibility calculator

4. **Badge Framework**
   - 6 example badges with criteria
   - Tier system (I, II, III)
   - Cross-vector badges supported (e.g., Consistent Striker)

5. **Dashboard Integration**
   - Character status display (level, rank, harmony)
   - Tri-vector progress cards with real XP data
   - Lifetime XP summary
   - Today's earned XP breakdown

### 🔄 In Progress / Needs Backend Integration

1. **XP Ledger Processing**
   - Backend function to award XP and update vector progress
   - Idempotency handling (event_key uniqueness)
   - Duplicate detection

2. **Badge Evaluation**
   - Trigger badge criteria checks when relevant events occur
   - Award badge XP and unlock titles

3. **Mission & Task XP**
   - Link mission completion to XP rewards
   - Verification workflow for high-value tasks

4. **Habit Streaks**
   - Track current streak vs. best streak
   - Cross-vector consistency calculation for 14-day badges

5. **Real-time Updates**
   - WebSocket or polling for live XP notifications
   - Level-up and rank-up celebrations

## Configuration Examples

### Adding a New XP Rule

Edit `src/lib/progression/config.ts` and add to `XP_REWARD_RULES`:

```typescript
'my_vector:my_action': {
  key: 'my_vector:my_action',
  sourceType: 'my_source',
  vector: 'mind',  // or 'muscle' or 'money'
  baseXp: 50,
  capScope: 'per_day',
  capCount: 1,
  verificationLevel: 'app_validated',
}
```

### Adjusting Level Curves

Edit `VECTOR_LEVEL_THRESHOLDS` for individual vectors or `CHARACTER_LEVEL_THRESHOLDS` for overall progression. The system uses a progressive scaling curve:

- Level 1-5: Smaller increments (500-3,200 cumulative XP)
- Level 6-10: Medium increments (4,500-11,700 cumulative XP)
- Level 11-30: Larger increments (14,000-95,700 cumulative XP)

### Modifying Rank Requirements

Each rank has configurable requirements:

```typescript
B: {
  code: 'B',
  name: 'Elite',
  minCharacterLevel: 30,
  maxCharacterLevel: 44,
  minLifetimeXp: 65_000,
  minVectorLevels: { mind: 25, muscle: 25, money: 25 },
  minHarmonyScore: 75,
}
```

## Database Integration

### Required Tables

The system relies on these tables in Supabase:

1. **vector_progress**
   - Columns: `user_id`, `vector`, `xp`, `level`
   - Tracks XP for each vector

2. **xp_ledger**
   - Columns: `user_id`, `vector`, `source_type`, `amount`, `created_at`
   - Immutable record of all XP awards

3. **Other supporting tables** (habits, workouts, meals, focus_sessions, etc.)
   - Used by data service to fetch activity data

### Key SQL Queries

**Get user's total XP:**
```sql
SELECT vector, SUM(amount) as total_xp 
FROM xp_ledger 
WHERE user_id = $1 
GROUP BY vector;
```

**Get today's XP earned:**
```sql
SELECT vector, SUM(amount) as today_xp 
FROM xp_ledger 
WHERE user_id = $1 
  AND created_at::date = CURRENT_DATE
GROUP BY vector;
```

## Usage Examples

### Basic Dashboard Implementation

```typescript
import { useProgression } from '@/hooks/useProgression';

export function Dashboard() {
  const { snapshot, todayXp, loading } = useProgression(userId);

  if (loading) return <Skeleton />;
  if (!snapshot) return <div>No data</div>;

  return (
    <>
      <h1>Level {snapshot.characterLevel}</h1>
      <p>{snapshot.currentRank.name}</p>
      <ProgressBar value={snapshot.characterTierProgress} />
      <div>Mind: {snapshot.vectorLevels.mind.level}</div>
      <div>Muscle: {snapshot.vectorLevels.muscle.level}</div>
      <div>Money: {snapshot.vectorLevels.money.level}</div>
      <div>Harmony: {snapshot.harmonyScore}%</div>
    </>
  );
}
```

### Manual Calculation

```typescript
import { calculateProgressionSnapshot } from '@/lib/progression';

// Calculate from raw XP values
const snapshot = calculateProgressionSnapshot(
  5000,  // mind_xp
  3500,  // muscle_xp
  4200   // money_xp
);

console.log(snapshot.characterLevel);        // 7
console.log(snapshot.vectorLevels.mind.level); // 11
console.log(snapshot.harmonyScore);            // 78
```

### Checking Rank Eligibility

```typescript
import { calculateRankProgress } from '@/lib/progression';

const progress = calculateRankProgress(
  characterLevel,
  lifetimeXp,
  mindLevel,
  muscleLevel,
  moneyLevel,
  harmonyScore
);

console.log(progress.currentRank.name);     // "Warrior"
console.log(progress.nextRank?.name);       // "Elite"
console.log(progress.unmetRequirements);    // ["Harmony: 70/75", ...]
```

## Formula Reference

### Harmony Calculation

```
harmony_score = (min_score × 0.4) + (avg_score × 0.6)
```

Where scores are normalized to 0-100 based on vector levels (capped at level 30).

### Vector Level Calculation

```
level = highest level whose cumulative_xp_threshold ≤ total_xp
tier_xp = total_xp - threshold_for_current_level
tier_progress = (tier_xp / tier_required) × 100
```

## Testing

### Unit Test Examples

```typescript
import { calculateVectorLevel, calculateHarmony } from '@/lib/progression';

describe('Progression Calculator', () => {
  it('should calculate correct vector level', () => {
    const result = calculateVectorLevel(5000);
    expect(result.level).toBe(11);
    expect(result.tierXp).toBe(1000);
  });

  it('should calculate harmony correctly', () => {
    const harmony = calculateHarmony(80, 70, 90);
    expect(harmony).toBe(79); // (70*0.4) + (80*0.6) ≈ 79
  });
});
```

## Next Steps / TODO

1. **Backend XP Award Function**
   - Create Supabase Edge Function to safely award XP
   - Implement idempotency with event_key
   - Handle caps and cooldowns

2. **Badge Evaluation System**
   - Subscribe to XP events
   - Check criteria against user data
   - Award XP and unlock titles

3. **Rank Promotion System**
   - Show promotion notifications
   - Display reward details (equipment slots, titles, perks)
   - Handle rank-specific effects

4. **Streak Tracking**
   - Maintain current streak separately from XP
   - Calculate 14-day consistency for cross-vector badges
   - Handle grace periods and breaks

5. **Analytics & Reporting**
   - Period-based XP summaries
   - Progression velocity tracking
   - Projected level-up dates

6. **Performance Optimizations**
   - Cache progression snapshots with TTL
   - Materialize daily XP summaries
   - Use database views for complex queries

## References

- **Logic Specification**: `/logic.md`
- **Database Schema**: `/migrations/001_create_m3_triad_schema.sql`
- **Component Integration**: `/src/app/dashboard/page.tsx`
- **Configuration**: `/src/lib/progression/config.ts`

## Support

For questions about the progression logic, refer to `logic.md` section 3-30 for complete specifications, edge cases, and acceptance tests.
