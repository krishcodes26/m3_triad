# M3 Triad — Developer Quick Reference

**Cheat sheet for common tasks and lookups.**

---

## System at a Glance

```
User Action (Habit, Workout, etc.)
         ↓
   Backend validates
         ↓
   Award XP to vector
         ↓
   Update vector level (if threshold crossed)
         ↓
   Update character level (if threshold crossed)
         ↓
   Update harmony score
         ↓
   Check rank eligibility
         ↓
   Evaluate badges
         ↓
   Send notifications
         ↓
   Update Dashboard/Profile cache
```

---

## Three Vectors

| Vector | Focus | Examples | Telemetry |
|--------|-------|----------|-----------|
| **Mind** | Learning, focus, cognitive work | Reading pages, focus blocks, study sessions | Reading velocity, focus hours, completion % |
| **Muscle** | Training, nutrition, recovery | Workouts, protein targets, sleep, hydration | Tonnage, hard sets, PRs, body metrics |
| **Money** | Business, revenue, sovereignty | Business actions, client delivery, revenue | Active tracks, MRR, revenue milestones |

Each vector has: `lifetime_xp`, `level`, `tier_xp`, `tier_xp_required`

---

## Core Formulas

### XP Award (Server-Side Only)
```
Check progression_events.unique(user_id, event_key) → prevent duplicates
Load reward rule by rule_key
Validate event meets all 9 eligibility criteria (see logic.md 4.4)
Create progression_event record
Create xp_ledger entry
Update vector_progress cache
Check for level-up
Return { success, xp, leveledUp }
```

### Vector Level
```
Input: vector_lifetime_xp (from summing xp_ledger)
Lookup: level_thresholds table for vector

vector_level = highest level whose threshold ≤ vector_lifetime_xp
tier_xp = vector_lifetime_xp - threshold[vector_level]
tier_xp_required = threshold[vector_level + 1] - threshold[vector_level]
tier_progress = tier_xp / tier_xp_required
```

### Character Level
```
Input: lifetime_xp (sum of all vector XP)
Lookup: level_thresholds table for scope='character'

character_level = highest level whose threshold ≤ lifetime_xp
(Same tier calculation as vector level)
```

### Harmony Score ⚠️ PENDING CONFIRMATION
```
1. Normalize Mind, Muscle, Money to 0–100 (product must define)
2. min_score = lowest of three
3. avg_score = average of three
4. harmony = (min_score × 0.4) + (avg_score × 0.6)
5. Clamp to 0–100%
```

---

## Database Tables (Phase 1)

### progression_events
Immutable record of all activities.
```sql
id, user_id, event_key (unique!), source_type, source_id,
occurred_at, local_date, timezone, verification_level, metadata, created_at
```

### xp_ledger
Append-only XP record.
```sql
id, user_id, event_id, vector, xp_delta, reward_key, reason_code,
description, rule_version, correction_of_id (if reversal), created_at
```

### vector_progress (Cache)
Rebuildable from xp_ledger.
```sql
user_id, vector, lifetime_xp, vector_level, tier_xp, tier_xp_required, updated_at
```

### character_progress (Cache)
Rebuildable from vector_progress.
```sql
user_id, lifetime_xp, character_level, rank_id, harmony_score, current_streak, updated_at
```

### xp_reward_rules
Configuration (not hardcoded).
```sql
rule_key, source_type, vector, base_xp, cap_scope, cap_count,
cooldown_seconds, eligibility_config, verification_level, active_from, active_to
```

### level_thresholds
XP curves (configurable).
```sql
scope (character/mind/muscle/money), level, total_xp_required
```

---

## Common Code Snippets

### Award XP
```typescript
import { awardXP } from '@/lib/services/progression';

const result = await awardXP(
  userId,
  'habit_completion:12345',  // event_key (must be unique)
  'habit',                     // source_type
  habitCompletionId,           // source_id
  'mind'                       // vector: 'mind' | 'muscle' | 'money'
);

if (result.success) {
  console.log(`Awarded ${result.xp} XP, leveled up: ${result.leveledUp}`);
}
```

