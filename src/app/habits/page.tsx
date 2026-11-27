'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import AppShell from '@/components/layouts/AppShell';
import {
  createHabit, deleteHabit, getHabits, isLocalHabitId, saveCheckIn, setHabitStatus, updateHabit,
} from './data';
import type { HabitInput } from './data';
import {
  DAY_KEYS, DAY_LABELS, VECTOR_LABELS, addDays, adherenceFor, checkInFor, checkInMap,
  completionValue, consistencyGrid, currentStreak, formatDateShort, formatTime,
  habitStats, habitXp, isComplete, isDue, progressPct, scheduleLabel, targetFor, todayKey,
} from './types';
import type {
  CheckInStatus, CompletionRule, DayKey, Habit, HabitCheckIn, HabitKind, Vector,
} from './types';
import styles from './page.module.css';

/* ════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════════════════ */

const VECTORS: Vector[] = ['mind', 'muscle', 'money'];

const TEMPLATES: HabitInput[] = [
  {
    name: '2-Hour Deep Work Sprint',
    description: 'One uninterrupted block. Phone in another room. No ambient input.',
    vector: 'mind',
    kind: 'habit',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    time: '09:00',
    rule: 'duration',
    target_value: 120,
    target_unit: 'min',
  },
  {
    name: 'Hydration Benchmark',
    description: 'Baseline water target for the day. Log bottles as they are finished.',
    vector: 'muscle',
    kind: 'non_negotiable',
    days: [...DAY_KEYS],
    time: '14:00',
    rule: 'count',
    target_value: 3000,
    target_unit: 'ml',
  },
  {
    name: 'Daily Revenue Action',
    description: 'One action that compounds: outreach, publishing, or shipping.',
    vector: 'money',
    kind: 'non_negotiable',
    days: [...DAY_KEYS],
    time: '09:30',
    rule: 'binary',
    target_value: null,
    target_unit: null,
  },
  {
    name: 'Workout Adherence',
    description: 'Complete the planned training block and log every working set.',
    vector: 'muscle',
    kind: 'habit',
    days: ['mon', 'wed', 'fri'],
    time: '06:30',
    rule: 'binary',
    target_value: null,
    target_unit: null,
  },
];

interface FormState {
  kind: HabitKind;
  name: string;
  description: string;
  vector: Vector;
  days: DayKey[];
  time: string;
  rule: CompletionRule;
  target: string;
  unit: string;
}

function blankForm(): FormState {
  return {
    kind: 'non_negotiable',
    name: '',
    description: '',
    vector: 'mind',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    time: '',
    rule: 'binary',
    target: '',
    unit: '',
  };
}

function formFromHabit(habit: Habit): FormState {
  return {
    kind: habit.kind,
    name: habit.name,
    description: habit.description ?? '',
    vector: habit.vector,
    days: habit.schedule_days.filter((d): d is DayKey => DAY_KEYS.includes(d as DayKey)),
    time: habit.schedule_time ?? '',
    rule: habit.completion_rule,
    target: habit.target_value != null ? String(habit.target_value) : '',
    unit: habit.target_unit ?? '',
  };
}

function formFromTemplate(template: HabitInput): FormState {
  return {
    kind: template.kind,
    name: template.name,
    description: template.description ?? '',
    vector: template.vector,
    days: template.days,
    time: template.time ?? '',
    rule: template.rule,
    target: template.target_value != null ? String(template.target_value) : '',
    unit: template.target_unit ?? '',
  };
}

/* ════════════════════════════════════════════════════════════════════════
   SMALL HELPERS
   ════════════════════════════════════════════════════════════════════════ */

function upsertCheckIn(list: HabitCheckIn[], row: HabitCheckIn): HabitCheckIn[] {
  const idx = list.findIndex(c => c.habit_id === row.habit_id && c.scheduled_date === row.scheduled_date);
  if (idx === -1) return [...list, row];
  const next = [...list];
  next[idx] = { ...next[idx], ...row };
  return next;
}

function gradeFor(pct: number | null): string {
  if (pct == null) return '—';
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'E';
}

function compactCode(id: string): string {
  return `#HAB-${id.replace(/[^a-z0-9]/gi, '').slice(-3).toUpperCase()}`;
}

