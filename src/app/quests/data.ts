/**
 * Quest data layer — talks to Supabase.
 *
 * Table mapping:
 *   Quest  → missions       (mission_id)
 *   Plan   → milestones     (milestone_id)
 *   Task   → tasks          (task_id)
 *   Action → task_events    (append-only task history)
 *
 * We use the existing schema without altering it. Progress is always derived
 * from tasks (see computeQuestProgress) — never stored as an arbitrary value.
 */

import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demo';
import * as demo from '@/lib/demo/quests';
import type {
  Quest, Plan, Task, TaskEvent, TaskEventType,
  QuestStatus, PlanStatus, TaskStatus, Vector,
} from './types';
import { computeProgress, computeQuestProgress, computeQuestStats, isTaskOverdue } from './types';
import { MILESTONE_BONUS_XP, questClaimedXp, resolvePlanXp, taskXp } from './xp';

const now = () => new Date().toISOString();

/* ════════════════════════════════════════════════════════════════════════
   QUESTS (missions table)
   ════════════════════════════════════════════════════════════════════════ */

export async function getQuests(userId: string): Promise<Quest[]> {
  if (isDemoMode()) return demo.getQuests(userId);

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getQuests:', error);
    return [];
  }

  const plansByMission = await fetchPlansForMissions(data.map((m: any) => m.id));
  const claimedXp = questClaimedXp([...plansByMission.values()].flat());

  return data.map((row: any) => {
    const quest = rowToQuest(row);
    const plans = resolvePlanXp(plansByMission.get(quest.id) ?? [], claimedXp);
    quest.plans    = plans;
    quest.progress = computeQuestProgress(plans);
    quest.stats    = computeQuestStats(plans);
    quest.claimedXp = claimedXp;
    return quest;
  });
}

export async function getQuestWithPlans(questId: string, userId: string): Promise<Quest | null> {
  if (isDemoMode()) return demo.getQuestWithPlans(questId, userId);

  const { data: mission, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', questId)
    .eq('user_id', userId)
    .single();

  if (error || !mission) return null;

  const plansByMission = await fetchPlansForMissions([questId]);
  const claimedXp = await getUserClaimedXp(userId);
  const quest = rowToQuest(mission);
  const plans = resolvePlanXp(plansByMission.get(questId) ?? [], claimedXp);
  quest.plans    = plans;
  quest.progress = computeQuestProgress(plans);
  quest.stats    = computeQuestStats(plans);
  quest.claimedXp = claimedXp;
  return quest;
}

/* ════════════════════════════════════════════════════════════════════════
   XP CLAIM — derived from completed work, never invented
   ════════════════════════════════════════════════════════════════════════ */

/**
 * Total XP the user has claimed across every quest: the yield of completed
 * tasks plus the bonus for each fully finished milestone.
 */
export async function getUserClaimedXp(userId: string): Promise<number> {
  if (isDemoMode()) return demo.getUserClaimedXp(userId);

  const { data: missions, error: missionErr } = await supabase
    .from('missions')
    .select('id')
    .eq('user_id', userId);

  if (missionErr || !missions || missions.length === 0) {
    if (missionErr) console.error('getUserClaimedXp missions:', missionErr);
    return 0;
  }

  const missionIds = missions.map((m: any) => m.id);
  const [{ data: tasks, error: taskErr }, { data: milestones, error: milestoneErr }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, milestone_id, status, priority')
      .in('mission_id', missionIds),
    supabase
      .from('milestones')
      .select('id, mission_id, completed')
      .in('mission_id', missionIds),
  ]);

  if (taskErr) console.error('getUserClaimedXp tasks:', taskErr);
  if (milestoneErr) console.error('getUserClaimedXp milestones:', milestoneErr);

  type TaskRow = { milestone_id: string | null; status: string; priority: number };

  let total = 0;
  const tasksByMilestone = new Map<string, TaskRow[]>();

  for (const task of (tasks ?? []) as TaskRow[]) {
    if (!task.milestone_id) {
      if (task.status === 'completed') total += taskXp({ priority: task.priority });
      continue;
    }
    const list = tasksByMilestone.get(task.milestone_id) ?? [];
    list.push(task);
    tasksByMilestone.set(task.milestone_id, list);
  }

  for (const milestone of (milestones ?? []) as { id: string; completed: boolean }[]) {
    const list = tasksByMilestone.get(milestone.id) ?? [];
    total += list
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + taskXp({ priority: task.priority }), 0);

    const done = list.length > 0
      ? list.every(task => task.status === 'completed')
      : milestone.completed;
    if (done) total += MILESTONE_BONUS_XP;
  }

  return total;
}

