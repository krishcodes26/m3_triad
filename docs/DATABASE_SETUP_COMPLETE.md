# M3 Triad Database Setup — COMPLETE ✅

## Summary

Your Supabase database for M3 Triad is fully configured and ready for development!

### What Was Set Up

#### 1. **Database Schema** ✅
- **24 tables** created with proper relationships
- **7 custom ENUM types** for vectors, statuses, priorities, etc.
- **Indexes** on all frequently queried fields (user_id, dates, status)
- Full support for:
  - User identity & character progression
  - Missions, milestones, and tasks
  - Habits with check-in tracking
  - Workout routines, sessions, sets, and PRs
  - Nutrition tracking with meal logs
  - Focus sessions and calendar blocks
  - XP ledger (immutable progression history)
  - Achievements and notifications

#### 2. **Row Level Security (RLS)** ✅
- **Policies enabled on all tables**
- Users can only access their own data
- Automatic enforcement via Supabase auth
- Safe to use from client-side code
- Example RLS structures:
  - Direct ownership (e.g., missions → user_id)
  - Hierarchical access (e.g., tasks → missions → user_id)
  - Shared resources (e.g., default exercises available to all)

#### 3. **TypeScript Types** ✅
- **Full type definitions** in `src/types/database.ts`
- Covers all 24 tables and relationships
- Database schema type for Supabase client
- Type-safe Insert/Update types
- IDE autocomplete support

#### 4. **Utility Functions** ✅
- **Supabase client setup** in `src/lib/supabase.ts`
- Authentication helpers (signUp, signIn, signOut)
- CRUD operations for all major features
- Real-time subscription helpers
- Organized by domain (Auth, Profile, Character, Missions, Tasks, Habits, Workouts, Nutrition, etc.)

---

## File Structure

```
D:\Projects\M3 Triad\
├── .env.local                                    # Supabase credentials (keep private!)
├── .gitignore                                    # Prevents committing secrets
├── migrations/
│   ├── 001_create_m3_triad_schema.sql           # Schema creation (already run ✅)
│   └── 002_setup_rls_policies.sql               # RLS policies (already run ✅)
├── src/
│   ├── types/
│   │   └── database.ts                          # TypeScript type definitions
│   └── lib/
│       └── supabase.ts                          # Supabase client & utilities
└── DATABASE_SETUP_COMPLETE.md                   # This file
```

---

## How to Use in Your Code

### 1. **Authentication**

```typescript
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase';

// Sign up
const { data, error } = await signUp('user@example.com', 'password123');

// Sign in
const { data, error } = await signIn('user@example.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();
```

### 2. **User Profile**

```typescript
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile 
} from '@/lib/supabase';

// Create profile after signup
const { data: profile } = await createUserProfile(userId, {
  display_name: 'Alex Mercer',
  timezone: 'America/New_York',
  locale: 'en-US',
});

// Get user profile
const { data: profile } = await getUserProfile(userId);

// Update profile
const { data } = await updateUserProfile(userId, {
  bio: 'Learning, earning, and training.',
});
```

### 3. **Character Progress**

```typescript
import { 
  getCharacterProgress, 
  getVectorProgress 
} from '@/lib/supabase';

// Get overall character progress
const { data: character } = await getCharacterProgress(userId);
console.log(character.level);  // e.g., 5
console.log(character.rank);   // e.g., "Adept"
console.log(character.total_xp); // e.g., 15000

// Get per-vector progress
const { data: vectors } = await getVectorProgress(userId);
// Returns array of { vector, level, xp } for mind, money, muscle
```

### 4. **Missions & Tasks**

