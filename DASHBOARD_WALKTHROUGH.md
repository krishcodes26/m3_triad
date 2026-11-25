# Dashboard Walkthrough - What's New

## Before vs After

### Before (Dummy Data)
```
Mind Level: Lv 18 (hardcoded)
Money Level: Lv 21 (hardcoded)
Muscle Level: Lv 15 (hardcoded)
XP shown as "hrs focus" / "£ saved" / "workouts"
No rank system
No harmony calculation
No character level
```

### After (Real Progression)
```
Character Level: 23 (calculated from 45,000 lifetime XP)
Rank: Warrior (from 8-tier system)
Harmony: 78% (tri-vector balance)

Mind Level: 20 (from 15,000 XP)
Muscle Level: 20 (from 14,500 XP)
Money Level: 21 (from 15,500 XP)

Today's XP by vector shows real earned progress
```

## Dashboard Sections

### 1. Character Status Card (NEW)

**Location**: Top of page, below greeting

```
┌─────────────────────────────────────────────┐
│ Character Status                            │
│ C — Warrior                                 │
├─────────────────┬───────────────────────────┤
│                 │                           │
│ Character Level │ Tri-Vector Harmony        │
│      23         │        78%                │
│                 │   Mind: 67                │
│  ████████░░░░   │   Muscle: 72              │
│  45% → Lv 24    │   Money: 73               │
│  2,540 XP left  │                           │
│                 │                           │
└─────────────────┴───────────────────────────┘
```

**Data shown**:
- Current rank letter (C) and name (Warrior)
- Character level calculated from lifetime XP
- Progress toward next character level (45%)
- Tri-vector harmony score (0-100%)
- Individual normalized scores for each vector

**Why it matters**: Shows overall progression and character standing in the system.

---

### 2. Today's Vectors Cards (UPDATED)