### Calculate Vector Level
```typescript
import { calculateVectorLevel } from '@/lib/utils/level-calculator';
import { LEVEL_THRESHOLDS } from '@/lib/constants/level-thresholds';

const level = calculateVectorLevel(
  vectorXP,  // bigint
  LEVEL_THRESHOLDS.mind  // LevelThreshold[]
);

console.log(`Mind Level ${level.level}: ${level.tierXP} / ${level.tierXPRequired}`);
```

### Check Rank Eligibility
```typescript
import { checkRankEligibility } from '@/lib/services/rank-service';

const eligibility = await checkRankEligibility(userId);
console.log(`Current rank: ${eligibility.currentRank}`);
console.log(`Next rank: ${eligibility.nextRank}`);
console.log(`Unmet requirements: ${eligibility.unmetRequirements}`);
```

### Create Notification
```typescript
import { createNotification } from '@/lib/services/notifications';

await createNotification(userId, 'level_up', {
  vector: 'mind',
  newLevel: 26,
  xpGained: 1500
});
```

---

## Anti-Farming Checks

### Before Awarding XP
```typescript
// 1. Idempotency: Same event key?
const existing = await db.xp_ledger
  .where({ event_id: eventId, reward_key: rewardKey })
  .first();
if (existing) return existing;  // Duplicate → return original

// 2. Cap check: Already awarded today?
const dailyCount = await db.xp_ledger
  .where({ user_id, reward_key, created_at: { gte: startOfDay } })
  .count();
if (dailyCount >= rule.cap_count) return { success: false, reason: 'cap_reached' };

// 3. Cooldown check: Min time passed?
const lastAward = await db.xp_ledger
  .where({ user_id, reward_key })
  .order('created_at desc')
  .first();
const timeSinceLastAward = Date.now() - lastAward.created_at;
if (timeSinceLastAward < rule.cooldown_seconds * 1000) {
  return { success: false, reason: 'cooldown_active' };
}

// If all checks pass → award XP
```

---

## Idempotency Pattern

**Always use stable event keys:**

```
habit_completion:{completion_id}
nutrition_protein_target:{user_id}:{local_date}
workout_completion:{session_id}
workout_pr:{exercise_id}:{pr_record_id}
mission_task:{task_id}:completed
mission_milestone:{milestone_id}:verified
focus_session:{session_id}:completed
quest_completion:{quest_id}
boss_defeated:{boss_id}:day_{day_number}
```

**Unique constraint: `(event_id, reward_key)`**

Same event key + same reward key = retry returns original result, never duplicate award.

---

## Habit Logic

### Complete a Habit
```typescript
// Check if completed today
const occurrence = await db.habit_occurrences
  .where({
    habit_id: habitId,
    scheduled_local_date: today,
    user_id: userId
  })
  .first();

// For numeric: validate logged_value >= target
if (habit.completion_type === 'numeric') {
  if (loggedValue < occurrence.target_snapshot.value) {
    return { success: false, reason: 'threshold_not_met' };
  }
}

// Award XP (once per occurrence)
await awardXP(
  userId,
  `habit_completion:${occurrence.id}`,
  'habit',
  occurrence.id,
  habit.vector
);

// Update streak
await updateHabitStreak(habitId, userId, today);
```

### Update Streak
```typescript
// Current streak: consecutive qualifying days
// Best streak: all-time high (never reset)
// Missed day: 0 XP, streak pauses/resets (TBD)

const streak = await db.habit_streaks.where({ habit_id }).first();

if (qualifiedToday) {
  streak.current_streak += 1;
  if (streak.current_streak > streak.best_streak) {
    streak.best_streak = streak.current_streak;  // Update all-time high
  }
  streak.last_qualified_local_date = today;
} else if (yesterday_was_scheduled && no_completion_today) {
  // TBD: Pause or reset current_streak?
  // Best streak NEVER reset
}
```

---

## Workout Logic

### Complete a Session
```typescript
// 1. Validate session and sets
const session = await db.workout_sessions.where({ id: sessionId }).first();
const sets = await db.workout_sets.where({ session_id: sessionId }).toArray();

if (!sets.length || !sets.some(s => s.status === 'completed')) {
  return { success: false, reason: 'no_valid_sets' };
}

// 2. Calculate tonnage
const tonnage = sets.reduce((sum, set) => sum + (set.load * set.reps), 0);

// 3. Award session XP
await awardXP(userId, `workout_completion:${sessionId}`, 'workout', sessionId, 'muscle');

// 4. Detect PRs
for (const set of sets) {
  if (set.status === 'completed') {
    const isNewPR = await detectPR(userId, set.exercise_id, set.load, set.load_unit);
    if (isNewPR) {
      await awardXP(userId, `workout_pr:${set.exercise_id}:${set.id}`, 'workout', set.id, 'muscle');
    }
  }
}

// 5. Update session
await db.workout_sessions.update({ id: sessionId }, {
  completed_at: now,
  status: 'completed',
  total_tonnage: tonnage
});
```