```typescript
import { 
  getMissions, 
  createMission, 
  getTasksByMission, 
  createTask 
} from '@/lib/supabase';

// Create a mission
const { data: mission } = await createMission(userId, {
  title: 'Complete course on system design',
  vector: 'mind',
  goal: 'Understand distributed systems',
  deadline: '2026-03-31',
});

// Get all missions
const { data: missions } = await getMissions(userId);

// Get tasks for a mission
const { data: tasks } = await getTasksByMission(mission.id);

// Create a task
const { data: task } = await createTask(mission.id, {
  title: 'Read chapter 3 on consensus algorithms',
  priority: 1,
  due_date: '2026-02-15',
});

// Mark task as completed
const { data } = await updateTask(task.id, {
  status: 'completed',
  completed_at: new Date().toISOString(),
});
```

### 5. **Habits**

```typescript
import { 
  getHabits, 
  createHabit, 
  checkInHabit 
} from '@/lib/supabase';

// Create a habit
const { data: habit } = await createHabit(userId, {
  name: '30 min focused work',
  vector: 'mind',
  frequency: 'daily',
  timezone: 'UTC',
});

// Get all habits
const { data: habits } = await getHabits(userId);

// Check in to a habit (mark as done for today)
const { data: checkin } = await checkInHabit(
  habit.id, 
  '2026-01-21',  // today's date
  1              // completion value (optional, for tracking amount)
);
```

### 6. **Workouts**

```typescript
import { 
  startWorkoutSession, 
  logWorkoutSet, 
  endWorkoutSession 
} from '@/lib/supabase';

// Start a workout
const { data: session } = await startWorkoutSession(userId, routineId);

// Log sets during workout
const { data: set1 } = await logWorkoutSet(session.id, exerciseId, {
  set_number: 1,
  load: 100,
  reps: 8,
  unit: 'kg',
  set_type: 'working',
  rpe: 8,  // Rate of Perceived Exertion
});

const { data: set2 } = await logWorkoutSet(session.id, exerciseId, {
  set_number: 2,
  load: 100,
  reps: 6,
  unit: 'kg',
  set_type: 'working',
  rpe: 9,
});

// End workout
const { data: completed } = await endWorkoutSession(session.id);
```

### 7. **Nutrition**

```typescript
import { 
  getMealEntries, 
  logMealEntry 
} from '@/lib/supabase';

// Log a meal
const { data: meal } = await logMealEntry(userId, {
  entry_date: '2026-01-21',
  meal_category: 'breakfast',
  custom_food_name: 'Oatmeal with berries',
  quantity: 1,
  quantity_unit: 'serving',
  calories: 350,
  protein_g: 12,
  carbs_g: 60,
  fat_g: 5,
});

// Get today's meals
const { data: meals } = await getMealEntries(userId, '2026-01-21');

// Calculate daily totals
const totalCalories = meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
const totalProtein = meals?.reduce((sum, m) => sum + (m.protein_g || 0), 0) || 0;
```

### 8. **XP Ledger**

```typescript
import { 
  getXpLedger, 
  getXpByVector 
} from '@/lib/supabase';

// Get all XP events
const { data: allXp } = await getXpLedger(userId, 100);

// Get XP for specific vector
const { data: mindXp } = await getXpByVector(userId, 'mind');

// XP ledger shows:
// - source_type (e.g., "task_completed", "workout_completed")
// - source_id (reference to the task/workout/habit)
// - amount (XP points awarded)
// - rule_version (which scoring rule was used)
// - created_at (immutable timestamp)
```

### 9. **Real-Time Subscriptions**

```typescript
import { 
  subscribeToMissions, 
  subscribeToNotifications 
} from '@/lib/supabase';

// Subscribe to mission changes
const channel = subscribeToMissions(userId, (payload) => {
  if (payload.eventType === 'INSERT') {
    console.log('New mission created:', payload.new);
  } else if (payload.eventType === 'UPDATE') {
    console.log('Mission updated:', payload.new);
  }
});

// Don't forget to unsubscribe
return () => channel.unsubscribe();

// Subscribe to new notifications
const notifChannel = subscribeToNotifications(userId, (payload) => {
  console.log('New notification:', payload.new);
});
```

---

## Important Notes

### 1. **User ID and Auth**
- All user data is scoped to `auth.uid()` via RLS
- After signup/signin, Supabase automatically provides the user ID
- Never hardcode user IDs in client code
- Always use `getCurrentUser()` to get the authenticated user

