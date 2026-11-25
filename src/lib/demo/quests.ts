/**
 * Local demo data for the quest board.
 *
 * When demo mode is on (see `src/lib/demo.ts`) every quest action is routed
 * here instead of Supabase. The data is seeded on first use and persisted in
 * localStorage, so the demo is fully interactive — create, edit, complete,
 * delete — without a network round-trip or a real account.
 */

import type {
  Plan, PlanStatus, Quest, QuestStatus, Task, TaskEvent, TaskEventType,
  TaskStatus, Vector,
} from '@/app/quests/types';
import { computeProgress, computeQuestProgress, computeQuestStats, isTaskOverdue } from '@/app/quests/types';
import { questClaimedXp, resolvePlanXp } from '@/app/quests/xp';

/* ════════════════════════════════════════════════════════════════════════
   STORED SHAPES (persisted; computed fields are derived on read)
   ════════════════════════════════════════════════════════════════════════ */

type StoredTask = Omit<Task, 'overdue'>;

interface StoredPlan {
  id: string;
  quest_id: string;
  title: string;
  description: string | null;
  ordering: number;
  due_date: string | null;
  status: PlanStatus;
  xp_required: number | null;
  created_at: string;
  updated_at: string;
  tasks: StoredTask[];
}

interface StoredQuest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal: string | null;
  vector: Vector;
  status: QuestStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  plans: StoredPlan[];
}

interface StoredEvent {
  id: string;
  task_id: string;
  task_title: string;
  event_type: TaskEventType;
  previous_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface DemoDb {
  version: number;
  quests: StoredQuest[];
  events: StoredEvent[];
}

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'm3triad:demo-db';

/* ════════════════════════════════════════════════════════════════════════
   STORAGE
   ════════════════════════════════════════════════════════════════════════ */

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
        if (parsed?.version === SCHEMA_VERSION && Array.isArray(parsed.quests)) {
          cache = parsed;
          return cache;
        }
      }
    } catch {
      /* corrupt or blocked storage — fall through to a fresh seed */
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
    /* storage full or blocked — the in-memory cache still works */
  }
}

/** Discard saved demo progress and start from the seed data again. */
export function resetDemoData(): void {
  cache = seed();
  persist(cache);
}

/* ════════════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════════════ */

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Date-only string (YYYY-MM-DD) offset from today. */
function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

/** Full ISO timestamp offset from now. */
function stamp(offsetDays = 0, offsetMinutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
}

/** Container plan that holds tasks without a milestone (mirrors milestone_id = null). */
function unassignedPlanId(questId: string): string {
  return `unassigned:${questId}`;
}

function isContainerPlan(plan: StoredPlan): boolean {
  return plan.id.startsWith('unassigned:');
}

function toTask(task: StoredTask): Task {
  return { ...task, overdue: isTaskOverdue(task.due_date, task.status) };
}