function templateSchedule(template: HabitInput): string {
  if (template.kind === 'non_negotiable' || template.days.length === 7) return 'Daily';
  if (template.days.length === 5 && !template.days.includes('sat') && !template.days.includes('sun')) {
    return 'Weekdays';
  }
  return DAY_KEYS.filter(day => template.days.includes(day)).map(day => DAY_LABELS[day]).join(' · ');
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function HabitsPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vectorFilter, setVectorFilter] = useState<'all' | Vector>('all');
  const [kindFilter, setKindFilter] = useState<'all' | HabitKind>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'paused'>('active');
  const [sortBy, setSortBy] = useState<'time' | 'streak' | 'name'>('time');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const templatesRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const today = todayKey();

  /* ── Auth + load ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!authLoading && !session) router.push('/auth/login');
  }, [authLoading, session, router]);

  const loadHabits = useCallback(async () => {
    if (!session?.user.id) return;
    setLoading(true);
    setError('');
    try {
      const snapshot = await getHabits(session.user.id);
      setHabits(snapshot.habits);
      setCheckIns(snapshot.checkIns);
      setSelectedId(prev => {
        if (prev && snapshot.habits.some(h => h.id === prev)) return prev;
        return snapshot.habits[0]?.id ?? null;
      });
    } catch {
      setError('Could not load your protocols. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (session) void loadHabits();
  }, [session, loadHabits]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Modal lifecycle ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => nameRef.current?.focus(), 30);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [modalOpen]);

  function openCreate(template?: HabitInput) {
    setEditing(null);
    setForm(template ? formFromTemplate(template) : blankForm());
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditing(habit);
    setForm(formFromHabit(habit));
    setFormError('');
    setModalOpen(true);
  }

  /* ── Derived collections ─────────────────────────────────────────────── */

  const map = useMemo(() => checkInMap(checkIns), [checkIns]);

  const activeHabits = useMemo(() => habits.filter(h => h.status === 'active'), [habits]);

  const duePool = useMemo(() => {
    return habits.filter(habit => {
      if (habit.status !== statusFilter) return false;
      // Paused protocols stay visible regardless of today's schedule so they
      // can be managed and resumed.
      if (statusFilter === 'paused') return true;
      return isDue(habit, selectedDate);
    });
  }, [habits, statusFilter, selectedDate]);

  const visibleHabits = useMemo(() => {
    const filtered = duePool.filter(habit => {
      if (vectorFilter !== 'all' && habit.vector !== vectorFilter) return false;
      if (kindFilter !== 'all' && habit.kind !== kindFilter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'streak') {
        return currentStreak(b, map, selectedDate) - currentStreak(a, map, selectedDate);
      }
      return (a.schedule_time ?? '99:99').localeCompare(b.schedule_time ?? '99:99')
        || a.name.localeCompare(b.name);
    });
  }, [duePool, vectorFilter, kindFilter, sortBy, map, selectedDate]);

  const nonNegotiables = visibleHabits.filter(h => h.kind === 'non_negotiable');
  const recurringHabits = visibleHabits.filter(h => h.kind === 'habit');

  /* ── KPI calculations ────────────────────────────────────────────────── */

  const dueOnSelected = useMemo(
    () => activeHabits.filter(h => isDue(h, selectedDate)),
    [activeHabits, selectedDate],
  );

  const completedOnSelected = useMemo(
    () => dueOnSelected.filter(h => isComplete(checkInFor(h.id, selectedDate, map))),
    [dueOnSelected, map, selectedDate],
  );

  const cadencePct = dueOnSelected.length
    ? Math.round((completedOnSelected.length / dueOnSelected.length) * 100)
    : 0;

  const xpOnSelected = completedOnSelected.reduce((sum, h) => sum + habitXp(h), 0);

  const xpByVector = useMemo(() => {
    const result: Record<Vector, number> = { mind: 0, muscle: 0, money: 0 };
    for (const habit of completedOnSelected) result[habit.vector] += habitXp(habit);
    return result;
  }, [completedOnSelected]);

  const streaks = useMemo(() => {
    return activeHabits.map(h => ({
      current: currentStreak(h, map, selectedDate),
      best: habitStats(h, checkIns, selectedDate).bestStreak,
    }));
  }, [activeHabits, map, checkIns, selectedDate]);

  const maxStreak = streaks.reduce((max, s) => Math.max(max, s.current), 0);
  const bestOverall = streaks.reduce((max, s) => Math.max(max, s.best), 0);

  const adherence7 = adherenceFor(activeHabits, checkIns, addDays(selectedDate, -6), selectedDate);
  const adherencePrev7 = adherenceFor(activeHabits, checkIns, addDays(selectedDate, -13), addDays(selectedDate, -7));
  const adherenceDelta =
    adherence7 != null && adherencePrev7 != null
      ? Math.round((adherence7 - adherencePrev7) * 10) / 10
      : null;

  const weekBars = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDays(selectedDate, -(6 - i));
      const due = activeHabits.filter(h => isDue(h, key));
      const done = due.filter(h => isComplete(checkInFor(h.id, key, map)));
      return {
        key,
        due: due.length,
        done: done.length,
        ratio: due.length ? done.length / due.length : null,
      };
    });
  }, [activeHabits, selectedDate, map]);

  const selectedHabit =
    habits.find(h => h.id === selectedId)
    ?? visibleHabits[0]
    ?? habits[0]
    ?? null;

  const telemetry = useMemo(() => {
    if (!selectedHabit) return null;
    // A paused protocol keeps its history visible; evaluate the schedule as
    // active so streaks and the 30-day grid do not collapse to zero.
    const statHabit = selectedHabit.status === 'active'
      ? selectedHabit
      : { ...selectedHabit, status: 'active' as const };
    return {
      stats: habitStats(statHabit, checkIns, selectedDate),
      grid: consistencyGrid(statHabit, map, selectedDate),
      checkIn: checkInFor(selectedHabit.id, selectedDate, map),
    };
  }, [selectedHabit, checkIns, selectedDate, map]);

  const vectorIntegrity = useMemo(() => {
    return VECTORS.map(vector => {
      const list = activeHabits.filter(h => h.vector === vector);
      return {
        vector,
        count: list.length,
        adherence: adherenceFor(list, checkIns, addDays(selectedDate, -29), selectedDate),
      };
    });
  }, [activeHabits, checkIns, selectedDate]);

  /* ── Mutations ───────────────────────────────────────────────────────── */

  async function toggleCompletion(habit: Habit) {
    if (!session?.user.id) return;
    const key = `${habit.id}|${selectedDate}`;
    const existing = map.get(key) ?? null;
    const done = isComplete(existing);
    const value = done ? 0 : targetFor(habit);

    setBusy(key);
    const saved = await saveCheckIn(
      session.user.id,
      habit.id,
      selectedDate,
      done ? 'pending' : 'completed',
      value,
      existing?.note ?? null,
    );
    setBusy(null);

    if (!saved) {
      setToast({ type: 'error', message: 'Could not save that check-in. Try again.' });
      return;
    }
    setCheckIns(prev => upsertCheckIn(prev, saved));
    setSelectedId(habit.id);
    if (!done) {
      setToast({ type: 'success', message: `${habit.name} checked in · +${habitXp(habit)} XP preview` });
    }
  }

  async function adjustProgress(habit: Habit, delta: number) {
    if (!session?.user.id) return;
    const key = `${habit.id}|${selectedDate}`;
    const existing = map.get(key) ?? null;
    const current = completionValue(habit, existing);
    const target = targetFor(habit);
    const next = Math.max(0, Math.min(target, current + delta));
    const status: CheckInStatus = next >= target ? 'completed' : 'pending';

    setBusy(`${key}|${delta}`);
    const saved = await saveCheckIn(session.user.id, habit.id, selectedDate, status, next, existing?.note ?? null);
    setBusy(null);

    if (!saved) {
      setToast({ type: 'error', message: 'Could not save progress. Try again.' });
      return;
    }
    setCheckIns(prev => upsertCheckIn(prev, saved));
    setSelectedId(habit.id);
  }

  async function toggleStatus(habit: Habit) {
    if (!session?.user.id) return;
    const next = habit.status === 'active' ? 'paused' : 'active';
    setBusy(`${habit.id}|status`);
    const ok = await setHabitStatus(session.user.id, habit.id, next);
    setBusy(null);
    if (!ok) {
      setToast({ type: 'error', message: 'Could not update that protocol.' });
      return;
    }
    setHabits(prev => prev.map(h => (h.id === habit.id ? { ...h, status: next } : h)));
    setToast({
      type: 'success',
      message: next === 'paused' ? `${habit.name} paused.` : `${habit.name} resumed.`,
    });
  }

  async function removeHabit(habit: Habit) {
    if (!session?.user.id) return;
    const confirmed = window.confirm(
      `Delete “${habit.name}”? Its check-in history will be removed too. This cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(`${habit.id}|delete`);
    const ok = await deleteHabit(session.user.id, habit.id);
    setBusy(null);
    if (!ok) {
      setToast({ type: 'error', message: 'Could not delete that protocol.' });
      return;
    }
    setHabits(prev => prev.filter(h => h.id !== habit.id));
    setCheckIns(prev => prev.filter(c => c.habit_id !== habit.id));
    setSelectedId(prev => (prev === habit.id ? null : prev));
    setToast({ type: 'success', message: `${habit.name} deleted.` });
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user.id) return;

    const name = form.name.trim();
    if (name.length < 2) {
      setFormError('Give the protocol a name (at least 2 characters).');
      return;
    }
    if (form.kind === 'habit' && form.days.length === 0) {
      setFormError('Choose at least one day for a recurring habit.');
      return;
    }

    let target: number | null = null;
    if (form.rule !== 'binary') {
      const parsed = Number(form.target);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setFormError('Enter a target greater than zero, or switch to a binary completion rule.');
        return;
      }
      target = parsed;
    }

    const input: HabitInput = {
      name,
      description: form.description.trim() || null,
      vector: form.vector,
      kind: form.kind,
      days: form.kind === 'non_negotiable' ? [...DAY_KEYS] : form.days,
      time: form.time || null,
      rule: form.rule,
      target_value: form.rule === 'binary' ? null : target,
      target_unit: form.rule === 'binary' ? null : (form.unit.trim() || (form.rule === 'duration' ? 'min' : null)),
    };

    setSaving(true);
    setFormError('');
    const saved = editing
      ? await updateHabit(session.user.id, editing.id, input)
      : await createHabit(session.user.id, input);
    setSaving(false);

    if (!saved) {
      setFormError('Could not save the protocol. Check your connection and try again.');
      return;
    }

    const savedLocally = isLocalHabitId(saved.id);
    if (editing) {
      setHabits(prev => prev.map(h => (h.id === saved.id ? saved : h)));
      setToast({
        type: 'success',
        message: savedLocally ? 'Protocol updated on this device — cloud sync unavailable.' : 'Protocol updated.',
      });
    } else {
      setHabits(prev => [...prev, saved]);
      setToast({
        type: 'success',
        message: savedLocally ? 'Protocol saved on this device — cloud sync unavailable.' : 'Protocol created.',
      });
    }
    setSelectedId(saved.id);
    setModalOpen(false);
    setEditing(null);
    setForm(blankForm());
  }

  function shiftDate(delta: number) {
    const next = addDays(selectedDate, delta);
    if (next > today) return;
    setSelectedDate(next);
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  if (authLoading) return null;
  if (!session) return null;

  const isToday = selectedDate === today;
  const localCount = habits.filter(h => isLocalHabitId(h.id)).length;
  const filterCount = (vector: 'all' | Vector) =>
    habits.filter(h => h.status === statusFilter
      && (vector === 'all' || h.vector === vector)
      && (kindFilter === 'all' || h.kind === kindFilter)).length;
  const typeCount = (kind: 'all' | HabitKind) =>
    habits.filter(h => h.status === statusFilter && (kind === 'all' || h.kind === kind)).length;

  return (
    <AppShell>
      <div className={styles.page}>

        {/* Page header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>Protocol engine v2.4 // active session</span>
            <h1 className={styles.pageTitle}>Habit protocols &amp; momentum</h1>
            <p className={styles.pageSubtitle}>
              Track the standards you refuse to skip and the practices you repeat on purpose.
              Every check-in writes one dated record.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => templatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <IconGrid /> Browse templates
            </button>
            <button type="button" className="btn-primary" onClick={() => openCreate()}>
              <IconPlus /> Create protocol
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup} role="group" aria-label="Filter by vector">
            <button
              type="button"
              className={`${styles.filterTab} ${vectorFilter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => setVectorFilter('all')}
              aria-pressed={vectorFilter === 'all'}
            >
              All <span className={styles.filterCount}>{filterCount('all')}</span>
            </button>
            {VECTORS.map(vector => (
              <button
                key={vector}
                type="button"
                className={`${styles.filterTab} ${styles[`filterTab${vector[0].toUpperCase()}${vector.slice(1)}`]} ${vectorFilter === vector ? styles.filterTabActive : ''}`}
                onClick={() => setVectorFilter(vector)}
                aria-pressed={vectorFilter === vector}
              >
                <span className={`${styles.dot} ${styles[`dot${vector[0].toUpperCase()}${vector.slice(1)}`]}`} aria-hidden />
                {VECTOR_LABELS[vector]}
                <span className={styles.filterCount}>{filterCount(vector)}</span>
              </button>
            ))}
          </div>

          <div className={styles.filterGroup} role="group" aria-label="Filter by protocol type">
            {([
              ['all', 'All types'],
              ['non_negotiable', 'Non-negotiables'],
              ['habit', 'Habits'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${styles.typeTab} ${kindFilter === value ? styles.typeTabActive : ''}`}
                onClick={() => setKindFilter(value)}
                aria-pressed={kindFilter === value}
              >
                {label}
                {value !== 'all' && <span className={styles.filterCount}>{typeCount(value)}</span>}
              </button>
            ))}
          </div>

          <div className={styles.filterGroup} role="group" aria-label="Filter by status">
            <button
              type="button"
              className={`${styles.statusTab} ${statusFilter === 'active' ? styles.statusTabActive : ''}`}
              onClick={() => setStatusFilter('active')}
              aria-pressed={statusFilter === 'active'}
            >
              Active <span className={styles.filterCount}>{habits.filter(h => h.status === 'active').length}</span>
            </button>
            <button
              type="button"
              className={`${styles.statusTab} ${statusFilter === 'paused' ? styles.statusTabActive : ''}`}
              onClick={() => setStatusFilter('paused')}
              aria-pressed={statusFilter === 'paused'}
            >
              Paused <span className={styles.filterCount}>{habits.filter(h => h.status === 'paused').length}</span>
            </button>
          </div>

          <label className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort</span>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={event => setSortBy(event.target.value as typeof sortBy)}
            >
              <option value="time">Time of day</option>
              <option value="streak">Streak (high first)</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
        </div>

        {localCount > 0 && (
          <div className={styles.localNotice} role="status">
            <IconInfo />
            <span>
              Cloud sync is unavailable. {localCount} {localCount === 1 ? 'protocol is' : 'protocols are'} saved
              on this device; their check-ins stay local until the connection is restored.
            </span>
          </div>
        )}

        {/* KPI row */}
        <section className={styles.kpis} aria-label="Protocol summary">
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Today’s cadence</span>
              <span className={styles.kpiIcon}><IconShield /></span>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={`${styles.kpiValue} display-kpi`}>{completedOnSelected.length}</span>
              <span className={styles.kpiDivider}>/</span>
              <span className={styles.kpiTotal}>{dueOnSelected.length}</span>
              <span className={styles.kpiUnit}>protocols</span>
            </div>
            <div className={styles.kpiTrack} role="progressbar" aria-valuenow={cadencePct} aria-valuemin={0} aria-valuemax={100} aria-label={`${completedOnSelected.length} of ${dueOnSelected.length} protocols complete`}>
              <span className={styles.kpiFillGreen} style={{ width: `${cadencePct}%` }} />
            </div>
            <div className={styles.kpiFoot}>
              <span>{Math.max(0, dueOnSelected.length - completedOnSelected.length)} remaining {isToday ? 'today' : 'on this day'}</span>
              <span className={styles.kpiFootAccent}>est. +{xpOnSelected} XP</span>
            </div>
          </article>

          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Streak momentum</span>
              {maxStreak >= 7 && <span className={styles.hotTag}>Hot</span>}
            </div>
            <div className={styles.kpiValueRow}>
              <span className={`${styles.kpiValue} display-kpi`}>{maxStreak}</span>
              <span className={styles.kpiUnitLarge}>days</span>
            </div>
            <div className={styles.kpiFoot}>
              <span>Longest active streak</span>
              <span className={styles.kpiFootAccent}>best {bestOverall} days</span>
            </div>
            <div className={styles.streakNote}>
              <IconFlame /> {maxStreak > 0 ? 'Momentum is intact — don’t break the chain.' : 'Check in to start a streak.'}
            </div>
          </article>

          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>7-day adherence</span>
              <span className={styles.gradeTag}>{gradeFor(adherence7)}</span>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={`${styles.kpiValue} display-kpi`}>{adherence7 == null ? '—' : adherence7}</span>
              {adherence7 != null && <span className={styles.kpiPercent}>%</span>}
              {adherenceDelta != null && (
                <span className={`${styles.delta} ${adherenceDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {adherenceDelta >= 0 ? '▲' : '▼'} {Math.abs(adherenceDelta)}%
                </span>
              )}
            </div>
            <div className={styles.weekBars} aria-label="Daily completion for the last seven days">
              {weekBars.map(day => {
                const level = day.ratio == null ? 0 : day.ratio >= 1 ? 3 : day.ratio >= 0.5 ? 2 : 1;
                return (
                  <span
                    key={day.key}
                    className={`${styles.weekBar} ${styles[`weekBar${level}`]}`}
                    title={`${formatDateShort(day.key)}: ${day.done} of ${day.due} completed`}
                  />
                );
              })}
            </div>
            <div className={styles.kpiFoot}>
              <span>Completed ÷ scheduled</span>
              <span className={styles.kpiFootAccent}>last 7 days</span>
            </div>
          </article>

          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Today’s XP preview</span>
              <span className={styles.kpiIcon}><IconBolt /></span>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={`${styles.kpiValue} display-kpi`}>+{xpOnSelected}</span>
              <span className={styles.kpiUnitLarge}>XP</span>
            </div>
            <div className={styles.xpChips}>
              {VECTORS.map(vector => (
                <span key={vector} className={`${styles.xpChip} ${styles[`xpChip${vector[0].toUpperCase()}${vector.slice(1)}`]}`}>
                  +{xpByVector[vector]} {VECTOR_LABELS[vector]}
                </span>
              ))}
            </div>
            <div className={styles.kpiFoot}>
              <span>Preview from checked-in protocols</span>
            </div>
          </article>
        </section>

        {/* Main grid */}
        <div className={styles.layout}>

          <div className={styles.mainCol}>
            <section className={styles.panel} aria-labelledby="scheduled-heading">
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleWrap}>
                  <span className={styles.panelIcon}><IconCalendarCheck /></span>
                  <h2 id="scheduled-heading" className={styles.panelTitle}>
                    {statusFilter === 'paused'
                      ? 'Paused protocols'
                      : isToday ? 'Today’s scheduled protocols' : 'Scheduled protocols'}
                  </h2>
                  <span className={styles.dateChip}>{formatDateShort(selectedDate)}</span>
                </div>
                <div className={styles.dateNav}>
                  <button type="button" className={styles.iconBtn} onClick={() => shiftDate(-1)} aria-label="Previous day">
                    <IconChevron dir="left" />
                  </button>
                  <button
                    type="button"
                    className={styles.todayBtn}
                    onClick={() => setSelectedDate(today)}
                    disabled={isToday}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => shiftDate(1)}
                    disabled={isToday}
                    aria-label="Next day"
                  >
                    <IconChevron dir="right" />
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorState} role="alert">
                  <span>{error}</span>
                  <button type="button" className="btn-secondary" onClick={() => void loadHabits()}>Retry</button>
                </div>
              )}

              {loading ? (
                <div className={styles.skeletonList} aria-label="Loading protocols">
                  {[1, 2, 3, 4].map(n => <span key={n} className={styles.skeletonRow} />)}
                </div>
              ) : visibleHabits.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}><IconShield /></span>
                  <h3>{habits.length === 0 ? 'Build your first protocol' : statusFilter === 'paused' ? 'Nothing is paused' : 'No protocols scheduled'}</h3>
                  <p>
                    {habits.length === 0
                      ? 'Non-negotiables run every day. Habits repeat on the days you choose. Start with one standard you refuse to skip.'
                      : statusFilter === 'paused'
                        ? 'Paused protocols stay in your history and can be resumed at any time.'
                        : 'Nothing matches these filters for this day. Clear a filter or create a new protocol.'}
                  </p>
                  <div className={styles.emptyActions}>
                    <button type="button" className="btn-primary" onClick={() => openCreate()}>
                      <IconPlus /> Create protocol
                    </button>
                    {habits.length === 0 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          if (TEMPLATES[0]) openCreate(TEMPLATES[0]);
                        }}
                      >
                        Use a template
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.groups}>
                  {nonNegotiables.length > 0 && (
                    <div className={styles.group}>
                      <div className={styles.groupHeader}>
                        <span className={styles.groupTitle}><span className={styles.groupMark} aria-hidden />Non-negotiables</span>
                        <span className={styles.groupMeta}>
                          Daily standards · {nonNegotiables.filter(h => isComplete(checkInFor(h.id, selectedDate, map))).length}/{nonNegotiables.length} complete
                        </span>
                      </div>
                      <ul className={styles.habitList}>
                        {nonNegotiables.map(habit => (
                          <HabitRow
                            key={habit.id}
                            habit={habit}
                            date={selectedDate}
                            checkIn={checkInFor(habit.id, selectedDate, map)}
                            streak={currentStreak(habit, map, selectedDate)}
                            selected={habit.id === selectedHabit?.id}
                            busy={busy}
                            onToggle={() => void toggleCompletion(habit)}
                            onAdjust={delta => void adjustProgress(habit, delta)}
                            onSelect={() => setSelectedId(habit.id)}
                            onStatus={() => void toggleStatus(habit)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {recurringHabits.length > 0 && (
                    <div className={styles.group}>
                      <div className={styles.groupHeader}>
                        <span className={styles.groupTitle}><span className={`${styles.groupMark} ${styles.groupMarkHabit}`} aria-hidden />Habits</span>
                        <span className={styles.groupMeta}>
                          Recurring practices · {recurringHabits.filter(h => isComplete(checkInFor(h.id, selectedDate, map))).length}/{recurringHabits.length} complete
                        </span>
                      </div>
                      <ul className={styles.habitList}>
                        {recurringHabits.map(habit => (
                          <HabitRow
                            key={habit.id}
                            habit={habit}
                            date={selectedDate}
                            checkIn={checkInFor(habit.id, selectedDate, map)}
                            streak={currentStreak(habit, map, selectedDate)}
                            selected={habit.id === selectedHabit?.id}
                            busy={busy}
                            onToggle={() => void toggleCompletion(habit)}
                            onAdjust={delta => void adjustProgress(habit, delta)}
                            onSelect={() => setSelectedId(habit.id)}
                            onStatus={() => void toggleStatus(habit)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {statusFilter === 'paused' && visibleHabits.length > 0 && (
                    <p className={styles.pausedHint}>
                      Paused protocols do not count toward cadence, adherence or streaks until they are resumed.
                    </p>
                  )}
                </div>
              )}

              <footer className={styles.panelFoot}>
                <span>
                  <IconInfo /> Showing {visibleHabits.length} {visibleHabits.length === 1 ? 'protocol' : 'protocols'}
                  {kindFilter !== 'all' ? ` · ${kindFilter === 'non_negotiable' ? 'non-negotiables' : 'habits'}` : ''}
                </span>
                <span>Check-ins are stored against {formatDateShort(selectedDate)}</span>
              </footer>
            </section>

            <section className={styles.panel} aria-labelledby="rules-heading">
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleWrap}>
                  <span className={styles.panelIcon}><IconShield /></span>
                  <h2 id="rules-heading" className={styles.panelTitle}>Momentum protection</h2>
                  <span className={styles.greenChip}><IconShield /> Active</span>
                </div>
              </div>
              <div className={styles.rulesBody}>
                <div className={styles.ruleCard}>
                  <span className={styles.ruleNumber}>01</span>
                  <div>
                    <h3>Adherence</h3>
                    <p>Completed due occurrences ÷ due occurrences. Rest days are never counted against you.</p>
                  </div>
                </div>
                <div className={styles.ruleCard}>
                  <span className={styles.ruleNumber}>02</span>
                  <div>
                    <h3>Streaks</h3>
                    <p>A streak counts consecutive scheduled check-ins. An unfinished today never breaks yesterday’s run.</p>
                  </div>
                </div>
                <div className={styles.ruleCard}>
                  <span className={styles.ruleNumber}>03</span>
                  <div>
                    <h3>Permanent record</h3>
                    <p>Lifetime hits are permanent. Pausing or missing a day never erases past completed work.</p>
                  </div>
                </div>
              </div>
              <footer className={styles.panelFoot}>
                <span><IconInfo /> Calculated from dated check-ins · no fabricated values</span>
                <span>{checkIns.length} check-ins on record</span>
              </footer>
            </section>
          </div>

          <aside className={styles.rail} aria-label="Protocol telemetry and templates">

            {/* Telemetry */}
            {selectedHabit && telemetry ? (
              <section className={`${styles.card} ${styles.telemetry}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.railLabel}>Protocol telemetry</span>
                  <span className={styles.code}>{compactCode(selectedHabit.id)}</span>
                </div>

                <div className={styles.telemetryTitleRow}>
                  <h3 className={styles.telemetryTitle}>{selectedHabit.name}</h3>
                  <span className={styles.telemetryTags}>
                    {isLocalHabitId(selectedHabit.id) && <span className={styles.localTag}>Local</span>}
                    <span className={`${styles.tag} ${styles[`tag${selectedHabit.vector[0].toUpperCase()}${selectedHabit.vector.slice(1)}`]}`}>
                      {VECTOR_LABELS[selectedHabit.vector]}
                    </span>
                  </span>
                </div>
                <p className={styles.telemetryDesc}>{selectedHabit.description ?? 'No description yet.'}</p>

                <div className={styles.telemetryMeta}>
                  <span>{scheduleLabel(selectedHabit)}</span>
                  {selectedHabit.schedule_time && <span><IconClock /> {formatTime(selectedHabit.schedule_time)}</span>}
                  <span>{selectedHabit.kind === 'non_negotiable' ? 'Non-negotiable' : 'Habit'}</span>
                  <span>{habitXp(selectedHabit)} XP</span>
                </div>

                <div className={styles.telemetryStats}>
                  <div>
                    <span>Current streak</span>
                    <strong>{telemetry.stats.currentStreak} <small>days</small></strong>
                  </div>
                  <div>
                    <span>Best record</span>
                    <strong>{telemetry.stats.bestStreak} <small>days</small></strong>
                  </div>
                  <div>
                    <span>Lifetime hits</span>
                    <strong>{telemetry.stats.lifetimeHits}</strong>
                  </div>
                  <div>
                    <span>30-day rate</span>
                    <strong>{telemetry.stats.adherence30 == null ? '—' : `${telemetry.stats.adherence30}%`}</strong>
                  </div>
                </div>

                <div className={styles.heatHeader}>
                  <span>Last 30 days</span>
                  <span>{telemetry.grid.filter(c => c.done).length} / {telemetry.grid.filter(c => c.due).length} hit</span>
                </div>
                <div className={styles.heatGrid} aria-hidden>
                  {telemetry.grid.map(cell => (
                    <span
                      key={cell.key}
                      className={`${styles.heatCell} ${cell.done ? styles.heatDone : cell.open ? styles.heatOpen : cell.due ? styles.heatDue : styles.heatRest}`}
                      title={`${formatDateShort(cell.key)}: ${cell.done ? 'completed' : cell.open ? 'open today' : cell.due ? 'missed' : 'rest day'}`}
                    />
                  ))}
                </div>
                <p className={styles.heatLegend}>
                  <span><span className={`${styles.legendDot} ${styles.heatDone}`} /> hit</span>
                  <span><span className={`${styles.legendDot} ${styles.heatDue}`} /> missed</span>
                  <span><span className={`${styles.legendDot} ${styles.heatOpen}`} /> open</span>
                  <span><span className={`${styles.legendDot} ${styles.heatRest}`} /> rest</span>
                </p>

                <div className={styles.telemetryActions}>
                  <button type="button" className="btn-secondary" onClick={() => openEdit(selectedHabit)}>Edit</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void toggleStatus(selectedHabit)}
                    disabled={busy === `${selectedHabit.id}|status`}
                  >
                    {selectedHabit.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button type="button" className={styles.dangerLink} onClick={() => void removeHabit(selectedHabit)}>Delete</button>
                </div>
              </section>
            ) : (
              <section className={`${styles.card} ${styles.railEmpty}`}>
                <span className={styles.railLabel}>Protocol telemetry</span>
                <p>Select a protocol to inspect its streak, adherence and 30-day history.</p>
              </section>
            )}

            {/* Templates */}
            <section className={styles.card} ref={templatesRef} aria-labelledby="templates-heading">
              <div className={styles.cardHeader}>
                <span id="templates-heading" className={styles.railLabel}>Quick deploy templates</span>
                <span className={styles.code}>Pre-built</span>
              </div>
              <ul className={styles.templates}>
                {TEMPLATES.map(template => (
                  <li key={template.name} className={styles.template}>
                    <div className={styles.templateCopy}>
                      <strong>{template.name}</strong>
                      <span>{VECTOR_LABELS[template.vector]} · {templateSchedule(template)}</span>
                    </div>
                    <button type="button" className={styles.useBtn} onClick={() => openCreate(template)} aria-label={`Use ${template.name} template`}>
                      Use <IconArrow />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Attribute integrity */}
            <section className={styles.card} aria-labelledby="integrity-heading">
              <div className={styles.cardHeader}>
                <span id="integrity-heading" className={styles.railLabel}>Attribute integrity</span>
                <span className={styles.code}>30d</span>
              </div>
              <div className={styles.vectorRows}>
                {vectorIntegrity.map(row => (
                  <div key={row.vector} className={styles.vectorRow}>
                    <div className={styles.vectorRowTop}>
                      <span className={styles.vectorName}>
                        <span className={`${styles.dot} ${styles[`dot${row.vector[0].toUpperCase()}${row.vector.slice(1)}`]}`} aria-hidden />
                        {VECTOR_LABELS[row.vector]}
                      </span>
                      <strong>{row.adherence == null ? '—' : `${row.adherence}%`}</strong>
                    </div>
                    <div className={styles.vectorTrack}>
                      <span
                        className={`${styles.vectorFill} ${styles[`fill${row.vector[0].toUpperCase()}${row.vector.slice(1)}`]}`}
                        style={{ width: `${row.adherence ?? 0}%` }}
                      />
                    </div>
                    <span className={styles.vectorMeta}>{row.count} active {row.count === 1 ? 'protocol' : 'protocols'}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Data trust */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.railLabel}>How the numbers work</span>
                <span className={styles.code}>Taxonomy</span>
              </div>
              <ul className={styles.rulesList}>
                <li><strong>Non-negotiable</strong> — daily, non-optional. Skips show as missed days.</li>
                <li><strong>Habit</strong> — recurring on the days you choose. Only scheduled days enter adherence.</li>
                <li><strong>Grade</strong> — A+ ≥ 95%, A ≥ 90%, B ≥ 80%, C ≥ 70%, D ≥ 60%.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`} role="status">
          {toast.type === 'success' ? <IconCheck /> : <IconInfo />}
          {toast.message}
        </div>
      )}

      {/* Create / edit modal */}
      {modalOpen && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="protocol-modal-title"
            onKeyDown={event => {
              if (event.key !== 'Tab') return;
              const focusable = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]',
                ),
              );
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>{editing ? 'Edit protocol' : 'New protocol'}</span>
                <h2 id="protocol-modal-title" className={styles.modalTitle}>
                  {editing ? 'Update the standard' : 'Create a protocol'}
                </h2>
              </div>
              <button type="button" className={styles.iconBtn} onClick={() => setModalOpen(false)} aria-label="Close dialog">
                <IconClose />
              </button>
            </header>

            <form className={styles.form} onSubmit={submitForm}>
              <fieldset className={styles.kindPicker}>
                <legend>Protocol type</legend>
                <div className={styles.kindOptions}>
                  <button
                    type="button"
                    className={`${styles.kindOption} ${form.kind === 'non_negotiable' ? styles.kindOptionActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, kind: 'non_negotiable' }))}
                    aria-pressed={form.kind === 'non_negotiable'}
                  >
                    <span className={styles.kindIcon}><IconShield /></span>
                    <span>
                      <strong>Non-negotiable</strong>
                      <small>Daily. No skips. Earns 25 XP.</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.kindOption} ${form.kind === 'habit' ? styles.kindOptionActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, kind: 'habit' }))}
                    aria-pressed={form.kind === 'habit'}
                  >
                    <span className={styles.kindIcon}><IconRepeat /></span>
                    <span>
                      <strong>Habit</strong>
                      <small>Recurring on chosen days. Earns 20 XP.</small>
                    </span>
                  </button>
                </div>
              </fieldset>

              <label className={styles.field}>
                <span>Protocol name</span>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={event => setForm(f => ({ ...f, name: event.target.value }))}
                  placeholder="e.g. Read 10 pages"
                  maxLength={80}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Description <em>optional</em></span>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={event => setForm(f => ({ ...f, description: event.target.value }))}
                  placeholder="What counts as done? Keep the rule unambiguous."
                  maxLength={220}
                />
              </label>

              <fieldset className={styles.vectorPicker}>
                <legend>Vector</legend>
                <div className={styles.vectorOptions}>
                  {VECTORS.map(vector => (
                    <button
                      key={vector}
                      type="button"
                      className={`${styles.vectorOption} ${styles[`vectorOption${vector[0].toUpperCase()}${vector.slice(1)}`]} ${form.vector === vector ? styles.vectorOptionActive : ''}`}
                      onClick={() => setForm(f => ({ ...f, vector }))}
                      aria-pressed={form.vector === vector}
                    >
                      <span className={`${styles.dot} ${styles[`dot${vector[0].toUpperCase()}${vector.slice(1)}`]}`} aria-hidden />
                      {VECTOR_LABELS[vector]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  <span>Time of day <em>optional</em></span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={event => setForm(f => ({ ...f, time: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Completion rule</span>
                  <select
                    value={form.rule}
                    onChange={event => {
                      const rule = event.target.value as CompletionRule;
                      setForm(f => ({
                        ...f,
                        rule,
                        unit: rule === 'duration' ? 'min' : rule === 'count' ? f.unit : '',
                      }));
                    }}
                  >
                    <option value="binary">Binary — done / not done</option>
                    <option value="count">Count — target units</option>
                    <option value="duration">Duration — target minutes</option>
                  </select>
                </label>
              </div>

              {form.kind === 'habit' ? (
                <fieldset className={styles.daysPicker}>
                  <legend>Repeat on</legend>
                  <div className={styles.dayOptions}>
                    {DAY_KEYS.map(day => {
                      const active = form.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`${styles.dayOption} ${active ? styles.dayOptionActive : ''}`}
                          onClick={() => setForm(f => ({
                            ...f,
                            days: active ? f.days.filter(d => d !== day) : [...f.days, day],
                          }))}
                          aria-pressed={active}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      );
                    })}
                  </div>
                  <p className={styles.hint}>
                    {form.days.length === 0
                      ? 'Pick at least one day.'
                      : `${form.days.length} scheduled ${form.days.length === 1 ? 'day' : 'days'} per week. Only these days count toward adherence.`}
                  </p>
                </fieldset>
              ) : (
                <p className={styles.hint}>
                  Runs every day. A missed day appears in history but never erases lifetime hits.
                </p>
              )}

              {form.rule !== 'binary' && (
                <div className={styles.formRow}>
                  <label className={styles.field}>
                    <span>Target</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={form.target}
                      onChange={event => setForm(f => ({ ...f, target: event.target.value }))}
                      placeholder={form.rule === 'duration' ? '120' : '10'}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Unit</span>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={event => setForm(f => ({ ...f, unit: event.target.value }))}
                      placeholder={form.rule === 'duration' ? 'min' : 'pages'}
                      maxLength={16}
                    />
                  </label>
                </div>
              )}

              {formError && <p className={styles.formError} role="alert">{formError}</p>}

              <footer className={styles.modalFooter}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create protocol'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HABIT ROW
   ════════════════════════════════════════════════════════════════════════ */

interface HabitRowProps {
  habit: Habit;
  date: string;
  checkIn: HabitCheckIn | null;
  streak: number;
  selected: boolean;
  busy: string | null;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  onSelect: () => void;
  onStatus: () => void;
}

function HabitRow({
  habit, date, checkIn, streak, selected, busy, onToggle, onAdjust, onSelect, onStatus,
}: HabitRowProps) {
  const cap = habit.vector[0].toUpperCase() + habit.vector.slice(1);
  const done = isComplete(checkIn);
  const pct = progressPct(habit, checkIn);
  const value = completionValue(habit, checkIn);
  const target = targetFor(habit);
  const time = formatTime(habit.schedule_time);
  const paused = habit.status === 'paused';
  const isLocal = isLocalHabitId(habit.id);
  const key = `${habit.id}|${date}`;
  const isBusy = busy?.startsWith(key) || busy === `${habit.id}|status`;

  return (
    <li className={`${styles.habitRow} ${styles[`row${cap}`]} ${done ? styles.rowDone : ''} ${selected ? styles.rowSelected : ''}`}>
      <span className={`${styles.rowAccent} ${styles[`accent${cap}`]}`} aria-hidden />

      <button
        type="button"
        className={`${styles.checkBtn} ${done ? styles.checkBtnDone : ''}`}
        onClick={paused ? onStatus : onToggle}
        aria-pressed={done}
        aria-label={paused ? `Resume ${habit.name}` : done ? `Undo completion for ${habit.name}` : `Complete ${habit.name}`}
        disabled={isBusy}
      >
        {done ? <IconCheck /> : paused ? <IconPlay /> : null}
      </button>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <button type="button" className={styles.rowNameBtn} onClick={onSelect} aria-label={`Show telemetry for ${habit.name}`}>
            {habit.name}
          </button>
          <span className={`${styles.tag} ${styles[`tag${cap}`]}`}>{VECTOR_LABELS[habit.vector]}</span>
          <span className={styles.kindTag}>{habit.kind === 'non_negotiable' ? 'Non-negotiable' : 'Habit'}</span>
          {time && <span className={styles.timeTag}><IconClock /> {time}</span>}
          {isLocal && <span className={styles.localTag}>Local</span>}
          {done && <span className={styles.doneTag}><IconCheck /> Complete</span>}
          {paused && <span className={styles.pausedTag}>Paused</span>}
        </div>

        {habit.description && <p className={styles.rowDesc}>{habit.description}</p>}

        {habit.completion_rule !== 'binary' ? (
          <div className={styles.progressBlock}>
            <div className={styles.progressTop}>
              <span>{habit.completion_rule === 'duration' ? 'Time recorded' : 'Progress'}</span>
              <strong>{value} / {target} {habit.target_unit ?? ''}</strong>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${habit.name} progress`}
            >
              <span className={`${styles.progressFill} ${done ? styles.progressDone : ''}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : null}

        <div className={styles.rowMeta}>
          <span><IconFlame /> {streak}-day streak</span>
          <span>{scheduleLabel(habit)}</span>
          <span>{habitXp(habit)} XP</span>
        </div>
      </div>

      <div className={styles.rowActions}>
        {habit.completion_rule !== 'binary' && !paused && (
          <div className={styles.stepper} role="group" aria-label={`Adjust ${habit.name}`}>
            <button type="button" onClick={() => onAdjust(-1)} disabled={isBusy || value <= 0} aria-label={`Decrease ${habit.name}`}>−</button>
            <button type="button" onClick={() => onAdjust(1)} disabled={isBusy || value >= target} aria-label={`Increase ${habit.name}`}>+</button>
          </div>
        )}
        <button
          type="button"
          className={`${styles.rowActionBtn} ${done ? styles.rowActionUndo : ''}`}
          onClick={paused ? onStatus : onToggle}
          disabled={isBusy}
        >
          {paused ? 'Resume' : done ? 'Undo' : habit.completion_rule === 'binary' ? 'Complete' : 'Mark done'}
        </button>
        <button type="button" className={styles.rowSelectBtn} onClick={onSelect} aria-label={`Open telemetry for ${habit.name}`}>
          <IconChart />
        </button>
      </div>
    </li>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ICONS — one coherent 1.5px outline set
   ════════════════════════════════════════════════════════════════════════ */

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.75 8.5l3.25 3.25 7.25-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 1.75l6 2.25v5c0 3.75-2.5 6.25-6 7.25-3.5-1-6-3.5-6-7.25v-5l6-2.25z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.25 9l1.9 1.9 3.6-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.75c.4 2.2 1.4 3.2 2.6 4.4 1.4 1.4 2.15 2.7 2.15 4.35A4.75 4.75 0 018 15.25a4.75 4.75 0 01-4.75-4.75c0-1.5.5-2.7 1.4-3.8.2 1 .7 1.7 1.35 2.1C6 6.6 7.4 4.2 8 1.75z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8.75 1.5L3.5 8.75h3.5L6.75 14.5l5.75-7.75h-3.75l.75-5.25z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendarCheck() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.75" y="3.5" width="14.5" height="12.75" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.75 7.5h14.5M6 1.75v3.5M12 1.75v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 11.5l1.7 1.7 3-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d={dir === 'left' ? 'M7.5 2.5L4 6l3.5 3.5' : 'M4.5 2.5L8 6l-3.5 3.5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3.75V7l2.25 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2.5 6.5A4.5 4.5 0 017 2h6.5M15.5 11.5A4.5 4.5 0 0111 16H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 1.75L13.5 4 11 6.25M7 11.75L4.5 14 7 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="8.5" width="4" height="4" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="4" height="4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1.5 12.5h11M3.5 11V7M7 11V3.5M10.5 11V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M4.25 2.75l7 4.25-7 4.25v-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6.25v3.5M7 4.35v.15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