### Detect PR
```typescript
async function detectPR(userId, exerciseId, load, unit) {
  // Find prior best for this exercise
  const priorBest = await db.personal_records
    .where({ user_id: userId, exercise_id: exerciseId })
    .order('value desc')
    .first();
  
  if (!priorBest || load > priorBest.value) {
    // New PR! Create record and return true
    await db.personal_records.insert({
      user_id: userId,
      exercise_id: exerciseId,
      value: load,
      unit: unit,
      achieved_at: now,
      prior_record_id: priorBest?.id
    });
    return true;
  }
  
  return false;
}
```

---

## Nutrition Logic

### Log Food & Check Protein Target
```typescript
async function logFoodEntry(userId, localDate, entry) {
  // 1. Create nutrition_day if doesn't exist
  let nutritionDay = await db.nutrition_days
    .where({ user_id: userId, local_date: localDate })
    .first();
  
  if (!nutritionDay) {
    const userTz = (await db.profiles.where({ id: userId }).first()).timezone;
    const target = await getUserProteinTarget(userId); // User-configured
    
    nutritionDay = await db.nutrition_days.insert({
      user_id: userId,
      local_date: localDate,
      timezone: userTz,
      protein_target_snapshot: target  // FROZEN at start of day
    });
  }
  
  // 2. Log food entry
  await db.food_entries.insert({
    nutrition_day_id: nutritionDay.id,
    ...entry
  });
  
  // 3. Recalculate protein total
  const totalProtein = await db.food_entries
    .where({ nutrition_day_id: nutritionDay.id })
    .sum('protein');
  
  nutritionDay.protein_total = totalProtein;
  
  // 4. Check if target reached for FIRST TIME
  if (!nutritionDay.protein_target_reached_at &&
      totalProtein >= nutritionDay.protein_target_snapshot) {
    
    // Award +40 Muscle XP (once per 24-hour cycle)
    const result = await awardXP(
      userId,
      `nutrition_protein_target:${userId}:${localDate}`,  // Unique key
      'nutrition',
      nutritionDay.id,
      'muscle'
    );
    
    if (result.success) {
      nutritionDay.protein_target_reached_at = now;
      nutritionDay.protein_reward_event_id = result.event_id;
    }
  }
  
  await db.nutrition_days.update({ id: nutritionDay.id }, nutritionDay);
  return nutritionDay;
}
```

---

## Badge Evaluation

### On Any XP Award
```typescript
async function evaluateBadges(userId, eventType) {
  const badges = await db.badge_definitions
    .where({ is_active: true })
    .toArray();
  
  for (const badge of badges) {
    // Skip if user already has this badge
    const owned = await db.user_badges
      .where({ user_id: userId, badge_id: badge.id })
      .first();
    if (owned) continue;
    
    // Check if criteria met
    const isMet = await checkBadgeCriteria(userId, badge);
    
    if (isMet) {
      // Award badge
      await db.user_badges.insert({
        user_id: userId,
        badge_id: badge.id,
        unlocked_at: now,
        progress_snapshot: { /* current progress */ }
      });
      
      // Award badge XP
      await awardXP(
        userId,
        `badge_unlock:${badge.code}`,
        'badge',
        badge.id,
        badge.reward_vector
      );
      
      // Unlock title/perk if configured
      if (badge.title_unlock_id) {
        await db.user_titles.insert({
          user_id: userId,
          title_id: badge.title_unlock_id,
          unlocked_at: now
        });
      }
      
      // Send notification
      await createNotification(userId, 'badge_unlock', {
        badge_id: badge.id,
        badge_name: badge.name,
        xp: badge.reward_xp
      });
    }
  }
}
```

---

## Rank Promotion