**Location**: Second section, three card layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│ MIND            │ MONEY           │ MUSCLE          │
│ Lv 20           │ Lv 21           │ Lv 20           │
├─────────────────┼─────────────────┼─────────────────┤
│ 120 XP earned   │ 150 XP earned   │ 85 XP earned    │
│ ████████░░░░ 64%│ █████████░░░░ 72%│ ████░░░░░░░░ 32%│
│                 │                 │                 │
│ To level 21:    │ To level 22:    │ To level 21:    │
│ 420 XP needed   │ 310 XP needed   │ 680 XP needed   │
└─────────────────┴─────────────────┴─────────────────┘
```

**Data shown per vector**:
- Current vector level (Lv X)
- XP earned today (real data from xp_ledger table)
- Progress bar toward next level
- Progress percentage (0-100%)
- XP needed to reach next level

**Why it matters**: Shows daily progress and current standing in each pillar.

---

### 3. Lifetime Progression Summary (NEW)

**Location**: Below Today's Vectors

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Lifetime XP  │ Mind XP      │ Muscle XP    │ Money XP     │
│              │              │              │              │
│  45,000      │  15,000      │  14,500      │  15,500      │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Data shown**:
- Total lifetime XP (sum of all three vectors)
- Individual vector XP totals
- Used to understand lifetime progression

**Why it matters**: Shows the pool of accumulated effort across all vectors.

---

### 4. Priority Focus (UNCHANGED)

This section remains the same but now operates on real quest data:

```
┌────────────────────────────────────────────┐
│ Priority Focus                             │
│                           TOP ACTION       │
├────────────────────────────────────────────┤
│ MIND                                       │
│ Complete deep-work block (90 min)          │
│ HIGH PRIORITY | Due: Today                 │
│ [Start now] [View details]                 │
└────────────────────────────────────────────┘
```

---

### 5. Daily Snapshot (UNCHANGED)

```
Focus time          3.2 hrs       (+0.4 vs avg) ↑
Net savings         £1,240 this   (+£80 vs last) ↑
Workouts            4 this week   (Target: 5) ↔
Habit streak        12 days       (Best: 21) ↔
```

---

### 6. Today's Quests (UNCHANGED)

Shows quest list with statuses, but now filters are active-ready.

---

### 7-8. Quick Actions & Upcoming (UNCHANGED)

Remain same, button targets updated for navigation.

---

## Real Data Flow

When a user opens the dashboard:

```
1. Session loads (useAuth)
2. User ID available
3. useProgression hook fires with userId
4. Data service queries:
   - vector_progress table (current XP per vector)
   - xp_ledger table (today's XP by vector)
5. Calculator processes XP values:
   - Calculates vector levels
   - Calculates character level
   - Normalizes scores (0-100)
   - Calculates harmony
   - Determines current rank
   - Finds eligible ranks
6. Component receives snapshot
7. Dashboard renders all real data
8. Auto-refetch every 30 seconds (configurable)
```

## Example Progression States

### Scenario 1: Beginner

```
Mind: 150 XP (Lv 1)
Muscle: 200 XP (Lv 1)
Money: 100 XP (Lv 1)
─────────────────────
Lifetime: 450 XP
Character Level: 1
Rank: E - Novice
Harmony: 100% (perfectly balanced)
```

### Scenario 2: Balanced Mid-Game

```
Mind: 15,000 XP (Lv 20)
Muscle: 14,500 XP (Lv 20)
Money: 15,500 XP (Lv 21)
─────────────────────────
Lifetime: 45,000 XP
Character Level: 23
Rank: C - Warrior
Harmony: 78%
```

### Scenario 3: Unbalanced Late-Game

```
Mind: 50,000 XP (Lv 30)
Muscle: 5,000 XP (Lv 7)
Money: 5,000 XP (Lv 7)
─────────────────────
Lifetime: 60,000 XP
Character Level: 20
Rank: D - Apprentice (stuck by harmony gate)
Harmony: 32% (heavily imbalanced)
```

The last example shows how **harmony gates progression** - even with high lifetime XP, rank eligibility is blocked because vectors are too unbalanced.

## Key Statistics Shown

### Character Level
- Based on: **Lifetime XP** (sum of all vectors)
- Minimum: 1
- Maximum: Unlimited (suggested max ~50)
- Used for: Rank eligibility, general standing

### Vector Levels
- Based on: **Individual vector XP**
- Minimum: 1
- Maximum: Unlimited
- Example: Mind can be Level 30 while Money is Level 7

### Harmony Score
- Range: 0% to 100%
- Formula: `(min_score × 0.4) + (avg_score × 0.6)`
- Effect: Gates rank promotions (rank B needs 75%, rank A needs 80%)
- Purpose: Prevents one-vector domination

### Rank
- Options: E, D, C, B, A, S, SS, SSS (8 total)
- Requirements: Multiple conditions (level, XP, vectors, harmony)
- Effect: Unlocks titles, perks, cosmetics
- Promotion: Manual (future) or automatic upon meeting all criteria

## What's Calculated in Real-Time

Each refresh recalculates:

1. ✅ All vector levels from XP
2. ✅ Character level from lifetime XP
3. ✅ Tier progress for each
4. ✅ Harmony score
5. ✅ Current rank
6. ✅ Eligible ranks
7. ✅ All percentages and remaining XP
8. ✅ Today's earned XP summary

## What's Still Demo Data

- **Daily Snapshot metrics** (focus time, savings, etc.)
  - These will be populated when activity trackers are connected
- **Priority Focus quest**
  - Will pull from actual user quests when quest system is integrated
- **Quick actions buttons**
  - Will navigate to actual logging flows when implemented
- **Upcoming & Reminders**
  - Will show real scheduled activities when calendar is synced

## Loading States

```
While fetching data:
- Skeleton loaders appear in all cards
- Text is not visible
- Progress bars are blank
- All sections show loading state
```

## Error Handling

```
If data fails to load:
- Returns null (component doesn't render)
- Error is logged to console
- User can refresh or navigate away
- Fallback mechanism can be added
```

## Performance

- **Data fetching**: Supabase queries optimized with specific column selection
- **Calculation**: O(1) calculations - instant
- **Rendering**: Only necessary re-renders
- **Refetch interval**: 30 seconds (configurable)

## Browser DevTools

To inspect the progression data:

```javascript
// In React DevTools, find Dashboard component
// Look for snapshot prop:
snapshot = {
  lifetimeXp: 45000,
  characterLevel: 23,
  vectorLevels: {
    mind: { level: 20, progress: 64, ... },
    // etc
  },
  harmonyScore: 78,
  currentRank: { code: 'C', name: 'Warrior', ... },
  // etc
}

// Or in console:
useProgression(userId).then(data => console.log(data.snapshot))
```

## Next Steps for Enhancement

1. **XP Award Animation**
   - Show +50 XP popup when earned
   - Float up and fade animation
   - Sound effect

2. **Level-Up Celebration**
   - Toast notification
   - Confetti effect
   - Level-up sound

3. **Rank Promotion Modal**
   - Show when eligible
   - Display new rank name and rewards
   - Confirm to promote button

4. **Activity Timeline**
   - Recent XP in sidebar
   - Quick view of what earned what
   - Scroll to see more

5. **Projections**
   - "Level up in X days" estimate
   - "Rank up in Y days" estimate
   - Based on 7-day average XP

## Conclusion

The dashboard now displays **genuine character progression** calculated from real database data, following the complete M3 Triad specification. Every number shown is computed according to the progression rules, with proper scaling, rank gating, and harmony mechanics.

Users can see:
- Their character level and rank
- Their standing in each pillar
- Balance across vectors (harmony)
- Today's progress
- Path to next level and rank

All based on real XP they've earned through the system!
