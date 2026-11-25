-- Migration 004: Grant permissions to authenticated role
-- Supabase requires explicit GRANT statements for the authenticated role
-- even when RLS policies are in place.

GRANT ALL ON public.missions TO authenticated;
GRANT ALL ON public.milestones TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.task_events TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.character_progress TO authenticated;
GRANT ALL ON public.vector_progress TO authenticated;
GRANT ALL ON public.habits TO authenticated;
GRANT ALL ON public.habit_check_ins TO authenticated;
GRANT ALL ON public.workout_routines TO authenticated;
GRANT ALL ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sets TO authenticated;
GRANT ALL ON public.exercises TO authenticated;
GRANT ALL ON public.routine_exercises TO authenticated;
GRANT ALL ON public.personal_records TO authenticated;
GRANT ALL ON public.food_items TO authenticated;
GRANT ALL ON public.meal_entries TO authenticated;
GRANT ALL ON public.focus_sessions TO authenticated;
GRANT ALL ON public.calendar_blocks TO authenticated;
GRANT ALL ON public.daily_reflections TO authenticated;
GRANT ALL ON public.xp_ledger TO authenticated;
GRANT ALL ON public.achievements TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.integration_connections TO authenticated;
GRANT ALL ON public.users TO authenticated;
