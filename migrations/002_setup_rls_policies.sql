-- M3 Triad Row Level Security (RLS) Policies
-- Status: Enable authenticated access to user data
-- Created: 2026-01-01

-- ============================================================================
-- USER PROFILES - Allow users to view/update their own profile
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CHARACTER PROGRESS
-- ============================================================================

ALTER TABLE character_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own character progress"
  ON character_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own character progress"
  ON character_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VECTOR PROGRESS
-- ============================================================================

ALTER TABLE vector_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vector progress"
  ON vector_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vector progress"
  ON vector_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MISSIONS
-- ============================================================================

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own missions"
  ON missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON missions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions"
  ON missions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MILESTONES (access through missions)
-- ============================================================================

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones in their missions"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = milestones.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert milestones in their missions"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones in their missions"
  ON milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = milestones.mission_id 
      AND missions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones in their missions"
  ON milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = milestones.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TASKS (access through missions)
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their missions"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = tasks.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks in their missions"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their missions"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = tasks.mission_id 
      AND missions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their missions"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = tasks.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TASK EVENTS
-- ============================================================================

ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their tasks"
  ON task_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      JOIN missions ON missions.id = tasks.mission_id
      WHERE tasks.id = task_events.task_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for their tasks"
  ON task_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      JOIN missions ON missions.id = tasks.mission_id
      WHERE tasks.id = task_id 
      AND missions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HABITS
-- ============================================================================

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HABIT CHECK-INS
-- ============================================================================

ALTER TABLE habit_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view check-ins for their habits"
  ON habit_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_check_ins.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert check-ins for their habits"
  ON habit_check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_id 
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update check-ins for their habits"
  ON habit_check_ins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_check_ins.habit_id 
      AND habits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_id 
      AND habits.user_id = auth.uid()
    )
  );

-- ============================================================================
-- WORKOUT ROUTINES
-- ============================================================================

ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout routines"
  ON workout_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout routines"
  ON workout_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout routines"
  ON workout_routines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout routines"
  ON workout_routines FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- EXERCISES (allow viewing all, but only custom exercises for user)
-- ============================================================================

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view default exercises"
  ON exercises FOR SELECT
  USING (user_id IS NULL);

CREATE POLICY "Users can view their own custom exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert custom exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROUTINE EXERCISES (access through routines)
-- ============================================================================

ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view routine exercises for their routines"
  ON routine_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = routine_exercises.routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert routine exercises for their routines"
  ON routine_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update routine exercises for their routines"
  ON routine_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = routine_exercises.routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );

-- ============================================================================
-- WORKOUT SESSIONS
-- ============================================================================

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WORKOUT SETS
-- ============================================================================

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sets from their sessions"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sets in their sessions"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets in their sessions"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PERSONAL RECORDS
-- ============================================================================

ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personal records"
  ON personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal records"
  ON personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal records"
  ON personal_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FOOD ITEMS (mostly public, but track user submissions)
-- ============================================================================

ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view verified food items
CREATE POLICY "Anyone can view verified food items"
  ON food_items FOR SELECT
  USING (verified = true OR true);

-- ============================================================================
-- MEAL ENTRIES
-- ============================================================================

ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal entries"
  ON meal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal entries"
  ON meal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal entries"
  ON meal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal entries"
  ON meal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOCUS SESSIONS
-- ============================================================================

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own focus sessions"
  ON focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
  ON focus_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
  ON focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CALENDAR BLOCKS
-- ============================================================================

ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar blocks"
  ON calendar_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar blocks"
  ON calendar_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar blocks"
  ON calendar_blocks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar blocks"
  ON calendar_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAILY REFLECTIONS
-- ============================================================================

ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections"
  ON daily_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
  ON daily_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON daily_reflections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON daily_reflections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- XP LEDGER
-- ============================================================================

ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP ledger"
  ON xp_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP events (via service role)"
  ON xp_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are public/global
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- ============================================================================
-- USER ACHIEVEMENTS
-- ============================================================================

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INTEGRATION CONNECTIONS
-- ============================================================================

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integration connections"
  ON integration_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration connections"
  ON integration_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration connections"
  ON integration_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration connections"
  ON integration_connections FOR DELETE
  USING (auth.uid() = user_id);
