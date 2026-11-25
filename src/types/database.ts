// Auto-generated database types for M3 Triad
// Generated: 2026-01-01

export type Vector = 'mind' | 'money' | 'muscle';
export type MissionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived' | 'cancelled';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'skipped';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type SetType = 'working' | 'warmup' | 'drop_set' | 'rest_pause' | 'amrap';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationChannel = 'in_app' | 'push' | 'email';

// ============================================================================
// USER & IDENTITY
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  locale: string;
  privacy_mode: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CHARACTER & PROGRESSION
// ============================================================================

export interface CharacterProgress {
  id: string;
  user_id: string;
  level: number;
  rank: string;
  total_xp: number;
  created_at: string;
  updated_at: string;
}

export interface VectorProgress {
  id: string;
  user_id: string;
  vector: Vector;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MISSIONS & TASKS
// ============================================================================

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  vector: Vector;
  goal: string | null;
  status: MissionStatus;
  start_date: string | null;
  deadline: string | null;
  completion_rule: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  mission_id: string;
  title: string;
  description: string | null;
  ordering: number | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  mission_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  due_date: string | null;
  estimate_hours: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  event_type: string;
  previous_value: string | null;
  new_value: string | null;
  created_at: string;
}

// ============================================================================
// HABITS
// ============================================================================

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  vector: Vector;
  frequency: HabitFrequency;
  schedule_days: string | null;
  schedule_time: string | null;
  target_value: number | null;
  target_unit: string | null;
  completion_rule: string;
  timezone: string;
  status: string;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCheckIn {
  id: string;
  habit_id: string;
  scheduled_date: string;
  completion_value: number | null;
  status: string;
  note: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// WORKOUTS
// ============================================================================

export interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  ordering: number | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  movement_category: string | null;
  equipment: string | null;
  muscle_group: string | null;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  ordering: number | null;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  status: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  notes: string | null;
  unit_preference: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  load: number | null;
  reps: number | null;
  unit: string;
  set_type: SetType;
  rpe: number | null;
  rir: number | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: string;
  value: number;
  unit: string | null;
  achieved_date: string | null;
  source_set_id: string | null;
  created_at: string;
}

// ============================================================================
// NUTRITION
// ============================================================================

export interface FoodItem {
  id: string;
  name: string;
  serving_size: number | null;
  serving_unit: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  source: string;
  verified: boolean;
  created_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  entry_date: string;
  meal_category: string;
  food_item_id: string | null;
  custom_food_name: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  source: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FOCUS & WORK SESSIONS
// ============================================================================

export interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  category: string;
  related_mission_id: string | null;
  related_task_id: string | null;
  interruption_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CALENDAR & SCHEDULING
// ============================================================================

export interface CalendarBlock {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  timezone: string;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  category: string | null;
  status: string;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  reflection_text: string | null;
  energy_level: number | null;
  mood_score: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// XP & PROGRESSION
// ============================================================================

export interface XpLedgerEvent {
  id: string;
  user_id: string;
  vector: Vector;
  source_type: string;
  source_id: string | null;
  amount: number;
  rule_version: string;
  explanation: string | null;
  reverses_event_id: string | null;
  created_at: string;
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  criteria: string | null;
  icon_url: string | null;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  evidence_reference: string | null;
  created_at: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  priority: NotificationPriority;
  source_entity_type: string | null;
  source_entity_id: string | null;
  read: boolean;
  archived: boolean;
  action_destination: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  channel: NotificationChannel;
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INTEGRATIONS
// ============================================================================

export interface IntegrationConnection {
  id: string;
  user_id: string;
  provider: string;
  scopes: string | null;
  status: string;
  sync_cursor: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Database Schema Type (for use with Supabase client)
// ============================================================================

// Supabase's GenericTable requires Row/Insert/Update to be index-signed Record types.
// Hand-written interfaces don't satisfy that constraint, so we use a loose Database
// shape here — the supabase client is typed as `any` internally — and rely on our
// domain interfaces above for all application-level type safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