export async function createQuest(
  userId: string,
  payload: { title: string; description?: string; goal?: string; vector: Vector; deadline?: string }
): Promise<Quest | null> {
  if (isDemoMode()) return demo.createQuest(userId, payload);

  const { data, error } = await supabase
    .from('missions')
    .insert({
      user_id: userId,
      title: payload.title,
      description: payload.description ?? null,
      goal: payload.goal ?? null,
      vector: payload.vector,
      deadline: payload.deadline ?? null,
      status: 'active',
      completion_rule: 'task_count',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('createQuest:', error);
    return null;
  }
  return rowToQuest(data);
}

export async function updateQuest(
  questId: string,
  userId: string,
  payload: Partial<{
    title: string;
    description: string | null;
    goal: string | null;
    vector: Vector;
    deadline: string | null;
    status: QuestStatus;
  }>
): Promise<boolean> {
  if (isDemoMode()) return demo.updateQuest(questId, userId, payload);

  const { error } = await supabase
    .from('missions')
    .update({ ...payload, updated_at: now() })
    .eq('id', questId)
    .eq('user_id', userId);

  if (error) console.error('updateQuest:', error);
  return !error;
}

export async function updateQuestStatus(questId: string, userId: string, status: QuestStatus): Promise<boolean> {
  if (isDemoMode()) return demo.updateQuestStatus(questId, userId, status);

  const { error } = await supabase
    .from('missions')
    .update({ status, updated_at: now() })
    .eq('id', questId)
    .eq('user_id', userId);

  if (error) console.error('updateQuestStatus:', error);
  return !error;
}

export async function deleteQuest(questId: string, userId: string): Promise<boolean> {
  if (isDemoMode()) return demo.deleteQuest(questId, userId);

  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', questId)
    .eq('user_id', userId);

  if (error) console.error('deleteQuest:', error);
  return !error;
}

/* ════════════════════════════════════════════════════════════════════════
   PLANS (milestones table)
   ════════════════════════════════════════════════════════════════════════ */

export async function getPlans(questId: string): Promise<Plan[]> {
  if (isDemoMode()) return demo.getPlans(questId);

  const byMission = await fetchPlansForMissions([questId]);
  return byMission.get(questId) ?? [];
}

/**
 * Fetch milestones + tasks for a set of quests in two queries, then group.
 * Orphan tasks (milestone_id = null) are surfaced in a synthetic plan so they
 * never silently disappear from the UI.
 */
async function fetchPlansForMissions(missionIds: string[]): Promise<Map<string, Plan[]>> {
  const result = new Map<string, Plan[]>();
  if (missionIds.length === 0) return result;

  const [{ data: milestones, error: planErr }, { data: tasks, error: taskErr }] = await Promise.all([
    supabase
      .from('milestones')
      .select('*')
      .in('mission_id', missionIds)
      .order('ordering', { ascending: true }),
    supabase
      .from('tasks')
      .select('*')
      .in('mission_id', missionIds)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (planErr) console.error('fetchPlansForMissions milestones:', planErr);
  if (taskErr) console.error('fetchPlansForMissions tasks:', taskErr);

  const allTasks = (tasks ?? []).map(rowToTask);
  const tasksByMilestone = new Map<string, Task[]>();
  for (const task of allTasks) {
    if (!task.plan_id) continue;
    const list = tasksByMilestone.get(task.plan_id) ?? [];
    list.push(task);
    tasksByMilestone.set(task.plan_id, list);
  }

  for (const id of missionIds) result.set(id, []);

  for (const row of milestones ?? []) {
    const planTasks = tasksByMilestone.get(row.id) ?? [];
    const progress  = computeProgress(planTasks);
    const status: PlanStatus = planTasks.length > 0
      ? (progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started')
      : (row.completed ? 'completed' : 'not_started');

    const plan: Plan = {
      ...rowToPlan(row),
      status,
      tasks: planTasks,
      progress,
    };
    result.get(row.mission_id)?.push(plan);
  }

  // Attach tasks that have no milestone so they remain actionable.
  for (const id of missionIds) {
    const orphanTasks = allTasks.filter(t => t.quest_id === id && !t.plan_id);
    if (orphanTasks.length === 0) continue;

    const plan: Plan = {
      id:          `unassigned:${id}`,
      quest_id:    id,
      title:       'Unassigned tasks',
      description: 'Tasks that are not part of a mission yet.',
      ordering:    9999,
      due_date:    null,
      status:      computeProgress(orphanTasks) === 100 ? 'completed' : 'in_progress',
      xp_required: null,
      created_at:  orphanTasks[0]?.created_at ?? now(),
      updated_at:  orphanTasks[0]?.updated_at ?? now(),
      tasks:       orphanTasks,
      progress:    computeProgress(orphanTasks),
      is_unassigned: true,
    };
    result.get(id)?.push(plan);
  }

  return result;
}

export async function createPlan(
  questId: string,
  payload: { title: string; description?: string; due_date?: string; ordering?: number; xp_required?: number | null }
): Promise<Plan | null> {
  if (isDemoMode()) return demo.createPlan(questId, payload);

  const row: Record<string, unknown> = {
    mission_id: questId,
    title: payload.title,
    description: payload.description ?? null,
    due_date: payload.due_date ?? null,
    ordering: payload.ordering ?? 0,
    completed: false,
  };
  if (typeof payload.xp_required === 'number') row.xp_required = payload.xp_required;

  let { data, error } = await supabase
    .from('milestones')
    .insert(row)
    .select()
    .single();

  // Older databases may not have the xp_required column yet. The roadmap then
  // falls back to sequential unlocking, so retry without the gate.
  if (error && isMissingXpColumn(error) && 'xp_required' in row) {
    console.warn('milestones.xp_required is missing; apply migrations/006_milestone_xp_gate.sql to store custom gates.');
    delete row.xp_required;
    ({ data, error } = await supabase.from('milestones').insert(row).select().single());
  }

  if (error || !data) {
    console.error('createPlan:', error);
    return null;
  }
  return { ...rowToPlan(data), tasks: [], progress: 0 };
}

export async function updatePlan(
  planId: string,
  payload: Partial<{ title: string; description: string | null; due_date: string | null; completed: boolean; xp_required: number | null }>
): Promise<boolean> {
  if (isDemoMode()) return demo.updatePlan(planId, payload);

  const patch: Record<string, unknown> = { ...payload, updated_at: now() };

  let { error } = await supabase
    .from('milestones')
    .update(patch)
    .eq('id', planId);

  if (error && isMissingXpColumn(error) && 'xp_required' in patch) {
    console.warn('milestones.xp_required is missing; apply migrations/006_milestone_xp_gate.sql to store custom gates.');
    delete patch.xp_required;
    ({ error } = await supabase.from('milestones').update(patch).eq('id', planId));
  }

  if (error) console.error('updatePlan:', error);
  return !error;
}

function isMissingXpColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42703'
    || error.code === 'PGRST204'
    || /xp_required/i.test(error.message ?? '');
}

export async function deletePlan(planId: string): Promise<boolean> {
  if (isDemoMode()) return demo.deletePlan(planId);

  // milestone_id is ON DELETE SET NULL, which would orphan tasks. Delete the
  // tasks explicitly so "delete mission" behaves the way the UI promises.
  const { error: taskErr } = await supabase
    .from('tasks')
    .delete()
    .eq('milestone_id', planId);

  if (taskErr) {
    console.error('deletePlan tasks:', taskErr);
    return false;
  }

  const { error } = await supabase.from('milestones').delete().eq('id', planId);
  if (error) console.error('deletePlan:', error);
  return !error;
}

/* ════════════════════════════════════════════════════════════════════════
   TASKS (tasks table)
   ════════════════════════════════════════════════════════════════════════ */

export async function createTask(
  questId: string,
  planId: string | null,
  payload: { title: string; description?: string; due_date?: string; priority?: number }
): Promise<Task | null> {
  if (isDemoMode()) return demo.createTask(questId, planId, payload);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      mission_id: questId,
      milestone_id: planId,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.due_date ?? null,
      priority: payload.priority ?? 2,
      status: 'not_started',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('createTask:', error);
    return null;
  }

  await logTaskEvent(data.id, 'created', null, data.title);
  return rowToTask(data);
}

export async function updateTask(
  taskId: string,
  payload: Partial<{
    title: string;
    description: string | null;
    due_date: string | null;
    priority: number;
  }>
): Promise<boolean> {
  if (isDemoMode()) return demo.updateTask(taskId, payload);

  const { data: current, error: readErr } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (readErr || !current) {
    console.error('updateTask read:', readErr);
    return false;
  }

  const { error } = await supabase
    .from('tasks')
    .update({ ...payload, updated_at: now() })
    .eq('id', taskId);

  if (error) {
    console.error('updateTask:', error);
    return false;
  }

  const changed = Object.keys(payload).filter(key => {
    const before = (current as Record<string, unknown>)[key];
    const after  = (payload as Record<string, unknown>)[key];
    return String(before ?? '') !== String(after ?? '');
  });

  if (changed.length > 0) {
    await logTaskEvent(
      taskId,
      'updated',
      changed.map(key => key.replace(/_/g, ' ')).join(', '),
      null
    );
  }
  return true;
}

/**
 * Move a task through its lifecycle. Logs an append-only task_event so the
 * quest detail can show an activity trail.
 */
export async function setTaskStatus(
  taskId: string,
  status: TaskStatus,
  previousStatus?: TaskStatus
): Promise<boolean> {
  if (isDemoMode()) return demo.setTaskStatus(taskId, status, previousStatus);

  let prev = previousStatus;
  if (!prev) {
    const { data } = await supabase.from('tasks').select('status').eq('id', taskId).single();
    prev = (data?.status as TaskStatus | undefined) ?? undefined;
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: status === 'completed' ? now() : null,
      updated_at: now(),
    })
    .eq('id', taskId);

  if (error) {
    console.error('setTaskStatus:', error);
    return false;
  }

  const eventType: TaskEventType = (
    {
      not_started: 'reopened',
      in_progress: 'started',
      blocked:     'blocked',
      skipped:     'skipped',
      completed:   'completed',
    } as const
  )[status];

  await logTaskEvent(taskId, eventType, prev ?? null, status);
  return true;
}

export async function completeTask(taskId: string, previousStatus?: TaskStatus): Promise<boolean> {
  return setTaskStatus(taskId, 'completed', previousStatus);
}

export async function uncompleteTask(taskId: string, previousStatus?: TaskStatus): Promise<boolean> {
  return setTaskStatus(taskId, 'not_started', previousStatus);
}

/** @deprecated use setTaskStatus — kept for callers that only change status. */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
  return setTaskStatus(taskId, status);
}

