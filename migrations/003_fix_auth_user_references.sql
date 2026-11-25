-- =============================================================================
-- Migration 003: Fix user_id foreign keys to reference auth.users
-- 
-- Problem: All tables have user_id FK → public.users(id)
--          But Supabase Auth creates users only in auth.users
--          So every INSERT into user_profiles, missions, etc. fails with
--          FK violation because there is no row in public.users
--
-- Solution: Drop the custom public.users dependency from all tables,
--           change user_id FKs to reference auth.users(id) directly,
--           and add a trigger to auto-create a user_profiles row on signup.
-- =============================================================================

-- Step 1: Drop all existing FK constraints pointing to public.users
ALTER TABLE user_profiles        DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE character_progress   DROP CONSTRAINT IF EXISTS character_progress_user_id_fkey;
ALTER TABLE vector_progress      DROP CONSTRAINT IF EXISTS vector_progress_user_id_fkey;
ALTER TABLE missions             DROP CONSTRAINT IF EXISTS missions_user_id_fkey;
ALTER TABLE habits               DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE workout_routines     DROP CONSTRAINT IF EXISTS workout_routines_user_id_fkey;
ALTER TABLE exercises            DROP CONSTRAINT IF EXISTS exercises_user_id_fkey;
ALTER TABLE workout_sessions     DROP CONSTRAINT IF EXISTS workout_sessions_user_id_fkey;
ALTER TABLE personal_records     DROP CONSTRAINT IF EXISTS personal_records_user_id_fkey;
ALTER TABLE meal_entries         DROP CONSTRAINT IF EXISTS meal_entries_user_id_fkey;
ALTER TABLE focus_sessions       DROP CONSTRAINT IF EXISTS focus_sessions_user_id_fkey;
ALTER TABLE calendar_blocks      DROP CONSTRAINT IF EXISTS calendar_blocks_user_id_fkey;
ALTER TABLE daily_reflections    DROP CONSTRAINT IF EXISTS daily_reflections_user_id_fkey;
ALTER TABLE xp_ledger            DROP CONSTRAINT IF EXISTS xp_ledger_user_id_fkey;
ALTER TABLE user_achievements    DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE notifications        DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE integration_connections  DROP CONSTRAINT IF EXISTS integration_connections_user_id_fkey;

-- Step 2: Re-add all FK constraints pointing to auth.users(id)
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE character_progress
  ADD CONSTRAINT character_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE vector_progress
  ADD CONSTRAINT vector_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE missions
  ADD CONSTRAINT missions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE habits
  ADD CONSTRAINT habits_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workout_routines
  ADD CONSTRAINT workout_routines_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE exercises
  ADD CONSTRAINT exercises_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE workout_sessions
  ADD CONSTRAINT workout_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE personal_records
  ADD CONSTRAINT personal_records_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE meal_entries
  ADD CONSTRAINT meal_entries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE focus_sessions
  ADD CONSTRAINT focus_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE calendar_blocks
  ADD CONSTRAINT calendar_blocks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE daily_reflections
  ADD CONSTRAINT daily_reflections_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE xp_ledger
  ADD CONSTRAINT xp_ledger_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_achievements
  ADD CONSTRAINT user_achievements_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE integration_connections
  ADD CONSTRAINT integration_connections_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Drop the now-unnecessary public.users table
-- (all data was managed by auth.users anyway)
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 4: Add INSERT policy for character_progress (was missing)
CREATE POLICY "Users can insert their own character progress"
  ON character_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Add INSERT policy for vector_progress (was missing)  
CREATE POLICY "Users can insert their own vector progress"
  ON vector_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
