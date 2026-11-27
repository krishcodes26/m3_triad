/**
 * Local demo data for habit protocols.
 *
 * Mirrors `src/lib/demo/quests.ts`: seeded on first use, persisted in
 * localStorage, fully interactive. The seed includes ~45 days of check-ins so
 * streaks, adherence and the 30-day grid are meaningful in design review.
 */

import type {
  CheckInStatus, CompletionRule, DayKey, Habit, HabitCheckIn, HabitKind, Vector,
} from '@/app/habits/types';
import {
  addDays, dateKey, DAY_KEYS, encodeSchedule, frequencyFor, isDue, todayKey,
} from '@/app/habits/types';

export interface HabitInput {
  name: string;
  description: string | null;
  vector: Vector;
  kind: HabitKind;
  days: DayKey[];
  time: string | null;
  rule: CompletionRule;
  target_value: number | null;
  target_unit: string | null;
}

export interface HabitsSnapshot {
  habits: Habit[];
  checkIns: HabitCheckIn[];
}

interface DemoDb extends HabitsSnapshot {
  version: number;
}

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'm3triad:demo-habits-db';

let cache: DemoDb | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function load(): DemoDb {
  if (cache) return cache;
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoDb;
        if (parsed?.version === SCHEMA_VERSION && Array.isArray(parsed.habits)) {
          cache = parsed;
          return cache;
        }
      }
    } catch {
      /* corrupt or blocked storage — reseed */
    }
  }
  cache = seed();
  persist(cache);
  return cache;
}

function persist(db: DemoDb): void {
  cache = db;
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked — in-memory still works */
  }
}