export async function deleteTask(taskId: string): Promise<boolean> {
  if (isDemoMode()) return demo.deleteTask(taskId);

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) console.error('deleteTask:', error);
  return !error;
}

/* ════════════════════════════════════════════════════════════════════════
   ACTIVITY (task_events table)
   ════════════════════════════════════════════════════════════════════════ */

export async function getQuestActivity(questId: string): Promise<TaskEvent[]> {
  if (isDemoMode()) return demo.getQuestActivity(questId);

  const { data: tasks, error: taskErr } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('mission_id', questId);

  if (taskErr || !tasks || tasks.length === 0) return [];

  const titleById = new Map<string, string>(tasks.map((t: any) => [t.id, t.title]));

  const { data: events, error } = await supabase
    .from('task_events')
    .select('*')
    .in('task_id', tasks.map((t: any) => t.id))
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !events) {
    if (error) console.error('getQuestActivity:', error);
    return [];
  }

  return events.map((row: any) => ({
    id:            row.id,
    task_id:       row.task_id,
    task_title:    titleById.get(row.task_id) ?? 'Task',
    event_type:    row.event_type as TaskEventType,
    previous_value: row.previous_value ?? null,
    new_value:      row.new_value ?? null,
    created_at:     row.created_at,
  }));
}

async function logTaskEvent(
  taskId: string,
  eventType: TaskEventType,
  previousValue: string | null,
  newValue: string | null
): Promise<void> {
  const { error } = await supabase
    .from('task_events')
    .insert({
      task_id: taskId,
      event_type: eventType,
      previous_value: previousValue,
      new_value: newValue,
    });

  // Activity is additive; a failed log must not fail the user's action.
  if (error) console.error('logTaskEvent:', error);
}

