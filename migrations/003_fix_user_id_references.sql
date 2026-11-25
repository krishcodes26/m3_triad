-- Migration 003: Fix user_id foreign key references to use auth.users
-- The custom `users` table uses its own UUIDs, but Supabase Auth provides
-- auth.uid() which references auth.users(id). All tables need to reference
-- auth.users so RLS policies with auth.uid() = user_id work correctly.

-- Drop existing FK constraints that reference public.users
ALTER TABLE missions       DROP CONSTRAINT IF EXISTS missions_user_id_fkey;
ALTER TABLE user_profiles  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE character_progress DROP CONSTRAINT IF EXISTS character_progress_user_id_fkey;
ALTER TABLE vector_progress DROP CONSTRAINT IF EXISTS vector_progress_user_id_fkey;
ALTER TABLE habits         DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE workout_routines DROP CONSTRAINT IF EXISTS workout_routines_user_id_fkey;
ALTER TABLE workout_sessions DROP CONSTRAINT IF EXISTS workout_sessions_user_id_fkey;
ALTER TABLE personal_records DROP CONSTRAINT IF EXISTS personal_records_user_id_fkey;
ALTER TABLE meal_entries   DROP CONSTRAINT IF EXISTS meal_entries_user_id_fkey;
ALTER TABLE focus_sessions DROP CONSTRAINT IF EXISTS focus_sessions_user_id_fkey;
ALTER TABLE calendar_blocks DROP CONSTRAINT IF EXISTS calendar_blocks_user_id_fkey;
ALTER TABLE daily_reflections DROP CONSTRAINT IF EXISTS daily_reflections_user_id_fkey;
ALTER TABLE xp_ledger      DROP CONSTRAINT IF EXISTS xp_ledger_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE notifications  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE integration_connections DROP CONSTRAINT IF EXISTS integration_connections_user_id_fkey;

-- Re-add FK constraints pointing to auth.users instead
ALTER TABLE missions        ADD CONSTRAINT missions_user_id_fkey        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_profiles   ADD CONSTRAINT user_profiles_user_id_fkey   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE character_progress ADD CONSTRAINT character_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE vector_progress ADD CONSTRAINT vector_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE habits          ADD CONSTRAINT habits_user_id_fkey          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE workout_routines ADD CONSTRAINT workout_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE personal_records ADD CONSTRAINT personal_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meal_entries    ADD CONSTRAINT meal_entries_user_id_fkey    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE focus_sessions  ADD CONSTRAINT focus_sessions_user_id_fkey  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE calendar_blocks ADD CONSTRAINT calendar_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_reflections ADD CONSTRAINT daily_reflections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE xp_ledger       ADD CONSTRAINT xp_ledger_user_id_fkey       FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notifications   ADD CONSTRAINT notifications_user_id_fkey   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE integration_connections ADD CONSTRAINT integration_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