function toPlans(quest: StoredQuest): Plan[] {
  const plans: Plan[] = [];
  const orphans: Task[] = [];

  for (const plan of quest.plans) {
    const tasks = plan.tasks.map(toTask);

    if (isContainerPlan(plan)) {
      orphans.push(...tasks);
      continue;
    }

    const progress = computeProgress(tasks);
    const status: PlanStatus = tasks.length > 0
      ? (progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started')
      : plan.status;

    plans.push({ ...plan, tasks, progress, status });
  }

  if (orphans.length > 0) {
    const progress = computeProgress(orphans);
    plans.push({
      id: unassignedPlanId(quest.id),
      quest_id: quest.id,
      title: 'Unassigned tasks',
      description: 'Tasks that are not part of a mission yet.',
      ordering: 9999,
      due_date: null,
      status: progress === 100 ? 'completed' : 'in_progress',
      xp_required: null,
      created_at: orphans[0].created_at,
      updated_at: orphans[0].updated_at,
      tasks: orphans,
      progress,
      is_unassigned: true,
    });
  }

  return plans;
}

function claimedXpOf(db: DemoDb): number {
  return questClaimedXp(db.quests.flatMap(toPlans));
}

function hydrateQuest(quest: StoredQuest, claimedXp: number): Quest {
  const plans = resolvePlanXp(toPlans(quest), claimedXp);
  return {
    ...quest,
    plans,
    progress: computeQuestProgress(plans),
    stats: computeQuestStats(plans),
    claimedXp,
  };
}

function hydrateAll(db: DemoDb): Quest[] {
  const claimedXp = claimedXpOf(db);
  return db.quests.map(quest => hydrateQuest(quest, claimedXp));
}

function findQuest(db: DemoDb, questId: string): StoredQuest | undefined {
  return db.quests.find(quest => quest.id === questId);
}

function findTask(db: DemoDb, taskId: string): { quest: StoredQuest; plan: StoredPlan; task: StoredTask } | null {
  for (const quest of db.quests) {
    for (const plan of quest.plans) {
      const task = plan.tasks.find(t => t.id === taskId);
      if (task) return { quest, plan, task };
    }
  }
  return null;
}

function logEvent(
  db: DemoDb,
  taskId: string,
  taskTitle: string,
  eventType: TaskEventType,
  previousValue: string | null,
  newValue: string | null
): void {
  db.events.unshift({
    id: newId(),
    task_id: taskId,
    task_title: taskTitle,
    event_type: eventType,
    previous_value: previousValue,
    new_value: newValue,
    created_at: stamp(),
  });
}

const STATUS_EVENT: Record<TaskStatus, TaskEventType> = {
  not_started: 'reopened',
  in_progress: 'started',
  blocked: 'blocked',
  skipped: 'skipped',
  completed: 'completed',
};

/* ════════════════════════════════════════════════════════════════════════
   SEED DATA — three active quests, one per vector
   ════════════════════════════════════════════════════════════════════════ */

function seed(): DemoDb {
  const userId = '00000000-0000-4000-8000-000000000001';
  const createdAt = stamp(-24);

  type SeedTask = [title: string, description: string | null, priority: number, status: TaskStatus, dueOffset: number];
  type SeedPlan = [title: string, description: string | null, dueOffset: number, tasks: SeedTask[]];
  type SeedQuest = [title: string, goal: string, vector: Vector, deadlineOffset: number, plans: SeedPlan[]];

  const seeds: SeedQuest[] = [
    ['Master TypeScript', 'Ship three typed production features without a single `any`.', 'mind', 45, [
      ['Foundations', 'Types, generics and inference.', -10, [
        ['Type system fundamentals', 'Primitives, unions, narrowing.', 1, 'completed', -14],
        ['Generics and inference', 'Write reusable, inferred helpers.', 2, 'completed', -11],
      ]],
      ['Applied patterns', 'Use the type system on real product code.', 14, [
        ['Refactor the quest engine', 'Replace loose row types with discriminated unions.', 1, 'in_progress', 3],
        ['Type-safe Supabase client', 'Generated types wired through every query.', 2, 'blocked', -2],
        ['Write a generics cheatsheet', 'One page, examples only.', 3, 'not_started', 7],
      ]],
      ['Ship and teach', 'Turn the knowledge into output.', 30, [
        ['Build a typed CLI tool', 'Publish to npm.', 1, 'not_started', 21],
        ['Publish course notes', 'Twelve lessons.', 3, 'not_started', 28],
      ]],
    ]],
    ['Build SaaS Revenue', 'Reach £2,000 MRR from a product I own.', 'money', 60, [
      ['Validate the niche', 'Ten customer conversations and one paid pilot.', -20, [
        ['Interview 10 operators', 'Record the recurring pain.', 2, 'completed', -25],
        ['Run one paid pilot', 'Charge from day one.', 1, 'completed', -21],
      ]],
      ['Land the first customers', 'Convert the pilot into recurring revenue.', 21, [
        ['Rewrite the landing page', 'One promise, one call to action.', 1, 'completed', -3],
        ['Launch on two communities', 'Share the build story.', 2, 'in_progress', 2],
        ['Follow up with pilot leads', 'Personal emails, no templates.', 1, 'not_started', 4],
        ['Set up Stripe billing', 'Metered plans and invoices.', 2, 'not_started', 10],
      ]],
      ['Scale to £2K MRR', 'Repeatable acquisition, not one-off wins.', 55, [
        ['Write three case studies', 'Proof over promises.', 2, 'not_started', 35],
        ['Build a referral loop', 'In-product invite credit.', 3, 'not_started', 50],
      ]],
    ]],
    ['Complete the 60-Day Cut', 'Drop 6 kg while keeping strength on the big lifts.', 'muscle', 30, [
      ['Weeks 1–4', 'Build the habit and the baseline.', 2, [
        ['Log every meal for 14 days', 'No guesswork.', 1, 'completed', -9],
        ['Hit 8k steps daily', 'Walk after lunch.', 2, 'in_progress', 1],
        ['Bench 3×8 at 90 kg', 'Add 2.5 kg per week.', 1, 'not_started', 5],
      ]],
      ['Weeks 5–8', 'Push the deficit and protect recovery.', 30, [
        ['Sleep 7h 30m nightly', 'Phone out of the bedroom.', 2, 'not_started', 18],
        ['Weekly progress photos', 'Same light, same angle.', 3, 'not_started', 25],
      ]],
    ]],
  ];

  const events: StoredEvent[] = [];

  const quests: StoredQuest[] = seeds.map(([title, goal, vector, deadlineOffset, plans]) => {
    const questId = newId();
    const questCreatedAt = stamp(-30);

    const storedPlans: StoredPlan[] = plans.map(([planTitle, planDescription, planDueOffset, tasks], planIndex) => {
      const planId = newId();
      const planCreatedAt = createdAt;

      const storedTasks: StoredTask[] = tasks.map(([taskTitle, taskDescription, priority, status, dueOffset]) => {
        const taskId = newId();
        const taskCreatedAt = stamp(-20);
        const taskUpdatedAt = status === 'completed' ? stamp(dueOffset) : taskCreatedAt;

        events.push({
          id: newId(),
          task_id: taskId,
          task_title: taskTitle,
          event_type: 'created',
          previous_value: null,
          new_value: taskTitle,
          created_at: taskCreatedAt,
        });
        if (status === 'completed') {
          events.push({
            id: newId(),
            task_id: taskId,
            task_title: taskTitle,
            event_type: 'completed',
            previous_value: 'in_progress',
            new_value: 'completed',
            created_at: taskUpdatedAt,
          });
        } else if (status === 'in_progress') {
          events.push({
            id: newId(),
            task_id: taskId,
            task_title: taskTitle,
            event_type: 'started',
            previous_value: 'not_started',
            new_value: 'in_progress',
            created_at: stamp(-1, -120),
          });
        } else if (status === 'blocked') {
          events.push({
            id: newId(),
            task_id: taskId,
            task_title: taskTitle,
            event_type: 'blocked',
            previous_value: 'not_started',
            new_value: 'blocked',
            created_at: stamp(-2, -60),
          });
        }

        return {
          id: taskId,
          quest_id: questId,
          plan_id: planId,
          title: taskTitle,
          description: taskDescription,
          status,
          priority,
          due_date: day(dueOffset),
          completed_at: status === 'completed' ? stamp(dueOffset) : null,
          created_at: taskCreatedAt,
          updated_at: taskUpdatedAt,
        };
      });

      return {
        id: planId,
        quest_id: questId,
        title: planTitle,
        description: planDescription,
        ordering: planIndex,
        due_date: day(planDueOffset),
        status: 'not_started',
        xp_required: null,
        created_at: planCreatedAt,
        updated_at: planCreatedAt,
        tasks: storedTasks,
      };
    });

    return {
      id: questId,
      user_id: userId,
      title,
      description: null,
      goal,
      vector,
      status: 'active',
      deadline: day(deadlineOffset),
      created_at: questCreatedAt,
      updated_at: questCreatedAt,
      plans: storedPlans,
    };
  });

  events.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return { version: SCHEMA_VERSION, quests, events };
}

/* ════════════════════════════════════════════════════════════════════════
   QUESTS
   ════════════════════════════════════════════════════════════════════════ */

export async function getQuests(_userId: string): Promise<Quest[]> {
  const db = load();
  return hydrateAll(db).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function getQuestWithPlans(questId: string, _userId: string): Promise<Quest | null> {
  const db = load();
  const quest = findQuest(db, questId);
  return quest ? hydrateQuest(quest, claimedXpOf(db)) : null;
}

export async function getUserClaimedXp(_userId: string): Promise<number> {
  return claimedXpOf(load());
}

export async function createQuest(
  userId: string,
  payload: { title: string; description?: string; goal?: string; vector: Vector; deadline?: string }
): Promise<Quest | null> {
  const db = load();
  const now = stamp();
  const quest: StoredQuest = {
    id: newId(),
    user_id: userId,
    title: payload.title,
    description: payload.description ?? null,
    goal: payload.goal ?? null,
    vector: payload.vector,
    deadline: payload.deadline ?? null,
    status: 'active',
    created_at: now,
    updated_at: now,
    plans: [],
  };
  db.quests.unshift(quest);
  persist(db);
  return hydrateQuest(quest, claimedXpOf(db));
}

export async function updateQuest(
  questId: string,
  _userId: string,
  payload: Partial<{
    title: string;
    description: string | null;
    goal: string | null;
    vector: Vector;
    deadline: string | null;
    status: QuestStatus;
  }>
): Promise<boolean> {
  const db = load();
  const quest = findQuest(db, questId);
  if (!quest) return false;
  Object.assign(quest, payload, { updated_at: stamp() });
  persist(db);
  return true;
}

export async function updateQuestStatus(questId: string, _userId: string, status: QuestStatus): Promise<boolean> {
  return updateQuest(questId, _userId, { status });
}

export async function deleteQuest(questId: string, _userId: string): Promise<boolean> {
  const db = load();
  const index = db.quests.findIndex(quest => quest.id === questId);
  if (index === -1) return false;

  const taskIds = new Set(db.quests[index].plans.flatMap(plan => plan.tasks.map(task => task.id)));
  db.quests.splice(index, 1);
  db.events = db.events.filter(event => !taskIds.has(event.task_id));
  persist(db);
  return true;
}

/* ════════════════════════════════════════════════════════════════════════
   PLANS
   ════════════════════════════════════════════════════════════════════════ */

export async function getPlans(questId: string): Promise<Plan[]> {
  const db = load();
  const quest = findQuest(db, questId);
  return quest ? resolvePlanXp(toPlans(quest), claimedXpOf(db)) : [];
}

export async function createPlan(
  questId: string,
  payload: { title: string; description?: string; due_date?: string; ordering?: number; xp_required?: number | null }
): Promise<Plan | null> {
  const db = load();
  const quest = findQuest(db, questId);
  if (!quest) return null;

  const now = stamp();
  const plan: StoredPlan = {
    id: newId(),
    quest_id: questId,
    title: payload.title,
    description: payload.description ?? null,
    ordering: payload.ordering ?? quest.plans.length,
    due_date: payload.due_date ?? null,
    status: 'not_started',
    xp_required: typeof payload.xp_required === 'number' ? payload.xp_required : null,
    created_at: now,
    updated_at: now,
    tasks: [],
  };
  quest.plans.push(plan);
  persist(db);

  const hydrated = hydrateQuest(quest, claimedXpOf(db));
  return hydrated.plans?.find(p => p.id === plan.id) ?? null;
}

export async function updatePlan(
  planId: string,
  payload: Partial<{ title: string; description: string | null; due_date: string | null; completed: boolean; xp_required: number | null }>
): Promise<boolean> {
  const db = load();
  for (const quest of db.quests) {
    const plan = quest.plans.find(p => p.id === planId);
    if (!plan) continue;

    const { completed, ...rest } = payload;
    Object.assign(plan, rest, { updated_at: stamp() });
    if (typeof completed === 'boolean') {
      plan.status = completed ? 'completed' : 'not_started';
    }
    persist(db);
    return true;
  }
  return false;
}

export async function deletePlan(planId: string): Promise<boolean> {
  const db = load();
  for (const quest of db.quests) {
    const index = quest.plans.findIndex(p => p.id === planId);
    if (index === -1) continue;

    const taskIds = new Set(quest.plans[index].tasks.map(task => task.id));
    quest.plans.splice(index, 1);
    db.events = db.events.filter(event => !taskIds.has(event.task_id));
    persist(db);
    return true;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════════════════
   TASKS
   ════════════════════════════════════════════════════════════════════════ */

export async function createTask(
  questId: string,
  planId: string | null,
  payload: { title: string; description?: string; due_date?: string; priority?: number }
): Promise<Task | null> {
  const db = load();
  const quest = findQuest(db, questId);
  if (!quest) return null;

  const plan = planId ? quest.plans.find(p => p.id === planId) : undefined;
  if (planId && !plan) return null;

  const now = stamp();
  const task: StoredTask = {
    id: newId(),
    quest_id: questId,
    plan_id: planId,
    title: payload.title,
    description: payload.description ?? null,
    status: 'not_started',
    priority: payload.priority ?? 2,
    due_date: payload.due_date ?? null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  if (plan) {
    plan.tasks.push(task);
  } else {
    // Orphan task: no milestone yet, surfaced as an "unassigned" bucket on read.
    const unassigned = quest.plans.find(p => p.title === 'Unassigned tasks' && p.ordering === 9999);
    if (unassigned) {
      unassigned.tasks.push(task);
    } else {
      quest.plans.push({
        id: newId(),
        quest_id: questId,
        title: 'Unassigned tasks',
        description: 'Tasks that are not part of a mission yet.',
        ordering: 9999,
        due_date: null,
        status: 'not_started',
        xp_required: null,
        created_at: now,
        updated_at: now,
        tasks: [task],
      });
    }
  }

  logEvent(db, task.id, task.title, 'created', null, task.title);
  persist(db);
  return { ...task, overdue: isTaskOverdue(task.due_date, task.status) };
}

export async function updateTask(
  taskId: string,
  payload: Partial<{ title: string; description: string | null; due_date: string | null; priority: number }>
): Promise<boolean> {
  const db = load();
  const found = findTask(db, taskId);
  if (!found) return false;

  const { task } = found;
  const changed = (Object.keys(payload) as (keyof typeof payload)[])
    .filter(key => String((task as Record<string, unknown>)[key] ?? '') !== String(payload[key] ?? ''));

  Object.assign(task, payload, { updated_at: stamp() });

  if (changed.length > 0) {
    logEvent(db, task.id, task.title, 'updated', changed.map(key => key.replace(/_/g, ' ')).join(', '), null);
  }
  persist(db);
  return true;
}

export async function setTaskStatus(
  taskId: string,
  status: TaskStatus,
  previousStatus?: TaskStatus
): Promise<boolean> {
  const db = load();
  const found = findTask(db, taskId);
  if (!found) return false;

  const { task } = found;
  const previous = previousStatus ?? task.status;
  task.status = status;
  task.completed_at = status === 'completed' ? stamp() : null;
  task.updated_at = stamp();

  logEvent(db, task.id, task.title, STATUS_EVENT[status], previous, status);
  persist(db);
  return true;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const db = load();
  const found = findTask(db, taskId);
  if (!found) return false;

  found.plan!.tasks = found.plan!.tasks.filter(task => task.id !== taskId);
  db.events = db.events.filter(event => event.task_id !== taskId);
  persist(db);
  return true;
}

/* ════════════════════════════════════════════════════════════════════════
   ACTIVITY
   ════════════════════════════════════════════════════════════════════════ */

export async function getQuestActivity(questId: string): Promise<TaskEvent[]> {
  const db = load();
  const quest = findQuest(db, questId);
  if (!quest) return [];

  const titlesById = new Map<string, string>(
    quest.plans.flatMap(plan => plan.tasks.map(task => [task.id, task.title] as const))
  );

  return db.events
    .filter(event => titlesById.has(event.task_id))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 100)
    .map(event => ({
      id: event.id,
      task_id: event.task_id,
      task_title: titlesById.get(event.task_id) ?? event.task_title,
      event_type: event.event_type,
      previous_value: event.previous_value,
      new_value: event.new_value,
      created_at: event.created_at,
    }));
}
