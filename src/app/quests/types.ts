/**
 * Quest types — Goal → Plan → Task → Action
 *
 * A Quest is a goal with a deadline.
 * A Plan is a phase/milestone under a quest.
 * A Task is an actionable item under a plan.
 *
 * Progress is computed consistently from tasks (task-weighted). A plan with no
 * tasks falls back to its own completed flag, and a quest with no tasks falls
 * back to its plan completion count.
 */

export type QuestStatus = 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
export type PlanStatus  = 'not_started' | 'in_progress' | 'completed';
export type TaskStatus  = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'skipped';
export type Vector      = 'mind' | 'muscle' | 'money';

/* ── Quest (the top-level goal) ─────────────────────────────────────────── */
export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal: string | null;        // the definition-of-done / success criterion
  vector: Vector;
  status: QuestStatus;
  deadline: string | null;    // ISO date string YYYY-MM-DD
  created_at: string;
  updated_at: string;
  // computed
  plans?: Plan[];
  progress?: number;          // 0–100
  stats?: QuestStats;
  claimedXp?: number;         // user-wide XP claimed from completed work
}

/* ── Plan (a phase / milestone under a quest) ───────────────────────────── */
export interface Plan {
  id: string;
  quest_id: string;           // maps to mission_id in DB (missions table)
  title: string;
  description: string | null;
  ordering: number;
  due_date: string | null;
  status: PlanStatus;
  xp_required: number | null;   // explicit XP gate; null = sequential default
  created_at: string;
  updated_at: string;
  // computed
  tasks?: Task[];
  progress?: number;          // 0–100
  is_unassigned?: boolean;    // synthetic bucket for tasks with no milestone
  xp_gate?: number;           // effective claimed-XP threshold
  xp_earned?: number;         // XP claimed from this plan's finished work
  xp_potential?: number;      // XP available when every task is done
  locked?: boolean;           // true while claimed XP < gate
  is_active?: boolean;        // the current focus milestone
}

/* ── Task (actionable item under a plan) ────────────────────────────────── */
export interface Task {
  id: string;
  quest_id: string;           // mission_id in DB
  plan_id: string | null;     // milestone_id in DB
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;           // 1 = high, 2 = medium, 3 = low
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  overdue: boolean;           // computed from due_date + status
}

/* ── Activity (task_events table) ───────────────────────────────────────── */
export interface TaskEvent {
  id: string;
  task_id: string;
  task_title: string;
  event_type: TaskEventType;
  previous_value: string | null;
  new_value: string | null;
  created_at: string;
}

export type TaskEventType =
  | 'created'
  | 'started'
  | 'blocked'
  | 'skipped'
  | 'completed'
  | 'reopened'
  | 'updated';

/* ── Stats ──────────────────────────────────────────────────────────────── */
export interface QuestStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  inProgressTasks: number;
  totalPlans: number;
  completedPlans: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
export function computeProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.status === 'completed').length;
  return Math.round((done / tasks.length) * 100);
}

/** Canonical quest progress: task-weighted, with a plan fallback. */
export function computeQuestProgress(plans: Plan[]): number {
  const realPlans = plans.filter(p => !p.is_unassigned);
  const allTasks  = plans.flatMap(p => p.tasks ?? []);
  if (allTasks.length > 0) return computeProgress(allTasks);
  if (realPlans.length === 0) return 0;
  const done = realPlans.filter(p => p.status === 'completed').length;
  return Math.round((done / realPlans.length) * 100);
}

export function computeQuestStats(plans: Plan[]): QuestStats {
  const realPlans = plans.filter(p => !p.is_unassigned);
  const tasks     = plans.flatMap(p => p.tasks ?? []);
  return {
    totalTasks:     tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    overdueTasks:   tasks.filter(t => t.overdue && t.status !== 'completed' && t.status !== 'skipped').length,
    blockedTasks:   tasks.filter(t => t.status === 'blocked').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    totalPlans:     realPlans.length,
    completedPlans: realPlans.filter(p => p.status === 'completed').length,
  };
}

/** True when a date-only string has passed the end of its day. */
export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr.length <= 10 ? `${dateStr}T23:59:59` : dateStr);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function isTaskOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (status === 'completed' || status === 'skipped') return false;
  return isOverdue(dueDate);
}

/** An active quest is at risk when work is overdue or the deadline has passed. */
export function isQuestAtRisk(quest: Quest): boolean {
  if (quest.status !== 'active') return false;
  if (quest.stats && quest.stats.overdueTasks > 0) return true;
  return isOverdue(quest.deadline);
}

export function questHealth(quest: Quest): { score: number; label: string } {
  const stats = quest.stats;
  let score = 100;
  if (stats) {
    score -= Math.min(60, stats.overdueTasks * 15);
    score -= Math.min(20, stats.blockedTasks * 8);
  }
  if (isOverdue(quest.deadline) && quest.status !== 'completed') score -= 25;
  score = Math.max(0, Math.min(100, score));
  const label = score >= 80 ? 'Nominal' : score >= 50 ? 'Watch' : 'Critical';
  return { score, label };
}

/** Whole days from today until the date (negative = past). */
export function daysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const due = new Date(dateStr.length <= 10 ? `${dateStr}T23:59:59` : dateStr);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(due);
  start.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}

export function priorityLabel(p: number): string {
  if (p === 1) return 'High';
  if (p === 2) return 'Medium';
  return 'Low';
}

export function vectorLabel(v: Vector): string {
  if (v === 'mind')   return '🧠 Mind';
  if (v === 'muscle') return '💪 Muscle';
  return '💰 Money';
}

export const VECTOR_OPTIONS: { value: Vector; label: string }[] = [
  { value: 'mind',   label: '🧠 Mind' },
  { value: 'muscle', label: '💪 Muscle' },
  { value: 'money',  label: '💰 Money' },
];

export function taskStatusLabel(s: TaskStatus): string {
  switch (s) {
    case 'in_progress': return 'IN PROGRESS';
    case 'blocked':     return 'BLOCKED';
    case 'completed':   return 'DONE';
    case 'skipped':     return 'SKIPPED';
    default:            return 'TO DO';
  }
}

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not_started', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked',     label: 'Blocked' },
  { value: 'completed',   label: 'Completed' },
  { value: 'skipped',     label: 'Skipped' },
];
