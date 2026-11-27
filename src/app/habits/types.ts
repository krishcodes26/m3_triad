/**
 * Habit protocol types and calculations.
 *
 * Product model:
 *   • Non-negotiable — a daily protocol you refuse to skip.
 *   • Habit          — a recurring protocol on chosen days of the week.
 *
 * Both are stored in the existing `habits` table. `schedule_days` keeps a small
 * JSON envelope so the kind survives a round-trip without a schema change:
 *   { kind: 'non_negotiable' | 'habit', days: ['mon', ...] }
 * Legacy plain strings ("mon,wed") are still parsed.
 */

export type Vector = 'mind' | 'muscle' | 'money';
export type HabitKind = 'non_negotiable' | 'habit';
export type HabitFrequency = 'daily' | 'weekly';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type CompletionRule = 'binary' | 'count' | 'duration';
export type CheckInStatus = 'pending' | 'completed' | 'skipped';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  vector: Vector;
  kind: HabitKind;
  frequency: HabitFrequency;
  schedule_days: string[];        // [] = every day
  schedule_time: string | null;   // HH:MM
  target_value: number | null;
  target_unit: string | null;
  completion_rule: CompletionRule;
  status: HabitStatus;
  created_at: string;
  updated_at: string;
}

export interface HabitCheckIn {
  habit_id: string;
  scheduled_date: string;         // YYYY-MM-DD
  status: CheckInStatus;
  completion_value: number | null;
  note: string | null;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  lifetimeHits: number;
  adherence30: number | null;     // 0–100, null when nothing was scheduled
}

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export const VECTOR_LABELS: Record<Vector, string> = {
  mind: 'Mind', muscle: 'Muscle', money: 'Money',
};

/** XP yield for a completed protocol. Non-negotiables carry a small premium. */
export function habitXp(habit: Pick<Habit, 'kind'>): number {
  return habit.kind === 'non_negotiable' ? 25 : 20;
}

/* ── Date helpers (local calendar, ISO keys) ─────────────────────────────── */

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, offset: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + offset);
  return dateKey(d);
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function weekdayKey(key: string): DayKey {
  // JS: 0 = Sunday. DAY_KEYS starts on Monday.
  return DAY_KEYS[(parseDateKey(key).getDay() + 6) % 7];
}