/* ════════════════════════════════════════════════════════════════════════
   ROW MAPPERS
   ════════════════════════════════════════════════════════════════════════ */

function rowToQuest(row: any): Quest {
  return {
    id:          row.id,
    user_id:     row.user_id,
    title:       row.title,
    description: row.description ?? null,
    goal:        row.goal ?? null,
    vector:      row.vector as Vector,
    status:      row.status as QuestStatus,
    deadline:    row.deadline ?? null,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
  };
}

function rowToPlan(row: any): Plan {
  return {
    id:          row.id,
    quest_id:    row.mission_id,
    title:       row.title,
    description: row.description ?? null,
    ordering:    row.ordering ?? 0,
    due_date:    row.due_date ?? null,
    status:      row.completed ? 'completed' : 'not_started',
    xp_required: typeof row.xp_required === 'number' ? row.xp_required : null,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
  };
}

function rowToTask(row: any): Task {
  const status = row.status as TaskStatus;
  return {
    id:           row.id,
    quest_id:     row.mission_id,
    plan_id:      row.milestone_id ?? null,
    title:        row.title,
    description:  row.description ?? null,
    status,
    priority:     row.priority ?? 2,
    due_date:     row.due_date ?? null,
    completed_at: row.completed_at ?? null,
    created_at:   row.created_at,
    updated_at:   row.updated_at,
    overdue:      isTaskOverdue(row.due_date ?? null, status),
  };
}
