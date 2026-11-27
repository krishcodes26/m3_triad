/**
 * Local fallback store for habit protocols.
 *
 * Live habit writes go to Supabase first. If the hosted project rejects the
 * write (missing migration, RLS misconfiguration, offline, expired session),
 * the habit is kept here under the signed-in user's id so the workflow still
 * completes. Local habits are prefixed `local-` and are merged back into the
 * snapshot on load. This is a resilience layer, not a second source of truth:
 * the UI marks these protocols as local.
 */

import type { Habit, HabitCheckIn, CheckInStatus } from '@/app/habits/types';
import { DAY_KEYS, frequencyFor } from '@/app/habits/types';
import type { HabitInput } from '@/lib/demo/habits';

interface LocalDb {
  habits: Habit[];
  checkIns: HabitCheckIn[];
}

const PREFIX = 'local-';

export function isLocalHabitId(id: string): boolean {
  return id.startsWith(PREFIX);
}

function storageKey(userId: string): string {
  return `m3triad:local-habits:${userId}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function load(userId: string): LocalDb {
  if (!isBrowser()) return { habits: [], checkIns: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return { habits: [], checkIns: [] };
    const parsed = JSON.parse(raw) as LocalDb;
    if (Array.isArray(parsed?.habits) && Array.isArray(parsed?.checkIns)) return parsed;
  } catch {
    /* corrupt/blocked storage */
  }
  return { habits: [], checkIns: [] };
}

function persist(userId: string, db: LocalDb): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(db));
  } catch {
    /* storage blocked — nothing else we can do locally */
  }
}

function newLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${PREFIX}${crypto.randomUUID()}`;
  }
  return `${PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildHabit(userId: string, input: HabitInput): Habit {
  const days = input.kind === 'non_negotiable' ? [...DAY_KEYS] : input.days;
  const now = new Date().toISOString();
  return {
    id: newLocalId(),
    user_id: userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    vector: input.vector,
    kind: input.kind,
    frequency: frequencyFor(input.kind, days),
    schedule_days: days,
    schedule_time: input.time || null,
    target_value: input.rule === 'binary' ? null : input.target_value,
    target_unit: input.rule === 'binary' ? null : input.target_unit,
    completion_rule: input.rule,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

export function getLocalSnapshot(userId: string): LocalDb {
  return load(userId);
}

export function createLocalHabit(userId: string, input: HabitInput): Habit {
  const db = load(userId);
  const habit = buildHabit(userId, input);
  db.habits.push(habit);
  persist(userId, db);
  return habit;
}

export function updateLocalHabit(userId: string, habitId: string, input: HabitInput): Habit | null {
  const db = load(userId);
  const idx = db.habits.findIndex(h => h.id === habitId);
  if (idx === -1) return null;
  const days = input.kind === 'non_negotiable' ? [...DAY_KEYS] : input.days;
  const habit: Habit = {
    ...db.habits[idx],
    name: input.name.trim(),
    description: input.description?.trim() || null,
    vector: input.vector,
    kind: input.kind,
    frequency: frequencyFor(input.kind, days),
    schedule_days: days,
    schedule_time: input.time || null,
    target_value: input.rule === 'binary' ? null : input.target_value,
    target_unit: input.rule === 'binary' ? null : input.target_unit,
    completion_rule: input.rule,
    updated_at: new Date().toISOString(),
  };
  db.habits[idx] = habit;
  persist(userId, db);
  return habit;
}

export function setLocalStatus(userId: string, habitId: string, status: Habit['status']): boolean {
  const db = load(userId);
  const habit = db.habits.find(h => h.id === habitId);
  if (!habit) return false;
  habit.status = status;
  habit.updated_at = new Date().toISOString();
  persist(userId, db);
  return true;
}

export function deleteLocalHabit(userId: string, habitId: string): boolean {
  const db = load(userId);
  db.habits = db.habits.filter(h => h.id !== habitId);
  db.checkIns = db.checkIns.filter(c => c.habit_id !== habitId);
  persist(userId, db);
  return true;
}

export function saveLocalCheckIn(
  userId: string,
  habitId: string,
  date: string,
  status: CheckInStatus,
  value: number | null,
  note: string | null = null,
): HabitCheckIn {
  const db = load(userId);
  const idx = db.checkIns.findIndex(c => c.habit_id === habitId && c.scheduled_date === date);
  const row: HabitCheckIn = {
    habit_id: habitId,
    scheduled_date: date,
    status,
    completion_value: value,
    note,
  };
  if (idx >= 0) db.checkIns[idx] = { ...db.checkIns[idx], ...row };
  else db.checkIns.push(row);
  persist(userId, db);
  return row;
}