### 2. **Timestamps**
- All timestamps are stored in UTC (timezone aware)
- Supabase returns ISO 8601 strings: `"2026-01-21T14:30:00+00:00"`
- Always display times in the user's timezone (stored in `user_profiles.timezone`)

### 3. **XP Awards**
- Do NOT manually update XP from client code
- XP ledger is append-only (immutable)
- Use a backend function or server-side logic to award XP
- Example: Mark task as completed → Backend checks → Awards XP → Creates ledger entry

### 4. **RLS Policies**
- RLS is **enabled on all tables**
- If you get "permission denied" errors, check:
  - Is the user authenticated?
  - Does the data belong to the authenticated user?
  - Are you using the correct user_id?

### 5. **Error Handling**
```typescript
const { data, error } = await getUserProfile(userId);

if (error) {
  console.error('Failed to fetch profile:', error.message);
  // Handle error
} else {
  // Use data
}
```

---

## Next Steps

### 1. **Set up Next.js App**
Create pages to implement the M3 Triad screens using these utilities.

### 2. **Build Authentication Flow**
- Sign up page
- Sign in page
- Protected routes (require authentication)
- Initial profile setup

### 3. **Create Dashboard**
- Display user character stats
- Show active missions
- Quick action buttons

### 4. **Implement Features**
- Missions & Tasks
- Habits
- Workouts
- Nutrition
- Calendar
- Analytics

### 5. **Backend XP Logic**
You'll need a **Supabase Edge Function** or **API route** to safely award XP:
```typescript
// API route: /api/award-xp
// Called when: task completed, workout done, habit checked in
// Validates the event, awards XP, creates ledger entry
```

---

## Troubleshooting

### "Cannot read properties of undefined"
- Check that `.env.local` has correct credentials
- Verify you're imported from `@/lib/supabase`

### "Permission denied" or empty results
- Ensure you're authenticated (check `getCurrentUser()`)
- Verify RLS policy allows the operation
- Check that data belongs to authenticated user

### "Table not found"
- Verify migrations ran successfully in Supabase SQL Editor
- Check Supabase dashboard under "Tables"

### Type errors in TypeScript
- Ensure `src/types/database.ts` is properly generated
- Use `Database` type with Supabase client for autocomplete

---

## Database Diagram (Entity Relationships)

```
users (1) ──→ (N) user_profiles
     ├──→ (N) character_progress
     ├──→ (N) vector_progress
     ├──→ (N) missions ──→ (N) milestones ──→ (N) tasks
     ├──→ (N) habits ──→ (N) habit_check_ins
     ├──→ (N) workout_routines ──→ (N) routine_exercises → exercises
     ├──→ (N) workout_sessions ──→ (N) workout_sets → exercises
     ├──→ (N) personal_records → exercises
     ├──→ (N) meal_entries → food_items
     ├──→ (N) focus_sessions
     ├──→ (N) calendar_blocks
     ├──→ (N) daily_reflections
     ├──→ (N) xp_ledger
     ├──→ (N) notifications
     ├──→ (N) user_achievements → achievements
     └──→ (N) integration_connections

exercises: Can be default (user_id NULL) or custom (user_id set)
achievements: Global (not user-scoped)
food_items: Global (not user-scoped)
```

---

## Status

| Item | Status |
|------|--------|
| ✅ Database Schema | Complete |
| ✅ Tables (24) | Created |
| ✅ Indexes | Created |
| ✅ Row Level Security | Enabled |
| ✅ Type Definitions | Generated |
| ✅ Supabase Client | Configured |
| ✅ Utility Functions | Implemented |
| ⏳ Next.js App | Ready to build |
| ⏳ Authentication UI | Ready to build |
| ⏳ Dashboard | Ready to build |
| ⏳ Features | Ready to build |

---

**Your M3 Triad database is production-ready!** 🚀

Start building your Next.js app and use the utilities in `src/lib/supabase.ts` to interact with the database.
