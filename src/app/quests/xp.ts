/**
 * XP claim engine for the quest roadmap.
 *
 * XP is never invented: it is *claimed* from finished work.
 *   - every completed task credits its configured yield
 *   - a fully completed milestone credits the milestone bonus
 *
 * Milestones unlock when the user's claimed XP reaches their gate. An explicit
 * gate can be stored per milestone; otherwise the roadmap unlocks sequentially:
 * the XP needed to finish every earlier milestone.
 */

import type { Plan, Task } from './types';

/** Task yield by priority (1 = high, 2 = medium, 3 = low). */
export const TASK_XP_BY_PRIORITY: Record<number, number> = {
  1: 80,
  2: 50,
  3: 25,
};

export const DEFAULT_TASK_XP = 50;

/** Verified-milestone bonus, mirrors `mission:milestone_verified`. */
export const MILESTONE_BONUS_XP = 120;

export function taskXp(task: Pick<Task, 'priority'>): number {
  return TASK_XP_BY_PRIORITY[task.priority] ?? DEFAULT_TASK_XP;
}

export function taskClaimedXp(task: Task): number {
  return task.status === 'completed' ? taskXp(task) : 0;
}

export function planPotentialXp(plan: Plan): number {
  const tasks = plan.tasks ?? [];
  const taskTotal = tasks.reduce((sum, task) => sum + taskXp(task), 0);
  if (plan.is_unassigned) return taskTotal;
  return taskTotal + MILESTONE_BONUS_XP;
}

export function planEarnedXp(plan: Plan): number {
  const tasks = plan.tasks ?? [];
  const earned = tasks.reduce((sum, task) => sum + taskClaimedXp(task), 0);
  const done = tasks.length > 0
    ? tasks.every(task => task.status === 'completed')
    : plan.status === 'completed';
  if (!done || plan.is_unassigned) return earned;
  return earned + MILESTONE_BONUS_XP;
}

/** XP claimed from every quest (pass plans from all quests). */
export function questClaimedXp(plans: Plan[]): number {
  return plans.reduce((sum, plan) => sum + planEarnedXp(plan), 0);
}

/**
 * Default gate for the milestone at `index`: the XP needed to finish all the
 * milestones before it. The first milestone is always open.
 */
export function defaultPlanGate(plans: Plan[], index: number): number {
  const realPlans = plans.filter(plan => !plan.is_unassigned);
  return realPlans
    .slice(0, index)
    .reduce((sum, plan) => sum + planPotentialXp(plan), 0);
}

export function planGate(plan: Plan, plans: Plan[], index: number): number {
  if (plan.is_unassigned) return 0;
  if (typeof plan.xp_required === 'number' && plan.xp_required > 0) {
    return plan.xp_required;
  }
  return defaultPlanGate(plans, index);
}

/**
 * Annotate plans with their gate, claimed XP, lock state and which milestone is
 * the current focus. Returns new objects so React re-renders reliably.
 */
export function resolvePlanXp(plans: Plan[], claimedXp: number): Plan[] {
  const realPlans = plans.filter(plan => !plan.is_unassigned);

  const gates = new Map<string, number>();
  realPlans.forEach((plan, index) => gates.set(plan.id, planGate(plan, plans, index)));

  const withGates = plans.map(plan => {
    const gate = gates.get(plan.id) ?? 0;
    const completed = plan.status === 'completed';
    return {
      ...plan,
      xp_gate: gate,
      xp_earned: planEarnedXp(plan),
      xp_potential: planPotentialXp(plan),
      locked: !completed && !plan.is_unassigned && claimedXp < gate,
    };
  });

  // The current focus is the unlocked milestone with activity, else the first
  // unlocked, unfinished milestone.
  const candidates = withGates.filter(plan => !plan.is_unassigned && !plan.locked && plan.status !== 'completed');
  const active = candidates.find(plan => (plan.progress ?? 0) > 0) ?? candidates[0] ?? null;

  return withGates.map(plan => ({ ...plan, is_active: active ? plan.id === active.id : false }));
}

export function xpToGate(plan: Plan, claimedXp: number): number {
  return Math.max(0, (plan.xp_gate ?? 0) - claimedXp);
}

export function formatXp(value: number): string {
  return value.toLocaleString('en-GB');
}