export function formatDateLong(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateShort(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ── Schedule ────────────────────────────────────────────────────────────── */

export function isDue(habit: Habit, key: string): boolean {
  if (habit.status !== 'active') return false;
  if (habit.kind === 'non_negotiable') return true;
  if (habit.frequency === 'daily' || habit.schedule_days.length === 0) return true;
  return habit.schedule_days.includes(weekdayKey(key));
}

export function scheduleLabel(habit: Habit): string {
  if (habit.kind === 'non_negotiable') return 'Every day';
  if (habit.frequency === 'daily' || habit.schedule_days.length === 7) return 'Every day';
  if (habit.schedule_days.length === 0) return 'Every day';
  const days = DAY_KEYS.filter(d => habit.schedule_days.includes(d));
  if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Weekdays';
  if (days.length === 2 && days.includes('sat') && days.includes('sun')) return 'Weekends';
  return days.map(d => DAY_LABELS[d]).join(' · ');
}

export function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

/* ── Check-in lookup + progress ──────────────────────────────────────────── */

export type CheckInMap = Map<string, HabitCheckIn>;

export function checkInMap(checkIns: HabitCheckIn[]): CheckInMap {
  const map: CheckInMap = new Map();
  for (const c of checkIns) map.set(`${c.habit_id}|${c.scheduled_date}`, c);
  return map;
}

export function checkInFor(habitId: string, key: string, map: CheckInMap): HabitCheckIn | null {
  return map.get(`${habitId}|${key}`) ?? null;
}

export function isComplete(checkIn: HabitCheckIn | null): boolean {
  return checkIn?.status === 'completed';
}

export function completionValue(habit: Habit, checkIn: HabitCheckIn | null): number {
  if (!checkIn) return 0;
  if (checkIn.completion_value != null) return Number(checkIn.completion_value);
  return checkIn.status === 'completed' ? (habit.target_value ?? 1) : 0;
}

export function targetFor(habit: Habit): number {
  return habit.target_value && habit.target_value > 0 ? habit.target_value : 1;
}

export function progressPct(habit: Habit, checkIn: HabitCheckIn | null): number {
  if (isComplete(checkIn)) return 100;
  const target = targetFor(habit);
  return Math.max(0, Math.min(100, Math.round((completionValue(habit, checkIn) / target) * 100)));
}

/** Due date keys between two inclusive ISO dates (clamped to when the habit existed). */
export function dueDates(habit: Habit, start: string, end: string): string[] {
  const out: string[] = [];
  const created = dateKey(new Date(habit.created_at));
  let cursor = created > start ? created : start;
  if (cursor > end) return out;
  let guard = 0;
  while (cursor <= end && guard < 400) {
    if (isDue(habit, cursor)) out.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return out;
}

/* ── Streaks and adherence ───────────────────────────────────────────────── */

/**
 * Current streak: consecutive scheduled occurrences completed, walking back
 * from today. Today is optional while it is still pending — an unfinished
 * today does not break a streak that was intact yesterday.
 */
export function currentStreak(habit: Habit, map: CheckInMap, today = todayKey()): number {
  let streak = 0;
  let cursor = today;
  let guard = 0;
  let first = true;

  while (guard < 400) {
    const due = isDue(habit, cursor);
    if (due) {
      const done = isComplete(checkInFor(habit.id, cursor, map));
      if (done) {
        streak += 1;
      } else if (first) {
        // Today not yet checked in — keep looking backwards.
      } else {
        break;
      }
    }
    first = false;
    cursor = addDays(cursor, -1);
    guard += 1;
    // Do not walk back before the habit existed.
    if (cursor < dateKey(new Date(habit.created_at))) break;
  }
  return streak;
}

export function bestStreak(habit: Habit, map: CheckInMap, today = todayKey()): number {
  let best = 0;
  let run = 0;
  let cursor = dateKey(new Date(habit.created_at));
  let guard = 0;
  while (cursor <= today && guard < 400) {
    if (isDue(habit, cursor)) {
      if (isComplete(checkInFor(habit.id, cursor, map))) {
        run += 1;
        if (run > best) best = run;
      } else if (cursor !== today) {
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return best;
}

export function lifetimeHits(habitId: string, checkIns: HabitCheckIn[]): number {
  return checkIns.filter(c => c.habit_id === habitId && c.status === 'completed').length;
}

/** Completed due occurrences / due occurrences across a window. */
export function adherenceFor(
  habits: Habit[],
  checkIns: HabitCheckIn[],
  start: string,
  end: string,
): number | null {
  const map = checkInMap(checkIns);
  let due = 0;
  let done = 0;
  for (const habit of habits) {
    for (const key of dueDates(habit, start, end)) {
      due += 1;
      if (isComplete(checkInFor(habit.id, key, map))) done += 1;
    }
  }
  if (due === 0) return null;
  return Math.round((done / due) * 1000) / 10;
}

export function habitStats(habit: Habit, checkIns: HabitCheckIn[], today = todayKey()): HabitStats {
  const map = checkInMap(checkIns);
  return {
    currentStreak: currentStreak(habit, map, today),
    bestStreak: bestStreak(habit, map, today),
    lifetimeHits: lifetimeHits(habit.id, checkIns),
    adherence30: adherenceFor([habit], checkIns, addDays(today, -29), today),
  };
}

/** 30-day completion squares, oldest → newest. */
export function consistencyGrid(habit: Habit, map: CheckInMap, today = todayKey()) {
  const liveToday = todayKey();
  return Array.from({ length: 30 }, (_, i) => {
    const key = addDays(today, -(29 - i));
    return {
      key,
      due: isDue(habit, key),
      done: isComplete(checkInFor(habit.id, key, map)),
      // An unfinished today is still open, not a miss.
      open: key === liveToday && !isComplete(checkInFor(habit.id, key, map)),
    };
  });
}

/* ── Encoding schedule_days for the existing habits table ────────────────── */

export function encodeSchedule(kind: HabitKind, days: DayKey[]): string {
  const normalized = kind === 'non_negotiable' ? [...DAY_KEYS] : days;
  return JSON.stringify({ kind, days: normalized });
}

export function decodeSchedule(raw: string | null, frequency?: string | null): { kind: HabitKind; days: string[] } {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.days)) {
        const days = parsed.days.filter((d: unknown) => typeof d === 'string') as string[];
        const kind: HabitKind = parsed.kind === 'habit' ? 'habit' : 'non_negotiable';
        return { kind, days };
      }
    } catch {
      // Legacy comma-separated value.
      const days = raw.split(',').map(d => d.trim()).filter(Boolean);
      return { kind: frequency === 'daily' ? 'non_negotiable' : 'habit', days };
    }
  }
  return { kind: frequency === 'daily' ? 'non_negotiable' : 'habit', days: [] };
}

export function frequencyFor(kind: HabitKind, days: string[]): HabitFrequency {
  if (kind === 'non_negotiable') return 'daily';
  return days.length === 0 || days.length === 7 ? 'daily' : 'weekly';
}
