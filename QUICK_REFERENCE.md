# M3 Triad Progression - Quick Reference

## Import the Hook

```typescript
import { useProgression } from '@/hooks/useProgression';

const { snapshot, todayXp, loading, error, refetch } = useProgression(userId);
```

## Access Progression Data

```typescript
// Character level and rank
snapshot.characterLevel           // 23
snapshot.currentRank.code         // "C"
snapshot.currentRank.name         // "Warrior"

// Vector levels
snapshot.vectorLevels.mind.level    // 20
snapshot.vectorLevels.muscle.level  // 20
snapshot.vectorLevels.money.level   // 21

// XP totals
snapshot.lifetimeXp                 // 45,000
snapshot.vectorXp.mind              // 15,000
snapshot.vectorXp.muscle            // 14,500
snapshot.vectorXp.money             // 15,500

// Today's earned XP
todayXp.mind                        // 120
todayXp.muscle                      // 85
todayXp.money                       // 150

// Harmony (0-100%)
snapshot.harmonyScore               // 78%

// Tier progress (0-100%)
snapshot.characterTierProgress      // 45%
snapshot.vectorLevels.mind.progress // 64%

// Rank eligibility
snapshot.eligibleForRanks           // Array of rank configs
snapshot.eligibleForRanks.map(r => r.name)  // ["E", "D", "C"]
```

## Import Calculators Directly

```typescript
import {
  calculateVectorLevel,
  calculateCharacterLevel,
  calculateHarmony,
  calculateProgressionSnapshot,
  determineRank,
} from '@/lib/progression';

// Manual calculation from XP
const level = calculateVectorLevel(15000);  // {level: 20, tierXp: 100, ...}

// Get complete snapshot
const snapshot = calculateProgressionSnapshot(15000, 14500, 15500);

// Check rank eligibility
const rank = determineRank(23, 45000, 20, 20, 21, 78);
```

## Configuration

All settings in `src/lib/progression/config.ts`:

```typescript
// Vector level thresholds (cumulative XP)
VECTOR_LEVEL_THRESHOLDS[20]  // 43,700

// Character level thresholds
CHARACTER_LEVEL_THRESHOLDS[23]  // 171,600

// Rank definitions
RANKS.C.minCharacterLevel    // 20
RANKS.C.minLifetimeXp        // 100,000
RANKS.C.minVectorLevels      // {mind: 15, muscle: 15, money: 15}
RANKS.C.minHarmonyScore      // 70

// XP reward rules
XP_REWARD_RULES['mind:focus_session_completed'].baseXp  // 15
XP_REWARD_RULES['muscle:workout_completed'].baseXp      // 50

// Harmony calculation
HARMONY_CONFIG.minWeight  // 0.4
HARMONY_CONFIG.avgWeight  // 0.6
```

## Common Patterns

### Display Character Level

```tsx
<div>
  <h1>Level {snapshot.characterLevel}</h1>
  <p>{snapshot.currentRank.name}</p>
  <ProgressBar 
    value={snapshot.characterTierProgress}
    max={100}
  />
</div>
```

### Show Vector Levels

```tsx
<div>
  <p>Mind: {snapshot.vectorLevels.mind.level}</p>
  <p>Muscle: {snapshot.vectorLevels.muscle.level}</p>
  <p>Money: {snapshot.vectorLevels.money.level}</p>
</div>
```

### Display Harmony

```tsx
<div>
  <p>Harmony: {snapshot.harmonyScore}%</p>
  {snapshot.harmonyScore < 70 && (
    <warning>Low harmony! Balance your vectors.</warning>
  )}
</div>
```

### Show Today's XP

```tsx
<div>
  <p>Mind XP Today: +{todayXp.mind}</p>
  <p>Muscle XP Today: +{todayXp.muscle}</p>
  <p>Money XP Today: +{todayXp.money}</p>
</div>
```

### Check Rank Eligibility

```tsx
{snapshot.eligibleForRanks.includes(RANKS.B) && (
  <button>Promote to Elite</button>
)}
```

## Formulas

### Level Calculation

```
level = highest level whose cumulative_xp_threshold ≤ total_xp
```

### Tier Progress

```
tier_xp = total_xp - threshold_for_current_level
tier_required = threshold_for_next_level - threshold_for_current_level
tier_progress = (tier_xp / tier_required) × 100
```

### Harmony Score

```
Normalize each vector to 0-100 (capped at Level 30)
min_score = minimum of three scores
avg_score = average of three scores
harmony = (min_score × 0.4) + (avg_score × 0.6)
```

### Character Level

Same as vector level, but uses `CHARACTER_LEVEL_THRESHOLDS` and lifetime XP.

## Testing

```bash
# Run progression tests
npm test -- progression

# Run all tests
npm test

# Watch mode
npm test -- --watch
```

## Debugging

Enable console logging:

```typescript
// In data.ts, errors are logged
console.error('Error fetching progression:', error);

// In calculator.ts, add debug logging
const snapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);
console.log('Snapshot:', snapshot);
```

## Common Mistakes

❌ **Don't**: Hardcode XP amounts
```typescript
// BAD
baseXp: 50
```

✅ **Do**: Use config
```typescript
// GOOD
XP_REWARD_RULES['muscle:workout_completed'].baseXp
```

---

❌ **Don't**: Confuse vector XP with character level
```typescript
// BAD
characterLevel = mindXp / 1000
```

✅ **Do**: Calculate from lifetime XP
```typescript
// GOOD
characterLevel = calculateCharacterLevel(mindXp + muscleXp + moneyXp)
```

---

❌ **Don't**: Award XP from the client
```typescript
// BAD - in component
await supabase.from('xp_ledger').insert({...})
```

✅ **Do**: Use backend function
```typescript
// GOOD - backend only
await supabase.rpc('award_xp', {...})
```

---

❌ **Don't**: Recalculate levels on every change
```typescript
// BAD
useEffect(() => {
  const level = calculateVectorLevel(xp);
  // ... every render
}, [xp])
```

✅ **Do**: Use the hook with caching
```typescript
// GOOD
const { snapshot } = useProgression(userId);
// Fetches once, caches result
```

## Quick Stats

| Metric | Value |
|--------|-------|
| Number of Ranks | 8 |
| Number of Vectors | 3 |
| Vectors Uncapped | True (can exceed 30) |
| Max Level (Character) | Unlimited |
| Max Level (Vector) | Unlimited |
| Harmony Min | 0% |
| Harmony Max | 100% |
| Rank Promotion | Manual (future) |
| XP Reversal | Never (immutable) |
| Streak Loss on Miss | No XP lost |

## Related Files

- **Config**: `src/lib/progression/config.ts` (520 lines)
- **Calculator**: `src/lib/progression/calculator.ts` (270 lines)
- **Data**: `src/lib/progression/data.ts` (170 lines)
- **Hook**: `src/hooks/useProgression.ts` (60 lines)
- **Dashboard**: `src/app/dashboard/page.tsx` (490 lines)
- **Tests**: `src/lib/progression/__tests__/calculator.test.ts` (250 lines)
- **Spec**: `logic.md` (complete specification)
- **Guide**: `PROGRESSION_IMPLEMENTATION.md` (detailed guide)

## Support

For detailed information, see:
- `PROGRESSION_IMPLEMENTATION.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `logic.md` - Original specifications

For questions about formulas or mechanics, check `logic.md` sections:
- Section 4: XP architecture
- Section 5: Vector levels
- Section 6: Character level
- Section 7: Tri-vector harmony
- Section 8: Rank and tier ladder
