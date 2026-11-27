/**
 * Habit data layer — Supabase in live mode, local demo store in demo mode.
 *
 * Uses the existing `habits` and `habit_check_ins` tables. The kind is stored in
 * the `schedule_days` TEXT column as a small JSON envelope (see types.ts), so
 * no migration is required.
 */

import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demo';
import * as demo from '@/lib/demo/habits';
import * as local from '@/lib/habits/local';
import type {
  CheckInStatus, CompletionRule, Habit, HabitCheckIn, Vector,
} from './types';
import {
  decodeSchedule, frequencyFor,
} from './types';

export type HabitInput = demo.HabitInput;
export type HabitsSnapshot = demo.HabitsSnapshot;
export { isLocalHabitId } from '@/lib/habits/local';

/* ── Local overlay merge ─────────────────────────────────────────────────── */

function mergeHabits(liveHabits: Habit[], localHabits: Habit[]): Habit[] {
  const map = new Map(liveHabits.map(h => [h.id, h]));
  for (const habit of localHabits) map.set(habit.id, habit);
  return [...map.values()];
}

function mergeCheckIns(liveCheckIns: HabitCheckIn[], localCheckIns: HabitCheckIn[]): HabitCheckIn[] {
  const map = new Map(liveCheckIns.map(c => [`${c.habit_id}|${c.scheduled_date}`, c]));
  for (const checkIn of localCheckIns) {
    map.set(`${checkIn.habit_id}|${checkIn.scheduled_date}`, checkIn);
  }
  return [...map.values()];
}

function normalizeTime(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return value.slice(0, 5);
}

function normalizeRule(value: unknown): CompletionRule {
  return value === 'count' || value === 'duration' ? value : 'binary';
}