### Check Eligibility
```typescript
async function checkRankEligibility(userId) {
  const progress = await db.character_progress.where({ user_id: userId }).first();
  const vectors = await db.vector_progress.where({ user_id: userId }).toArray();
  
  const ranks = await db.rank_definitions.order('sort_order').toArray();
  let currentRank = null;
  let nextRank = null;
  
  for (const rank of ranks) {
    const met = await checkRankRequirements(userId, rank, progress, vectors);
    
    if (met) {
      currentRank = rank;
    } else if (!nextRank) {
      nextRank = rank;  // First unmet rank
    }
  }
  
  if (currentRank && nextRank) {
    return {
      currentRank: currentRank.code,
      nextRank: nextRank.code,
      requirements: nextRank.requirements,
      unmetRequirements: getMissingRequirements(progress, vectors, nextRank)
    };
  }
}

async function checkRankRequirements(userId, rank, progress, vectors) {
  const req = rank.requirements;
  
  // Check character level
  if (progress.character_level < req.min_character_level) return false;
  
  // Check lifetime XP
  if (progress.lifetime_xp < req.min_lifetime_xp) return false;
  
  // Check each vector level (stability requirement)
  for (const [vector, minLevel] of Object.entries(req.min_vector_levels)) {
    const v = vectors.find(v => v.vector === vector);
    if (!v || v.vector_level < minLevel) return false;
  }
  
  // Check harmony
  if (progress.harmony_score < req.min_harmony) return false;
  
  // Check any required badges
  if (req.required_badges?.length) {
    for (const badgeId of req.required_badges) {
      const owned = await db.user_badges
        .where({ user_id: userId, badge_id: badgeId })
        .first();
      if (!owned) return false;
    }
  }
  
  return true;
}
```

---

## Common Error Patterns

### ❌ WRONG: Trusting client XP value
```typescript
// NO! Never do this:
const xp = req.body.xp;  // Client says they should get 100 XP
await updateXP(userId, xp);  // ❌ Security risk!
```

### ✅ RIGHT: Validating and calculating server-side
```typescript
// YES! Do this:
const workoutId = req.body.workout_id;
const workout = await db.workouts.where({ id: workoutId, user_id: userId }).first();
if (!workout) throw new Error('Workout not found');

const rule = await db.xp_reward_rules.where({ rule_key: 'workout_session' }).first();
const xp = rule.base_xp;  // Server decides XP, never client

await awardXP(userId, `workout_completion:${workoutId}`, 'workout', workoutId, 'muscle');
```

### ❌ WRONG: Modifying ledger entries
```typescript
// NO! Never edit ledger:
await db.xp_ledger.update({ id: entryId }, { xp_delta: 50 });  // ❌
```

### ✅ RIGHT: Creating correction entries
```typescript
// YES! Append-only corrections:
const original = await db.xp_ledger.where({ id: entryId }).first();

await db.xp_ledger.insert({
  user_id: original.user_id,
  event_id: original.event_id,
  vector: original.vector,
  xp_delta: -original.xp_delta,  // Reverse original
  reward_key: original.reward_key,
  reason_code: 'correction',
  description: 'Reversed due to invalid data',
  correction_of_id: original.id  // Link to original
});
```

### ❌ WRONG: Deleting progression events
```typescript
// NO! Never delete:
await db.progression_events.delete({ id: eventId });  // ❌
```

### ✅ RIGHT: Creating audit trail
```typescript
// YES! Immutable audit trail:
const event = await db.progression_events.where({ id: eventId }).first();
// Keep record as-is
// If invalid, create correction ledger entries
// Investigation shows what happened and why
```

---

## Configuration Values

### Reward Rules
```json
{
  "rule_key": "habit_completion",
  "source_type": "habit",
  "vector": "mind",
  "base_xp": 20,
  "cap_scope": "per_occurrence",
  "cap_count": 1,
  "verification_level": "app_validated"
}
```

### Level Thresholds (Uniform Example)
```json
{
  "scope": "mind",
  "level": 1,
  "total_xp_required": 0
},
{
  "scope": "mind",
  "level": 2,
  "total_xp_required": 1000
}
```

### Rank Requirements (Example)
```json
{
  "rank_code": "B",
  "name": "Elite",
  "min_character_level": 30,
  "requirements": {
    "min_lifetime_xp": 65000,
    "min_vector_levels": {
      "mind": 25,
      "muscle": 25,
      "money": 25
    },
    "min_harmony": 60.0
  }
}
```