export function resetDemoHabits(): void {
  cache = seed();
  persist(cache);
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `habit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function stamp(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}

/* ════════════════════════════════════════════════════════════════════════
   SEED
   ════════════════════════════════════════════════════════════════════════ */

interface SeedHabit extends Omit<HabitInput, 'days'> {
  id: string;
  days: DayKey[];
  misses: number[];          // days ago offsets that were missed
  today?: { value: number; status: CheckInStatus; note?: string };
}

const SEED: SeedHabit[] = [
  {
    id: 'habit-read-10-pages',
    name: 'Read 10 Pages',
    description: 'Finished chapter of the current book; notes captured in the reading log.',
    vector: 'mind',
    kind: 'non_negotiable',
    days: [],
    time: '21:00',
    rule: 'count',
    target_value: 10,
    target_unit: 'pages',
    misses: [15, 26],
    today: { value: 6, status: 'pending' },
  },
  {
    id: 'habit-sleep-target',
    name: 'Sleep Target 7h 30m+',
    description: 'Lights out by 22:45. Duration synced from the sleep log.',
    vector: 'muscle',
    kind: 'non_negotiable',
    days: [],
    time: '07:00',
    rule: 'duration',
    target_value: 450,
    target_unit: 'min',
    misses: [8],
  },
  {
    id: 'habit-hydration',
    name: 'Hydration Benchmark',
    description: '2,500 ml baseline. Log each bottle as it is finished.',
    vector: 'muscle',
    kind: 'non_negotiable',
    days: [],
    time: '14:00',
    rule: 'count',
    target_value: 3000,
    target_unit: 'ml',
    misses: [4],
    today: { value: 3000, status: 'completed', note: 'Two bottles + one with lunch.' },
  },
  {
    id: 'habit-deep-work',
    name: 'Deep Work Focus Block',
    description: 'One uninterrupted block. Phone in another room. No ambient input.',
    vector: 'mind',
    kind: 'non_negotiable',
    days: [],
    time: '09:00',
    rule: 'duration',
    target_value: 120,
    target_unit: 'min',
    misses: [2, 7, 19],
    today: { value: 45, status: 'pending' },
  },
  {
    id: 'habit-business-action',
    name: 'High-Leverage Business Action',
    description: 'One action that compounds: outreach, publishing, or shipping.',
    vector: 'money',
    kind: 'non_negotiable',
    days: [],
    time: '09:30',
    rule: 'binary',
    target_value: null,
    target_unit: null,
    misses: [5, 11],
  },
  {
    id: 'habit-workout',
    name: 'Complete Planned Workout',
    description: 'Linked routine: hypertrophy push block. Log every working set.',
    vector: 'muscle',
    kind: 'habit',
    days: ['mon', 'wed', 'fri'],
    time: '06:30',
    rule: 'binary',
    target_value: null,
    target_unit: null,
    misses: [6, 13],
  },
  {
    id: 'habit-architecture-study',
    name: 'System Architecture Study',
    description: 'Read one chapter or diagram one distributed-system pattern.',
    vector: 'mind',
    kind: 'habit',
    days: ['tue', 'thu'],
    time: '20:30',
    rule: 'duration',
    target_value: 30,
    target_unit: 'min',
    misses: [8, 16],
  },
  {
    id: 'habit-weekly-review',
    name: 'Weekly Review & Reset',
    description: 'Close the week: metrics, next week’s one priority, calendar reset.',
    vector: 'money',
    kind: 'habit',
    days: ['sun'],
    time: '16:00',
    rule: 'binary',
    target_value: null,
    target_unit: null,
    misses: [],
  },
  {
    id: 'habit-zone-2',
    name: 'Zone 2 Cardio',
    description: 'Conversational pace. Keep heart rate in zone 2 for the full block.',
    vector: 'muscle',
    kind: 'habit',
    days: ['tue', 'sat'],
    time: '07:30',
    rule: 'duration',
    target_value: 45,
    target_unit: 'min',
    misses: [4, 12],
  },
];

function seed(): DemoDb {
  const today = todayKey();
  const habits: Habit[] = [];
  const checkIns: HabitCheckIn[] = [];

  for (const s of SEED) {
    const days = s.kind === 'non_negotiable' ? [...DAY_KEYS] : s.days;
    const habit: Habit = {
      id: s.id,
      user_id: '00000000-0000-4000-8000-000000000001',
      name: s.name,
      description: s.description,
      vector: s.vector,
      kind: s.kind,
      frequency: frequencyFor(s.kind, days),
      schedule_days: days,
      schedule_time: s.time,
      target_value: s.target_value,
      target_unit: s.target_unit,
      completion_rule: s.rule,
      status: 'active',
      created_at: stamp(60),
      updated_at: stamp(0),
    };
    habits.push(habit);

    // 45 days of history, excluding today.
    for (let offset = 45; offset >= 1; offset -= 1) {
      const key = addDays(today, -offset);
      if (!isDue(habit, key)) continue;
      if (s.misses.includes(offset)) continue;
      checkIns.push({
        habit_id: habit.id,
        scheduled_date: key,
        status: 'completed',
        completion_value: s.target_value ?? 1,
        note: null,
      });
    }

    if (s.today) {
      checkIns.push({
        habit_id: habit.id,
        scheduled_date: today,
        status: s.today.status,
        completion_value: s.today.value,
        note: s.today.note ?? null,
      });
    }
  }

  return { version: SCHEMA_VERSION, habits, checkIns };
}

/* ════════════════════════════════════════════════════════════════════════
   API
   ════════════════════════════════════════════════════════════════════════ */

export async function getHabits(userId: string): Promise<HabitsSnapshot> {
  const db = load();
  return {
    habits: db.habits.map(h => ({ ...h, user_id: userId })),
    checkIns: db.checkIns.map(c => ({ ...c })),
  };
}

export async function createHabit(userId: string, input: HabitInput): Promise<Habit | null> {
  const db = load();
  const days = input.kind === 'non_negotiable' ? [...DAY_KEYS] : input.days;
  const habit: Habit = {
    id: newId(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.habits.push(habit);
  persist(db);
  return habit;
}

export async function updateHabit(habitId: string, input: HabitInput): Promise<Habit | null> {
  const db = load();
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
  persist(db);
  return habit;
}

export async function saveCheckIn(
  habitId: string,
  date: string,
  status: CheckInStatus,
  value: number | null,
  note: string | null = null,
): Promise<HabitCheckIn | null> {
  const db = load();
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
  persist(db);
  return row;
}

export async function setHabitStatus(habitId: string, status: Habit['status']): Promise<boolean> {
  const db = load();
  const habit = db.habits.find(h => h.id === habitId);
  if (!habit) return false;
  habit.status = status;
  habit.updated_at = new Date().toISOString();
  persist(db);
  return true;
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  const db = load();
  db.habits = db.habits.filter(h => h.id !== habitId);
  db.checkIns = db.checkIns.filter(c => c.habit_id !== habitId);
  persist(db);
  return true;
}

/** Helper used by the page when previewing a template schedule. */
export function previewSchedule(kind: HabitKind, days: DayKey[]): string {
  return encodeSchedule(kind, days);
}