function rowToHabit(row: any): Habit {
  const { kind, days } = decodeSchedule(row.schedule_days, row.frequency);
  const normalizedDays =
    kind === 'non_negotiable' && days.length === 0
      ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      : days;
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description ?? null,
    vector: row.vector as Vector,
    kind,
    frequency: frequencyFor(kind, normalizedDays),
    schedule_days: normalizedDays,
    schedule_time: normalizeTime(row.schedule_time),
    target_value: row.target_value == null ? null : Number(row.target_value),
    target_unit: row.target_unit ?? null,
    completion_rule: normalizeRule(row.completion_rule),
    status: row.status === 'paused' || row.status === 'archived' ? row.status : 'active',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToCheckIn(row: any): HabitCheckIn {
  return {
    habit_id: row.habit_id,
    scheduled_date: String(row.scheduled_date).slice(0, 10),
    status: row.status === 'completed' || row.status === 'skipped' ? row.status : 'pending',
    completion_value: row.completion_value == null ? null : Number(row.completion_value),
    note: row.note ?? null,
  };
}

function inputToRow(userId: string, input: HabitInput) {
  const days = input.kind === 'non_negotiable'
    ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    : input.days;
  return {
    user_id: userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    vector: input.vector,
    frequency: frequencyFor(input.kind, days),
    schedule_days: JSON.stringify({ kind: input.kind, days }),
    schedule_time: input.time ? `${input.time}:00` : null,
    target_value: input.rule === 'binary' ? null : input.target_value,
    target_unit: input.rule === 'binary' ? null : input.target_unit,
    completion_rule: input.rule,
    status: 'active',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    reminder_enabled: true,
    updated_at: new Date().toISOString(),
  };
}

export async function getHabits(userId: string): Promise<HabitsSnapshot> {
  if (isDemoMode()) return demo.getHabits(userId);

  const localSnapshot = local.getLocalSnapshot(userId);

  const { data: rows, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !rows) {
    if (error) console.error('getHabits (using local overlay):', error);
    return localSnapshot;
  }

  const liveHabits = rows.map(rowToHabit);

  // Load the full history so “lifetime hits” and best streaks are truthful.
  let liveCheckIns: HabitCheckIn[] = [];
  if (liveHabits.length > 0) {
    const { data: checkRows, error: checkError } = await supabase
      .from('habit_check_ins')
      .select('habit_id, scheduled_date, status, completion_value, note')
      .in('habit_id', liveHabits.map(h => h.id));

    if (checkError) console.error('getHabits check-ins (using local overlay):', checkError);
    liveCheckIns = (checkRows ?? []).map(rowToCheckIn);
  }

  return {
    habits: mergeHabits(liveHabits, localSnapshot.habits),
    checkIns: mergeCheckIns(liveCheckIns, localSnapshot.checkIns),
  };
}

export async function createHabit(userId: string, input: HabitInput): Promise<Habit | null> {
  if (isDemoMode()) return demo.createHabit(userId, input);

  const { data, error } = await supabase
    .from('habits')
    .insert(inputToRow(userId, input))
    .select('*')
    .single();

  if (error || !data) {
    if (error) console.error('createHabit (saving locally):', error);
    return local.createLocalHabit(userId, input);
  }
  return rowToHabit(data);
}

export async function updateHabit(userId: string, habitId: string, input: HabitInput): Promise<Habit | null> {
  if (isDemoMode()) return demo.updateHabit(habitId, input);
  if (local.isLocalHabitId(habitId)) return local.updateLocalHabit(userId, habitId, input);

  const { user_id: _ignored, status: _status, ...payload } = inputToRow('', input);
  const { data, error } = await supabase
    .from('habits')
    .update(payload)
    .eq('id', habitId)
    .select('*')
    .single();

  if (error || !data) {
    if (error) console.error('updateHabit:', error);
    return null;
  }
  return rowToHabit(data);
}

export async function saveCheckIn(
  userId: string,
  habitId: string,
  date: string,
  status: CheckInStatus,
  value: number | null,
  note: string | null = null,
): Promise<HabitCheckIn | null> {
  if (isDemoMode()) return demo.saveCheckIn(habitId, date, status, value, note);
  if (local.isLocalHabitId(habitId)) {
    return local.saveLocalCheckIn(userId, habitId, date, status, value, note);
  }

  const { data: existing, error: findError } = await supabase
    .from('habit_check_ins')
    .select('id')
    .eq('habit_id', habitId)
    .eq('scheduled_date', date)
    .limit(1)
    .maybeSingle();

  if (findError) {
    console.error('saveCheckIn lookup (saving locally):', findError);
    return local.saveLocalCheckIn(userId, habitId, date, status, value, note);
  }

  const payload = {
    habit_id: habitId,
    scheduled_date: date,
    status,
    completion_value: value,
    note,
    source: 'manual',
    updated_at: new Date().toISOString(),
  };

  const query = existing?.id
    ? supabase.from('habit_check_ins').update(payload).eq('id', existing.id).select('*').single()
    : supabase.from('habit_check_ins').insert(payload).select('*').single();

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error('saveCheckIn (saving locally):', error);
    return local.saveLocalCheckIn(userId, habitId, date, status, value, note);
  }
  return rowToCheckIn(data);
}

export async function setHabitStatus(userId: string, habitId: string, status: Habit['status']): Promise<boolean> {
  if (isDemoMode()) return demo.setHabitStatus(habitId, status);
  if (local.isLocalHabitId(habitId)) return local.setLocalStatus(userId, habitId, status);

  const { error } = await supabase
    .from('habits')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', habitId);

  if (error) {
    console.error('setHabitStatus:', error);
    return false;
  }
  return true;
}

export async function deleteHabit(userId: string, habitId: string): Promise<boolean> {
  if (isDemoMode()) return demo.deleteHabit(habitId);
  if (local.isLocalHabitId(habitId)) return local.deleteLocalHabit(userId, habitId);

  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) {
    console.error('deleteHabit:', error);
    return false;
  }
  return true;
}