---

## Testing Checklist

### For Any XP Award
- [ ] Idempotency: Award same event twice → only 1 XP
- [ ] Caps: Try to exceed cap → 0 XP on excess
- [ ] Cooldown: Try before cooldown expires → 0 XP
- [ ] Wrong vector: Award to wrong vector → validation error
- [ ] Ownership: Try to award to another user → validation error
- [ ] Ledger audit: Check XP ledger has correct entry
- [ ] Cache update: Check vector_progress and character_progress updated

### For Any Level-Up
- [ ] Level increments correctly
- [ ] Previous level not affected
- [ ] Tier XP resets to 0
- [ ] Other vectors unaffected
- [ ] Notification sent
- [ ] Dashboard updates

### For Any Badge
- [ ] Unlocks only once per user
- [ ] Progress tracks correctly
- [ ] XP awarded to correct vector
- [ ] Title unlocked if configured
- [ ] Notification sent

---

## SQL Queries

### Rebuild Vector XP from Ledger
```sql
SELECT user_id, vector, SUM(xp_delta) as lifetime_xp
FROM xp_ledger
GROUP BY user_id, vector;
```

### Rebuild Character XP
```sql
SELECT user_id, SUM(xp_delta) as lifetime_xp
FROM xp_ledger
GROUP BY user_id;
```

### Find Duplicate Event Keys
```sql
SELECT user_id, event_key, COUNT(*) as count
FROM progression_events
GROUP BY user_id, event_key
HAVING COUNT(*) > 1;
```

### Check Ledger Integrity
```sql
SELECT l.id, l.event_id
FROM xp_ledger l
LEFT JOIN progression_events e ON l.event_id = e.id
WHERE e.id IS NULL;  -- Orphaned ledger entry
```

### Get User's Badge Progress
```sql
SELECT
  bd.code, bd.name, bd.tier,
  CASE WHEN ub.id IS NOT NULL THEN 'Unlocked' ELSE 'Locked' END as status,
  ub.unlocked_at
FROM badge_definitions bd
LEFT JOIN user_badges ub ON bd.id = ub.badge_id AND ub.user_id = $1
WHERE bd.is_active = true
ORDER BY bd.vector, bd.tier;
```

---

## Debugging Tips

### "User gained XP but I don't see it in ledger"
1. Check progression_events table: `SELECT * FROM progression_events WHERE user_id = $1 AND event_key = $2;`
2. Check xp_ledger: `SELECT * FROM xp_ledger WHERE event_id = $1;`
3. Check vector_progress cache: `SELECT * FROM vector_progress WHERE user_id = $1;`

### "Duplicate XP awarded"
1. Check for duplicate event_keys: `SELECT event_key, COUNT(*) FROM progression_events WHERE user_id = $1 GROUP BY event_key HAVING COUNT(*) > 1;`
2. Check xp_ledger unique constraint: `SELECT event_id, reward_key, COUNT(*) FROM xp_ledger WHERE user_id = $1 GROUP BY event_id, reward_key HAVING COUNT(*) > 1;`

### "User's level is wrong"
1. Recalculate from ledger: `SELECT vector, SUM(xp_delta) FROM xp_ledger WHERE user_id = $1 GROUP BY vector;`
2. Compare to vector_progress cache
3. If different: cache is stale, trigger rebuild

### "Harmony score seems wrong"
⚠️ **Can't debug until normalization formula confirmed by product**

---

## Common Configurations

### Super Generous (Testing)
```json
{
  "rule_key": "habit_completion",
  "base_xp": 100,
  "cap_scope": "none",
  "cooldown_seconds": 0
}
```

### Moderate (Default)
```json
{
  "rule_key": "habit_completion",
  "base_xp": 20,
  "cap_scope": "per_occurrence",
  "cap_count": 1,
  "cooldown_seconds": 0
}
```

### Strict (Prevent Farming)
```json
{
  "rule_key": "workout_session",
  "base_xp": 50,
  "cap_scope": "per_day",
  "cap_count": 3,
  "cooldown_seconds": 3600
}
```

---

**Keep this sheet handy! Print it or bookmark for quick reference.** 📋

---

**Last Updated:** November 23, 2026
