'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import AppShell from '@/components/layouts/AppShell';
import {
  getQuests, getQuestWithPlans, getQuestActivity,
  createQuest, updateQuest, updateQuestStatus, deleteQuest,
  createPlan, updatePlan, deletePlan,
  createTask, setTaskStatus, updateTask, deleteTask,
} from './data';
import {
  isOverdue, priorityLabel, vectorLabel, VECTOR_OPTIONS, TASK_STATUS_OPTIONS,
  daysLeft, taskStatusLabel, isQuestAtRisk, questHealth,
} from './types';
import { formatXp, questClaimedXp, resolvePlanXp, taskXp, xpToGate } from './xp';
import type { Quest, Plan, Task, Vector, QuestStatus, TaskStatus, TaskEvent } from './types';
import styles from './page.module.css';

/* ── Tiny skeleton ─────────────────────────────────────────────────────── */
function Sk({ w = '100%', h = 20 }: { w?: string; h?: number }) {
  return <span className={styles.skeleton} style={{ width: w, height: h }} aria-hidden />;
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function QuestsPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [quests, setQuests]           = useState<Quest[]>([]);
  const [active, setActive]           = useState<Quest | null>(null);
  const activeIdRef                   = useRef<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError]     = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [addTaskPlanId, setAddTaskPlanId] = useState<string | null>(null);
  const [editQuestOpen, setEditQuestOpen] = useState(false);
  const [editPlan, setEditPlan]       = useState<Plan | null>(null);
  const [editTask, setEditTask]       = useState<Task | null>(null);

  /* Activity trail */
  const [activity, setActivity]       = useState<TaskEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  /* Toast */
  const [toast, setToast] = useState<{ id: number; type: 'success' | 'error'; message: string } | null>(null);
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ id: Date.now(), type, message });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  /* Filter state */
  const [search, setSearch]         = useState('');
  const [vectorFilter, setVectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'risk' | 'completed'>('all');
  const [sortBy, setSortBy]         = useState<'deadline' | 'progress' | 'created'>('deadline');

  useEffect(() => {
    if (!authLoading && !session) router.push('/auth/login');
  }, [authLoading, session, router]);

  const loadActivity = useCallback(async (questId: string) => {
    setActivityLoading(true);
    try {
      setActivity(await getQuestActivity(questId));
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const loadQuests = useCallback(async () => {
    if (!session?.user.id) return;
    setPageLoading(true);
    setPageError('');
    try {
      const data = await getQuests(session.user.id);
      setQuests(data);

      if (data.length === 0) {
        activeIdRef.current = null;
        setActive(null);
        setActivity([]);
        return;
      }

      const keep = data.find(q => q.id === activeIdRef.current) ?? data[0];
      activeIdRef.current = keep.id;
      setActive(keep);
      void loadActivity(keep.id);
    } catch {
      setPageError('Could not load your quests. Check your connection and try again.');
    } finally {
      setPageLoading(false);
    }
  }, [session?.user.id, loadActivity]);

  useEffect(() => { if (session) loadQuests(); }, [session, loadQuests]);

  /* Filtered + sorted quest list */
  const statusCounts = useMemo(() => ({
    all:       quests.length,
    active:    quests.filter(q => q.status === 'active').length,
    risk:      quests.filter(isQuestAtRisk).length,
    completed: quests.filter(q => q.status === 'completed').length,
  }), [quests]);

  const filteredQuests = useMemo(() => {
    const list = quests.filter(q => {
      if (vectorFilter !== 'all' && q.vector !== vectorFilter) return false;
      if (statusFilter === 'active' && q.status !== 'active') return false;
      if (statusFilter === 'risk' && !isQuestAtRisk(q)) return false;
      if (statusFilter === 'completed' && q.status !== 'completed') return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const haystack = [q.title, q.goal ?? '', q.description ?? ''].join(' ').toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'progress') return (a.progress ?? 0) - (b.progress ?? 0);
      if (sortBy === 'created')  return +new Date(b.created_at) - +new Date(a.created_at);
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return +new Date(a.deadline) - +new Date(b.deadline);
    });
  }, [quests, vectorFilter, statusFilter, search, sortBy]);

  const claimedXp = useMemo(
    () => quests.reduce((sum, q) => sum + questClaimedXp(q.plans ?? []), 0),
    [quests]
  );

  /* Keep the open quest inside the current filter set. */
  useEffect(() => {
    if (!active) return;
    if (filteredQuests.some(q => q.id === active.id)) return;
    const next = filteredQuests[0];
    if (next) {
      setActive(next);
      activeIdRef.current = next.id;
      void loadActivity(next.id);
    }
  }, [filteredQuests, active, loadActivity]);

  async function openQuest(quest: Quest) {
    if (!session?.user.id) return;
    setActive(quest);
    activeIdRef.current = quest.id;
    void loadActivity(quest.id);
    setDetailLoading(true);
    try {
      const full = await getQuestWithPlans(quest.id, session.user.id);
      if (full) {
        setActive(full);
        setQuests(prev => prev.map(q => q.id === full.id
          ? { ...q, progress: full.progress, stats: full.stats, plans: full.plans, claimedXp: full.claimedXp }
          : q
        ));
      }
    } catch {
      showToast('error', 'Could not load this quest.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshActive(): Promise<Quest | null> {
    if (!active || !session?.user.id) return null;
    setActivityLoading(true);
    try {
      const [full, events] = await Promise.all([
        getQuestWithPlans(active.id, session.user.id),
        getQuestActivity(active.id),
      ]);
      if (!full) return null;

      const nextList = quests.map(q => q.id === full.id ? { ...q, ...full } : q);
      const nextClaimed = nextList.reduce((sum, q) => sum + questClaimedXp(q.plans ?? []), 0);
      const resolved: Quest = {
        ...full,
        claimedXp: nextClaimed,
        plans: resolvePlanXp(full.plans ?? [], nextClaimed),
      };

      setQuests(nextList.map(q => q.id === resolved.id
        ? { ...q, plans: resolved.plans, progress: resolved.progress, stats: resolved.stats, claimedXp: nextClaimed }
        : q
      ));
      setActive(resolved);
      setActivity(events);
      return resolved;
    } catch {
      showToast('error', 'Could not refresh the quest.');
      return null;
    } finally {
      setActivityLoading(false);
    }
  }

  async function handleSetTaskStatus(task: Task, status: TaskStatus) {
    const plan = active?.plans?.find(p => p.id === task.plan_id);
    if (plan?.locked) {
      showToast('error', 'This milestone is locked. Claim more XP to open it.');
      return;
    }

    const lockedBefore = new Set(
      (active?.plans ?? []).filter(p => p.locked).map(p => p.id)
    );
    const gained = status === 'completed' && task.status !== 'completed' ? taskXp(task) : 0;

    const ok = await setTaskStatus(task.id, status, task.status);
    if (!ok) {
      showToast('error', 'Could not update the task.');
      return;
    }

    const updated = await refreshActive();
    const unlocked = (updated?.plans ?? []).filter(p => lockedBefore.has(p.id) && !p.locked);

    if (status === 'completed') {
      const reward = gained > 0 ? `+${gained} XP claimed · ` : '';
      if (unlocked.length > 0) {
        showToast('success', `${reward}🔓 Milestone unlocked — ${unlocked[0].title}`);
      } else {
        showToast('success', `${reward}Task completed.`);
      }
    } else if (status === 'in_progress') {
      showToast('success', 'Task started.');
    } else if (status === 'blocked') {
      showToast('success', 'Task marked as blocked.');
    } else if (status === 'skipped') {
      showToast('success', 'Task skipped.');
    }
  }

  async function handleToggleTask(task: Task) {
    await handleSetTaskStatus(task, task.status === 'completed' ? 'not_started' : 'completed');
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    const ok = await deleteTask(taskId);
    if (!ok) { showToast('error', 'Could not delete the task.'); return; }
    showToast('success', 'Task deleted.');
    await refreshActive();
  }

  async function handleDeletePlan(planId: string) {
    const ok = await deletePlan(planId);
    if (!ok) { showToast('error', 'Could not delete the mission.'); return; }
    showToast('success', 'Mission deleted.');
    await refreshActive();
  }

  async function handleQuestStatus(id: string, status: QuestStatus) {
    if (!session?.user.id) return;
    const ok = await updateQuestStatus(id, session.user.id, status);
    if (!ok) { showToast('error', 'Could not update quest status.'); return; }
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    if (active?.id === id) setActive(prev => prev ? { ...prev, status } : prev);
    showToast('success', `Quest marked ${status}.`);
  }

  async function handleDeleteQuest(id: string) {
    if (!session?.user.id) return;
    const ok = await deleteQuest(id, session.user.id);
    if (!ok) { showToast('error', 'Could not delete the quest.'); return; }
    const remaining = quests.filter(q => q.id !== id);
    setQuests(remaining);
    if (active?.id === id) {
      activeIdRef.current = remaining[0]?.id ?? null;
      setActive(remaining[0] ?? null);
      setActivity([]);
      if (remaining[0]) void loadActivity(remaining[0].id);
    }
    showToast('success', 'Quest deleted.');
  }

  async function handleSaveQuest(id: string, payload: Parameters<typeof updateQuest>[2]) {
    if (!session?.user.id) return false;
    const ok = await updateQuest(id, session.user.id, payload);
    if (!ok) { showToast('error', 'Could not save the quest.'); return false; }
    showToast('success', 'Quest updated.');
    await refreshActive();
    return true;
  }

  async function handleSavePlan(planId: string, payload: Parameters<typeof updatePlan>[1]) {
    const ok = await updatePlan(planId, payload);
    if (!ok) { showToast('error', 'Could not save the mission.'); return false; }
    showToast('success', 'Mission updated.');
    await refreshActive();
    return true;
  }

  async function handleSaveTask(taskId: string, payload: Parameters<typeof updateTask>[1]) {
    const ok = await updateTask(taskId, payload);
    if (!ok) { showToast('error', 'Could not save the task.'); return false; }
    showToast('success', 'Task updated.');
    await refreshActive();
    return true;
  }

  if (authLoading || pageLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <Sk w="260px" h={28} />
          </div>
          <div className={styles.questCards}>
            {[1, 2, 3].map(n => <Sk key={n} h={150} />)}
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailMain}>
              <Sk h={180} /><Sk h={260} /><Sk h={200} />
            </div>
            <div className={styles.rail}>
              <Sk h={180} /><Sk h={140} />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!session) return null;

  return (
    <AppShell>
      <div className={styles.page}>

        {/* Page header */}
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              Strategic operation · {statusCounts.active} active {statusCounts.active === 1 ? 'track' : 'tracks'}
            </span>
            <h1 className={styles.pageTitle}>Quests and Missions</h1>
            <p className={styles.pageSubtitle}>
              Transform long-term goals into sequential plans, milestones and daily execution.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + Create new quest
          </button>
        </header>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M6 11A5 5 0 1 0 6 1a5 5 0 0 0 0 10ZM13 13l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search missions, plans, or goals…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search quests"
            />
          </div>

          <div className={styles.filterTabs}>
            <div className={styles.filterTabGroup}>
              {(['all', 'mind', 'muscle', 'money'] as const).map(v => (
                <button
                  key={v}
                  className={[
                    styles.filterTab,
                    vectorFilter === v ? styles.filterTabActive : '',
                    v === 'mind'   ? styles.filterTabMind   : '',
                    v === 'muscle' ? styles.filterTabMuscle : '',
                    v === 'money'  ? styles.filterTabMoney  : '',
                  ].join(' ')}
                  onClick={() => setVectorFilter(v)}
                  aria-pressed={vectorFilter === v}
                >
                  {v === 'all' ? 'ALL' : v.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.filterStatusGroup}>
              {([
                ['active', 'Active', styles.dotActive],
                ['risk', 'At risk', styles.dotRisk],
                ['completed', 'Completed', styles.dotCompleted],
              ] as const).map(([key, label, dot]) => (
                <button
                  key={key}
                  className={`${styles.statusFilterDot} ${statusFilter === key ? styles.statusFilterDotActive : ''}`}
                  onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                  aria-pressed={statusFilter === key}
                >
                  <span className={`${styles.dot} ${dot}`} aria-hidden />
                  {label}
                  <span className={styles.filterCount}>{statusCounts[key]}</span>
                </button>
              ))}
            </div>

            <label className={styles.sortWrap}>
              <span className={styles.sortLabel}>Sort</span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="deadline">Deadline (nearest)</option>
                <option value="progress">Progress (low first)</option>
                <option value="created">Recently created</option>
              </select>
            </label>
          </div>
        </div>

        {pageError && (
          <div className={styles.errorState} role="alert">
            <span className={styles.errorIcon}>⚠</span>
            <p>{pageError}</p>
            <button className="btn-secondary" onClick={loadQuests}>Retry</button>
          </div>
        )}

        {quests.length === 0 ? (
          <div className={styles.emptyQuests}>
            <span className={styles.emptyQuestsIcon} aria-hidden>⚔</span>
            <h2>No quests yet</h2>
            <p>
              A quest is a long-term goal. Break it into milestones, then execute the
              tasks that move it forward. XP claimed from finished work unlocks what comes next.
            </p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              + Create your first quest
            </button>
          </div>
        ) : (
          <>
            <section className={styles.questCards} aria-label="Quests">
              {filteredQuests.map(q => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  selected={active?.id === q.id}
                  onSelect={() => openQuest(q)}
                />
              ))}
            </section>

            {filteredQuests.length === 0 && (
              <div className={styles.noResults}>
                <p>No quests match these filters.</p>
                <button
                  className="btn-secondary"
                  onClick={() => { setSearch(''); setVectorFilter('all'); setStatusFilter('all'); }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {active && (
              <section className={styles.detail} aria-label="Quest detail">
                {detailLoading ? (
                  <div className={styles.detailLoading}>
                    <Sk h={180} /><Sk h={80} /><Sk h={260} />
                  </div>
                ) : (
                  <QuestDetail
                    key={active.id}
                    quest={active}
                    claimedXp={claimedXp}
                    activity={activity}
                    activityLoading={activityLoading}
                    onToggleTask={handleToggleTask}
                    onSetTaskStatus={handleSetTaskStatus}
                    onEditTask={setEditTask}
                    onDeleteTask={handleDeleteTask}
                    onEditPlan={setEditPlan}
                    onDeletePlan={handleDeletePlan}
                    onEditQuest={() => setEditQuestOpen(true)}
                    onQuestStatus={handleQuestStatus}
                    onDeleteQuest={handleDeleteQuest}
                    onAddPlan={() => setShowAddPlan(true)}
                    onAddTask={(planId) => setAddTaskPlanId(planId)}
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateQuestWizard
          onClose={() => setShowCreate(false)}
          onCreated={async (q) => {
            setQuests(prev => [q, ...prev]);
            setShowCreate(false);
            await openQuest(q);
          }}
          userId={session.user.id}
        />
      )}

      {showAddPlan && active && (
        <AddPlanModal
          questId={active.id}
          nextOrder={(active.plans?.filter(p => !p.is_unassigned).length ?? 0) + 1}
          onClose={() => setShowAddPlan(false)}
          onCreated={() => { setShowAddPlan(false); refreshActive(); }}
        />
      )}

      {addTaskPlanId && active && (
        <AddTaskModal
          questId={active.id}
          planId={addTaskPlanId}
          onClose={() => setAddTaskPlanId(null)}
          onCreated={() => { setAddTaskPlanId(null); refreshActive(); }}
        />
      )}

      {editQuestOpen && active && (
        <EditQuestModal
          quest={active}
          onClose={() => setEditQuestOpen(false)}
          onSave={async (payload) => {
            const ok = await handleSaveQuest(active.id, payload);
            if (ok) setEditQuestOpen(false);
            return ok;
          }}
        />
      )}

      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={async (payload) => {
            const ok = await handleSavePlan(editPlan.id, payload);
            if (ok) setEditPlan(null);
            return ok;
          }}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={async (payload) => {
            const ok = await handleSaveTask(editTask.id, payload);
            if (ok) setEditTask(null);
            return ok;
          }}
        />
      )}

      {toast && (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span aria-hidden>{toast.type === 'success' ? '✓' : '⚠'}</span>
          {toast.message}
        </div>
      )}
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   QUEST CARD — the mission track selector
   ════════════════════════════════════════════════════════════════════════ */
function QuestCard({
  quest,
  selected,
  onSelect,
}: {
  quest: Quest;
  selected: boolean;
  onSelect: () => void;
}) {
  const risk = isQuestAtRisk(quest);
  const stats = quest.stats;

  const label =
    quest.status === 'completed' ? 'COMPLETED'
    : quest.status === 'paused' ? 'PAUSED'
    : quest.status === 'cancelled' ? 'CANCELLED'
    : quest.status === 'draft' ? 'DRAFT'
    : risk ? 'AT RISK' : 'ON TRACK';

  const tone =
    quest.status === 'completed' ? styles.healthDone
    : quest.status === 'paused' ? styles.healthPaused
    : quest.status === 'cancelled' ? styles.healthIdle
    : quest.status === 'draft' ? styles.healthIdle
    : risk ? styles.healthRisk : styles.healthOk;

  return (
    <button
      type="button"
      className={`${styles.questCard} ${selected ? styles.questCardSelected : ''}`}
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
    >
      <div className={styles.questCardTop}>
        <span className={`${styles.vecChip} ${styles[`vec_${quest.vector}`]}`}>
          {quest.vector.toUpperCase()}
        </span>
        <span className={`${styles.healthChip} ${tone}`}>{label}</span>
      </div>
      <h2 className={styles.questCardTitle}>{quest.title}</h2>
      <p className={styles.questCardDesc}>
        {quest.description || quest.goal || 'No mission brief yet.'}
      </p>
      <div className={styles.questCardProgressRow}>
        <span className={styles.questCardPct}>{quest.progress ?? 0}%</span>
        <div
          className={styles.questCardTrack}
          role="progressbar"
          aria-valuenow={quest.progress ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`${styles.questCardFill} ${styles[`fill_${quest.vector}`]}`}
            style={{ width: `${quest.progress ?? 0}%` }}
          />
        </div>
      </div>
      <p className={styles.questCardMeta}>
        {stats?.completedPlans ?? 0}/{stats?.totalPlans ?? 0} plans complete
        {quest.deadline && <> · Due {formatDate(quest.deadline)}</>}
        {risk && stats && stats.overdueTasks > 0 && <> · {stats.overdueTasks} overdue</>}
      </p>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   QUEST DETAIL — reference layout: main roadmap + telemetry rail
   ════════════════════════════════════════════════════════════════════════ */
function QuestDetail({
  quest,
  claimedXp,
  activity,
  activityLoading,
  onToggleTask,
  onSetTaskStatus,
  onEditTask,
  onDeleteTask,
  onEditPlan,
  onDeletePlan,
  onEditQuest,
  onQuestStatus,
  onDeleteQuest,
  onAddPlan,
  onAddTask,
}: {
  quest: Quest;
  claimedXp: number;
  activity: TaskEvent[];
  activityLoading: boolean;
  onToggleTask: (t: Task) => void;
  onSetTaskStatus: (t: Task, status: TaskStatus) => void;
  onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditPlan: (p: Plan) => void;
  onDeletePlan: (id: string) => void;
  onEditQuest: () => void;
  onQuestStatus: (id: string, s: QuestStatus) => void;
  onDeleteQuest: (id: string) => void;
  onAddPlan: () => void;
  onAddTask: (planId: string) => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'open' | 'done'>('all');

  const isActive    = quest.status === 'active';
  const isCompleted = quest.status === 'completed';
  const isPaused    = quest.status === 'paused';
  const isClosed    = isCompleted || quest.status === 'cancelled';
  const stats       = quest.stats ?? {
    totalTasks: 0, completedTasks: 0, overdueTasks: 0, blockedTasks: 0,
    inProgressTasks: 0, totalPlans: 0, completedPlans: 0,
  };
  const progress    = quest.progress ?? 0;
  const remaining   = daysLeft(quest.deadline);
  const health      = questHealth(quest);

  const plans      = quest.plans ?? [];
  const realPlans  = plans.filter(p => !p.is_unassigned);
  const unassigned = plans.find(p => p.is_unassigned);

  const selectedPlan = realPlans.find(p => p.id === selectedPlanId)
    ?? realPlans.find(p => p.is_active)
    ?? realPlans.find(p => !p.locked && p.status !== 'completed')
    ?? realPlans[0]
    ?? null;
  const selectedIndex = selectedPlan ? realPlans.indexOf(selectedPlan) : -1;

  const tasks = selectedPlan?.tasks ?? [];
  const visibleTasks = tasks.filter(task =>
    taskFilter === 'open' ? task.status !== 'completed' && task.status !== 'skipped'
    : taskFilter === 'done' ? task.status === 'completed'
    : true
  );
  const nextTask = [...tasks]
    .filter(task => task.status !== 'completed' && task.status !== 'skipped')
    .sort((a, b) =>
      a.priority - b.priority
      || (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31')
    )[0];

  const activeSprints = realPlans.filter(p => p.is_active).length;
  const futurePhases  = realPlans.filter(p => p.locked || (p.status === 'not_started' && !p.is_active)).length;

  const donePct = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : stats.totalPlans > 0 ? Math.round((stats.completedPlans / stats.totalPlans) * 100) : 0;
  const runningPct = stats.totalTasks > 0
    ? Math.min(100 - donePct, Math.round((stats.inProgressTasks / stats.totalTasks) * 100))
    : 0;

  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailMain}>

        {/* ── Mission header ─────────────────────────────────────────── */}
        <article className={styles.questHeaderCard}>
          <div className={styles.questHeaderTop}>
            <div className={styles.questChips}>
              <span className={`${styles.vecChip} ${styles[`vec_${quest.vector}`]}`}>
                {vectorLabel(quest.vector as Vector)}
              </span>
              <span className={`${styles.statusChip} ${styles[`status_${quest.status}`]}`}>
                {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
              </span>
              {isQuestAtRisk(quest) && <span className={styles.riskChip}>AT RISK</span>}
            </div>

            <div className={styles.questHeaderActions}>
              <button className={styles.textActionBtn} onClick={onEditQuest}>✎ Edit</button>
              {quest.status === 'draft' && (
                <button className={styles.smallBtn} onClick={() => onQuestStatus(quest.id, 'active')}>Activate</button>
              )}
              {isActive && (
                <button className={styles.smallBtn} onClick={() => onQuestStatus(quest.id, 'paused')}>Pause</button>
              )}
              {isPaused && (
                <button className={styles.smallBtn} onClick={() => onQuestStatus(quest.id, 'active')}>Resume</button>
              )}
              {!isClosed && quest.status !== 'draft' && (
                <button className={styles.smallBtn} onClick={() => onQuestStatus(quest.id, 'completed')}>
                  Mark complete
                </button>
              )}
              {isClosed && (
                <button className={styles.smallBtn} onClick={() => onQuestStatus(quest.id, 'active')}>Reopen</button>
              )}
              {(isActive || isPaused) && (
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    if (confirm('Cancel this quest? You can reopen it later.')) onQuestStatus(quest.id, 'cancelled');
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  if (confirm('Delete this quest and all its missions and tasks?')) {
                    onDeleteQuest(quest.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>

          <h2 className={styles.detailTitle}>{quest.title}</h2>

          <p className={styles.questMetaLine}>
            {quest.deadline ? (
              <>Deadline: {formatDate(quest.deadline)} · <strong>{
                remaining === null ? '' : remaining < 0
                  ? `${Math.abs(remaining)} days overdue`
                  : `${remaining} days remaining`
              }</strong> · </>
            ) : ('No deadline set · ')}
            Health: <strong>{health.score}% {health.label}</strong> · <strong>{formatXp(claimedXp)} XP claimed</strong>
          </p>

          {quest.goal && (
            <div className={styles.dodBox}>
              <span className={styles.dodLabel}>Mission success criteria (definition of done)</span>
              <p className={styles.dodText}>{quest.goal}</p>
            </div>
          )}

          <div className={styles.progressHead}>
            <span className={styles.progressHeadLabel}>Weighted mission progress</span>
            <span className={styles.progressHeadValue}>
              {progress}%
              <span className={styles.progressHeadSub}> ({stats.completedTasks} / {stats.totalTasks} Tasks)</span>
            </span>
          </div>
          <div
            className={styles.segTrack}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.segDone} style={{ width: `${donePct}%` }} />
            <div className={styles.segRunning} style={{ width: `${runningPct}%` }} />
          </div>
          <div className={styles.phaseRow}>
            <span className={styles.phaseItem}><i className={`${styles.phaseDot} ${styles.phaseDotDone}`} />{stats.completedPlans} Completed Plans</span>
            <span className={styles.phaseItem}><i className={`${styles.phaseDot} ${styles.phaseDotActive}`} />{activeSprints} Active Sprint{activeSprints === 1 ? '' : 's'}</span>
            <span className={styles.phaseItem}><i className={`${styles.phaseDot} ${styles.phaseDotFuture}`} />{futurePhases} Future Phase{futurePhases === 1 ? '' : 's'}</span>
          </div>
        </article>

        {/* ── Roadmap ───────────────────────────────────────────────── */}
        <section className={styles.panel} aria-label="Plan roadmap and milestones">
          <header className={styles.panelHead}>
            <div>
              <span className={styles.panelKicker}>Roadmap</span>
              <h3 className={styles.panelTitle}>Plan roadmap &amp; milestones</h3>
            </div>
            <button className={styles.panelAction} onClick={onAddPlan}>+ Add plan</button>
          </header>

          <div className={styles.xpLegend}>
            <span className={styles.xpLegendValue}>{formatXp(claimedXp)} XP claimed</span>
            <span className={styles.xpLegendHint}>Finish tasks to claim XP. Each milestone opens at its gate.</span>
          </div>

          {realPlans.length === 0 && !unassigned ? (
            <div className={styles.panelEmpty}>
              <p>No milestones yet. Add a plan to map the route to done.</p>
              <button className={styles.smallBtn} onClick={onAddPlan}>+ Add first plan</button>
            </div>
          ) : (
            <div className={styles.planList}>
              {realPlans.map((plan, index) => (
                <RoadmapPlan
                  key={plan.id}
                  plan={plan}
                  index={index}
                  prevPlan={realPlans[index - 1]}
                  claimedXp={claimedXp}
                  selected={selectedPlan?.id === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id)}
                  onEdit={() => onEditPlan(plan)}
                  onDelete={() => {
                    if (confirm('Delete this milestone and all its tasks?')) onDeletePlan(plan.id);
                  }}
                />
              ))}
              {unassigned && (
                <RoadmapPlan
                  plan={unassigned}
                  index={realPlans.length}
                  claimedXp={claimedXp}
                  selected={selectedPlan?.id === unassigned.id}
                  onSelect={() => setSelectedPlanId(unassigned.id)}
                />
              )}
            </div>
          )}
        </section>

        {/* ── Task execution ────────────────────────────────────────── */}
        <section className={styles.panel} aria-label="Task execution log">
          <header className={styles.panelHead}>
            <div>
              <span className={styles.panelKicker}>
                {selectedPlan ? (selectedPlan.is_unassigned ? 'Unassigned' : `Plan ${String(selectedIndex + 1).padStart(2, '0')}`) : 'Execution'}
              </span>
              <h3 className={styles.panelTitle}>Task execution log</h3>
            </div>
            <div className={styles.panelActions}>
              <select
                className={styles.filterSelect}
                value={taskFilter}
                onChange={e => setTaskFilter(e.target.value as typeof taskFilter)}
                aria-label="Filter tasks"
              >
                <option value="all">Filter: All</option>
                <option value="open">Filter: Open</option>
                <option value="done">Filter: Done</option>
              </select>
              <button
                className={styles.panelAction}
                onClick={() => selectedPlan && !selectedPlan.is_unassigned && onAddTask(selectedPlan.id)}
                disabled={!selectedPlan || !!selectedPlan.locked || !!selectedPlan.is_unassigned}
              >
                + Add task
              </button>
            </div>
          </header>

          {!selectedPlan ? (
            <div className={styles.panelEmpty}>
              <p>Select a milestone to see its tasks.</p>
            </div>
          ) : selectedPlan.locked ? (
            <div className={styles.lockedNotice}>
              <span className={styles.lockedNoticeIcon} aria-hidden>🔒</span>
              <div>
                <p className={styles.lockedNoticeTitle}>{selectedPlan.title} is locked</p>
                <p className={styles.lockedNoticeText}>
                  Claim {formatXp(xpToGate(selectedPlan, claimedXp))} more XP to open this milestone.
                  Finish tasks in the current focus milestone to get there.
                </p>
              </div>
            </div>
          ) : (
            <>
              {nextTask && (
                <div className={styles.criticalBanner}>
                  <div className={styles.criticalText}>
                    <span className={styles.criticalKicker}>Next critical task</span>
                    <p className={styles.criticalTitle}>{nextTask.title}</p>
                  </div>
                  <span className={styles.xpChip}>+{taskXp(nextTask)} {quest.vector.toUpperCase()} XP</span>
                  {nextTask.due_date && (
                    <span className={styles.duePill}>Due {formatShortDate(nextTask.due_date)}</span>
                  )}
                  {nextTask.status !== 'in_progress' && (
                    <button className={styles.criticalBtn} onClick={() => onSetTaskStatus(nextTask, 'in_progress')}>
                      Mark active
                    </button>
                  )}
                </div>
              )}

              {visibleTasks.length === 0 ? (
                <p className={styles.noTasks}>
                  {tasks.length === 0 ? 'No tasks in this milestone yet.' : 'No tasks match this filter.'}
                </p>
              ) : (
                <ol className={styles.execList}>
                  {visibleTasks.map((task, index) => (
                    <ExecutionTaskRow
                      key={task.id}
                      task={task}
                      index={index + 1}
                      vector={quest.vector as Vector}
                      onToggle={() => onToggleTask(task)}
                      onStatusChange={status => onSetTaskStatus(task, status)}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                </ol>
              )}

              <footer className={styles.execFooter}>
                <span>Showing {visibleTasks.length} of {tasks.length} tasks for this milestone</span>
                {selectedPlan.xp_earned !== undefined && (
                  <span className={styles.execFooterXp}>
                    {formatXp(selectedPlan.xp_earned)} / {formatXp(selectedPlan.xp_potential ?? 0)} XP claimed
                  </span>
                )}
              </footer>
            </>
          )}
        </section>

        {/* ── Action log ────────────────────────────────────────────── */}
        <section className={styles.panel} aria-label="Action log and work records">
          <header className={styles.panelHead}>
            <div>
              <span className={styles.panelKicker}>Append-only</span>
              <h3 className={styles.panelTitle}>Action log &amp; work records</h3>
            </div>
            <span className={styles.recordCount}>{activity.length} records</span>
          </header>
          <ActivityLog events={activity} loading={activityLoading} />
        </section>
      </div>

      {/* ── Telemetry rail ──────────────────────────────────────────── */}
      <aside className={styles.rail} aria-label="Quest telemetry">
        <TelemetryCard quest={quest} activity={activity} claimedXp={claimedXp} />
        <DeadlinesCard quest={quest} />
        <YieldCard quest={quest} claimedXp={claimedXp} />
        <RecentActivityCard activity={activity} loading={activityLoading} />
      </aside>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ROADMAP PLAN CARD
   ════════════════════════════════════════════════════════════════════════ */
function RoadmapPlan({
  plan,
  index,
  prevPlan,
  claimedXp,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  index: number;
  prevPlan?: Plan;
  claimedXp: number;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const tasks    = plan.tasks ?? [];
  const done     = tasks.filter(t => t.status === 'completed').length;
  const progress = plan.progress ?? 0;
  const locked   = !!plan.locked && !plan.is_unassigned;
  const active   = !!plan.is_active;
  const finished = plan.status === 'completed';

  const statusLabel = locked ? 'LOCKED'
    : finished ? 'DONE'
    : active ? 'ACTIVE FOCUS'
    : progress > 0 ? 'IN PROGRESS'
    : 'QUEUED';

  const gate    = plan.xp_gate ?? 0;
  const toGo    = Math.max(0, gate - claimedXp);
  const gatePct = gate > 0 ? Math.min(100, Math.round((claimedXp / gate) * 100)) : 100;

  return (
    <article
      className={[
        styles.planCard,
        finished ? styles.planDone : '',
        active ? styles.planActive : '',
        locked ? styles.planLocked : '',
        plan.is_unassigned ? styles.planUnassigned : '',
        selected ? styles.planSelected : '',
      ].join(' ')}
      onClick={() => { if (!locked) onSelect(); }}
      onKeyDown={event => {
        if (!locked && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      aria-current={selected ? 'true' : undefined}
    >
      <div className={styles.planCardBody}>
        <div className={styles.planCardTop}>
          <span className={styles.planCardNum}>
            {plan.is_unassigned ? '!!' : `PLAN ${String(index + 1).padStart(2, '0')}`}
          </span>
          <h4 className={styles.planCardTitle}>{plan.title}</h4>
          {active && <span className={styles.planCardPct}>{progress}%</span>}
          <span className={[
            styles.planStatusChip,
            locked ? styles.statusLocked : '',
            finished ? styles.statusDone : '',
            active ? styles.statusActiveFocus : '',
          ].join(' ')}>
            {locked ? '🔒 LOCKED' : statusLabel}
          </span>
        </div>

        {plan.description && <p className={styles.planCardDesc}>{plan.description}</p>}

        {!locked && progress > 0 && (
          <div className={styles.planCardTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.planCardFill} style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className={styles.planCardFooter}>
          <span className={styles.planTaskCount}>{done}/{tasks.length} Tasks</span>
          {plan.due_date && <span className={styles.planDue}>Due {formatDate(plan.due_date)}</span>}
          {plan.is_unassigned && <span className={styles.planNote}>Tasks outside the roadmap</span>}
          {locked && <span className={styles.planLockNote}>Unlock at {formatXp(gate)} XP · {formatXp(toGo)} to go</span>}
          {!locked && !finished && !active && <span className={styles.planNote}>Ready to open</span>}
        </div>

        {locked && (
          <>
            <div className={styles.lockTrack}>
              <div className={styles.lockFill} style={{ width: `${gatePct}%` }} />
            </div>
            {prevPlan && (
              <span className={styles.dependencyNote}>
                Depends on {prevPlan.title} · {formatXp(gate)} XP gate
              </span>
            )}
          </>
        )}
      </div>

      {!plan.is_unassigned && (
        <div className={styles.planCardActions}>
          <button
            className={styles.planIconBtn}
            onClick={event => { event.stopPropagation(); onEdit?.(); }}
            aria-label={`Edit milestone ${plan.title}`}
            title="Edit milestone"
          >
            ✎
          </button>
          <button
            className={styles.planDeleteBtn}
            onClick={event => { event.stopPropagation(); onDelete?.(); }}
            aria-label={`Delete milestone ${plan.title}`}
            title="Delete milestone"
          >
            ✕
          </button>
        </div>
      )}
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EXECUTION TASK ROW
   ════════════════════════════════════════════════════════════════════════ */
function ExecutionTaskRow({
  task,
  index,
  vector,
  onToggle,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  vector: Vector;
  onToggle: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done    = task.status === 'completed';
  const skipped = task.status === 'skipped';
  const blocked = task.status === 'blocked';
  const overdue = task.overdue;

  return (
    <li className={[
      styles.execRow,
      done ? styles.execDone : '',
      overdue ? styles.execOverdue : '',
      blocked ? styles.execBlocked : '',
      skipped ? styles.execSkipped : '',
    ].join(' ')}>
      <span className={styles.execNum}>{String(index).padStart(2, '0')}</span>

      <button
        className={`${styles.taskCheck} ${done ? styles.taskCheckDone : ''}`}
        onClick={onToggle}
        aria-label={done ? `Reopen: ${task.title}` : `Complete: ${task.title}`}
        aria-pressed={done}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className={styles.execBody}>
        <span className={`${styles.execTitle} ${done || skipped ? styles.taskTitleDone : ''}`}>
          {task.title}
        </span>
        {task.description && <span className={styles.taskDesc}>{task.description}</span>}
        <div className={styles.execMeta}>
          <span className={`${styles.taskPriority} ${styles[`priority_${task.priority}`]}`}>
            {priorityLabel(task.priority)}
          </span>
          {task.due_date && (
            <span className={`${styles.taskDue} ${overdue ? styles.deadlineOverdue : ''}`}>
              {overdue ? '⚠ ' : ''}Due {formatShortDate(task.due_date)}
            </span>
          )}
          {overdue && <span className={styles.overdueTag}>OVERDUE</span>}
          <span className={styles.xpChipSmall}>+{taskXp(task)} {vector.toUpperCase()} XP</span>
        </div>
      </div>

      <div className={styles.execRight}>
        <select
          className={`${styles.taskStatusSelect} ${styles[`taskStatus_${task.status}`]}`}
          value={task.status}
          onChange={e => onStatusChange(e.target.value as TaskStatus)}
          aria-label={`Status for ${task.title}: ${taskStatusLabel(task.status)}`}
        >
          {TASK_STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          className={styles.taskEditBtn}
          onClick={onEdit}
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
        >
          ✎
        </button>
        <button
          className={styles.taskDeleteBtn}
          onClick={onDelete}
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TELEMETRY RAIL CARDS
   ════════════════════════════════════════════════════════════════════════ */
function TelemetryCard({
  quest,
  activity,
  claimedXp,
}: {
  quest: Quest;
  activity: TaskEvent[];
  claimedXp: number;
}) {
  const stats = quest.stats;
  const remaining = stats ? Math.max(0, stats.totalTasks - stats.completedTasks) : 0;
  const health = questHealth(quest);

  const recentCompletions = useMemo(
    () => activity.filter(event =>
      event.event_type === 'completed' && Date.now() - +new Date(event.created_at) <= 14 * 86_400_000
    ),
    [activity]
  );

  const burnRate = recentCompletions.length / 2;
  const projected = burnRate > 0 && remaining > 0
    ? new Date(Date.now() + (remaining / burnRate) * 7 * 86_400_000)
    : burnRate > 0 && remaining === 0 ? new Date() : null;

  const deadline = quest.deadline ? parseDate(quest.deadline) : null;
  let schedule: { label: string; tone: string };
  if (!deadline) {
    schedule = { label: 'No target date', tone: styles.scheduleNeutral };
  } else if (!projected) {
    schedule = { label: 'No recent velocity', tone: styles.scheduleNeutral };
  } else {
    const diffDays = Math.round((deadline.getTime() - projected.getTime()) / 86_400_000);
    schedule = diffDays >= 0
      ? { label: `${diffDays} day${diffDays === 1 ? '' : 's'} ahead of schedule`, tone: styles.scheduleGood }
      : { label: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} behind schedule`, tone: styles.scheduleBad };
  }

  /* 14-day completion sparkline. */
  const days = 14;
  const counts = Array<number>(days).fill(0);
  for (const event of activity) {
    if (event.event_type !== 'completed') continue;
    const daysAgo = Math.floor((Date.now() - +new Date(event.created_at)) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < days) counts[days - 1 - daysAgo] += 1;
  }
  const maxCount = Math.max(1, ...counts);
  const points = counts
    .map((count, index) => `${(index / (days - 1)) * 100},${40 - (count / maxCount) * 36}`)
    .join(' ');

  const nextLocked = (quest.plans ?? []).find(plan => plan.locked);
  const gate = nextLocked?.xp_gate ?? 0;
  const gatePct = gate > 0 ? Math.min(100, Math.round((claimedXp / gate) * 100)) : 0;

  return (
    <article className={styles.railCard}>
      <header className={styles.railHead}>
        <h3 className={styles.railTitle}>Quest telemetry</h3>
        <span className={styles.railBadge}>{health.score}%</span>
      </header>

      <dl className={styles.metricList}>
        <div className={styles.metricRow}>
          <dt>Burn rate / velocity</dt>
          <dd>{burnRate.toFixed(1)} tasks/wk</dd>
        </div>
        <div className={styles.metricRow}>
          <dt>Projected completion</dt>
          <dd>{projected ? formatDate(projected.toISOString()) : 'Not enough data'}</dd>
        </div>
        <div className={styles.metricRow}>
          <dt>Target deadline</dt>
          <dd>{quest.deadline ? formatDate(quest.deadline) : 'Not set'}</dd>
        </div>
        <div className={styles.metricRow}>
          <dt>Tasks remaining</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>

      <div className={`${styles.scheduleBadge} ${schedule.tone}`}>{schedule.label}</div>

      <div className={styles.sparkWrap}>
        <span className={styles.railLabel}>Task throughput · last 14 days</span>
        <svg
          viewBox="0 0 100 44"
          preserveAspectRatio="none"
          className={styles.spark}
          role="img"
          aria-label={`${recentCompletions.length} tasks completed in the last 14 days`}
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {nextLocked ? (
        <div className={styles.unlockBox}>
          <span className={styles.railLabel}>Next milestone unlock</span>
          <p className={styles.unlockTitle}>🔒 {nextLocked.title}</p>
          <div className={styles.unlockTrack}>
            <div className={styles.unlockFill} style={{ width: `${gatePct}%` }} />
          </div>
          <span className={styles.unlockMeta}>
            {formatXp(claimedXp)} / {formatXp(gate)} XP · {formatXp(xpToGate(nextLocked, claimedXp))} to go
          </span>
        </div>
      ) : (
        <div className={styles.unlockBox}>
          <span className={styles.railLabel}>Milestone gates</span>
          <p className={styles.unlockTitle}>All milestones unlocked</p>
        </div>
      )}
    </article>
  );
}

function DeadlinesCard({ quest }: { quest: Quest }) {
  const items: { id: string; title: string; sub: string; due: string; days: number }[] = [];

  if (quest.deadline) {
    const days = daysLeft(quest.deadline) ?? 0;
    items.push({
      id: 'quest-deadline',
      title: quest.title,
      sub: 'Quest deadline',
      due: quest.deadline,
      days,
    });
  }

  for (const plan of quest.plans ?? []) {
    if (plan.locked) continue;
    for (const task of plan.tasks ?? []) {
      if (!task.due_date || task.status === 'completed' || task.status === 'skipped') continue;
      items.push({
        id: task.id,
        title: task.title,
        sub: plan.title,
        due: task.due_date,
        days: daysLeft(task.due_date) ?? 0,
      });
    }
  }

  items.sort((a, b) => a.days - b.days);
  const visible = items.slice(0, 4);

  return (
    <article className={styles.railCard}>
      <header className={styles.railHead}>
        <h3 className={styles.railTitle}>Critical deadlines</h3>
        <span className={styles.railIcon} aria-hidden>⏱</span>
      </header>

      {visible.length === 0 ? (
        <p className={styles.railEmpty}>No upcoming deadlines.</p>
      ) : (
        <ul className={styles.deadlineList}>
          {visible.map(item => {
            const overdue = item.days < 0;
            const soon = !overdue && item.days <= 7;
            return (
              <li key={item.id} className={styles.deadlineItem}>
                <span className={`${styles.deadlineChipSmall} ${overdue ? styles.deadlineChipOverdue : soon ? styles.deadlineChipSoon : ''}`}>
                  {overdue ? `⚠ ${Math.abs(item.days)}D` : item.days === 0 ? 'TODAY' : `${item.days}D`}
                </span>
                <div className={styles.deadlineBody}>
                  <p className={styles.deadlineName}>{item.title}</p>
                  <p className={styles.deadlineSub}>{item.sub}</p>
                </div>
                <span className={styles.deadlineDate}>{formatShortDate(item.due)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function YieldCard({ quest, claimedXp }: { quest: Quest; claimedXp: number }) {
  const plans = quest.plans ?? [];
  const earned = plans.reduce((sum, plan) => sum + (plan.xp_earned ?? 0), 0);
  const potential = plans.reduce((sum, plan) => sum + (plan.xp_potential ?? 0), 0);
  const pct = potential > 0 ? Math.min(100, Math.round((earned / potential) * 100)) : 0;

  return (
    <article className={styles.railCard}>
      <header className={styles.railHead}>
        <h3 className={styles.railTitle}>Mission attribute yield</h3>
        <span className={`${styles.vecChip} ${styles[`vec_${quest.vector}`]}`}>
          {quest.vector.toUpperCase()}
        </span>
      </header>

      <div className={styles.yieldRows}>
        <div className={styles.yieldRow}>
          <span className={styles.yieldLabel}>XP claimed</span>
          <span className={`${styles.yieldValue} ${styles.yieldGain}`}>+{formatXp(earned)} XP</span>
        </div>
        <div className={styles.yieldRow}>
          <span className={styles.yieldLabel}>XP potential</span>
          <span className={styles.yieldValue}>{formatXp(potential)} XP</span>
        </div>
      </div>

      <div className={styles.yieldTrack}>
        <div className={styles.yieldFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.yieldMeta}>
        {pct}% of this quest's XP earned · {formatXp(claimedXp)} lifetime claimed
      </span>

      <div className={styles.yieldLegend}>
        <span>High 80 XP</span>
        <span>Medium 50 XP</span>
        <span>Low 25 XP</span>
        <span>Milestone +120 XP</span>
      </div>
    </article>
  );
}

function RecentActivityCard({ activity, loading }: { activity: TaskEvent[]; loading: boolean }) {
  const recent = activity.slice(0, 4);

  return (
    <article className={styles.railCard}>
      <header className={styles.railHead}>
        <h3 className={styles.railTitle}>Mission activity</h3>
        <span className={styles.liveDot} aria-label="Live" />
      </header>

      {loading && recent.length === 0 ? (
        <div className={styles.railSkeleton}>
          <Sk h={28} /><Sk h={28} /><Sk h={28} />
        </div>
      ) : recent.length === 0 ? (
        <p className={styles.railEmpty}>No activity recorded yet.</p>
      ) : (
        <ul className={styles.miniActivity}>
          {recent.map(event => {
            const meta = ACTIVITY_META[event.event_type] ?? ACTIVITY_META.updated;
            return (
              <li key={event.id} className={styles.miniActivityItem}>
                <span className={`${styles.miniActivityDot} ${styles[`activityTone_${meta.tone}`]}`} aria-hidden>
                  {meta.icon}
                </span>
                <div className={styles.miniActivityBody}>
                  <p className={styles.miniActivityTitle}>
                    <strong>{event.task_title}</strong> {meta.verb}
                  </p>
                  <time className={styles.activityTime} dateTime={event.created_at}>
                    {formatEventDate(event.created_at)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   DATE HELPERS
   ════════════════════════════════════════════════════════════════════════ */
function parseDate(iso: string): Date {
  return new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
}

function formatDate(iso: string): string {
  const date = parseDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(iso: string): string {
  const date = parseDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ════════════════════════════════════════════════════════════════════════
   ACTIVITY LOG — append-only task history
   ════════════════════════════════════════════════════════════════════════ */
const ACTIVITY_META: Record<string, { icon: string; verb: string; tone: string }> = {
  created:   { icon: '✦', verb: 'created',        tone: 'neutral' },
  started:   { icon: '▶', verb: 'started',        tone: 'active'  },
  blocked:   { icon: '⛔', verb: 'marked blocked', tone: 'danger'  },
  skipped:   { icon: '⏭', verb: 'skipped',        tone: 'muted'   },
  completed: { icon: '✓', verb: 'completed',      tone: 'success' },
  reopened:  { icon: '↺', verb: 'reopened',       tone: 'active'  },
  updated:   { icon: '✎', verb: 'updated',        tone: 'neutral' },
};

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function ActivityLog({ events, loading }: { events: TaskEvent[]; loading: boolean }) {
  if (loading) {
    return (
      <div className={styles.activityPad}>
        <div className={styles.detailLoading}>
          <Sk h={48} /><Sk h={48} /><Sk h={48} />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.emptyActivity}>
        <span className={styles.emptyDetailIcon}>🗒</span>
        <p>No activity yet. Start checking off tasks and the trail will appear here.</p>
      </div>
    );
  }

  return (
    <ol className={styles.activityList}>
      {events.map(event => {
        const meta = ACTIVITY_META[event.event_type] ?? ACTIVITY_META.updated;
        return (
          <li key={event.id} className={styles.activityItem}>
            <span
              className={`${styles.activityIcon} ${styles[`activityTone_${meta.tone}`]}`}
              aria-hidden
            >
              {meta.icon}
            </span>
            <div className={styles.activityBody}>
              <p className={styles.activityTitle}>
                <strong>{event.task_title}</strong> {meta.verb}
              </p>
              {event.event_type === 'updated' && event.previous_value && (
                <p className={styles.activityDetail}>Changed: {event.previous_value}</p>
              )}
              <time className={styles.activityTime} dateTime={event.created_at}>
                {formatEventDate(event.created_at)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CREATE QUEST WIZARD — multi-step
   Steps: 1 Title  2 Goal  3 Plan (missions + tasks)  4 Action
   ════════════════════════════════════════════════════════════════════════ */

interface WizardTask {
  id: string;        // temp local id
  title: string;
  priority: number;
  description: string;
}

interface WizardMission {
  id: string;        // temp local id
  title: string;
  description: string;
  deadline: string;
  xpGate: string;    // claimed-XP gate (blank = sequential unlock)
  tasks: WizardTask[];
}

function uid() {
  return Math.random().toString(36).slice(2);
}

type WizardStep = 1 | 2 | 3 | 4;

function CreateQuestWizard({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: (q: Quest) => void;
}) {
  const [step, setStep]       = useState<WizardStep>(1);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  /* Step 1: Title + Vector + Overall Deadline */
  const [title,    setTitle]    = useState('');
  const [vector,   setVector]   = useState<Vector>('mind');
  const [deadline, setDeadline] = useState('');

  /* Step 2: Goal */
  const [goal, setGoal] = useState('');

  /* Step 3: Missions */
  const [missions, setMissions] = useState<WizardMission[]>([]);
  const [newMissionTitle, setNewMissionTitle] = useState('');

  /* Step 4 is action (read-only preview with task check-off) */
  const [createdQuest, setCreatedQuest] = useState<Quest | null>(null);
  const [taskChecks, setTaskChecks]     = useState<Record<string, boolean>>({});

  /* ── Step navigation ── */
  function next() {
    setErr('');
    if (step === 1) {
      if (!title.trim()) { setErr('Quest title is required.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!goal.trim()) { setErr('Please describe what success looks like.'); return; }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  }

  function back() {
    setErr('');
    setStep(s => (s - 1) as WizardStep);
  }

  /* ── Mission helpers ── */
  function addMission() {
    if (!newMissionTitle.trim()) return;
    setMissions(prev => [
      ...prev,
      { id: uid(), title: newMissionTitle.trim(), description: '', deadline: '', xpGate: '', tasks: [] },
    ]);
    setNewMissionTitle('');
  }

  function removeMission(id: string) {
    setMissions(prev => prev.filter(m => m.id !== id));
  }

  function updateMission(id: string, patch: Partial<WizardMission>) {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  function addTaskToMission(missionId: string, taskTitle: string) {
    if (!taskTitle.trim()) return;
    setMissions(prev => prev.map(m => m.id === missionId
      ? { ...m, tasks: [...m.tasks, { id: uid(), title: taskTitle.trim(), priority: 2, description: '' }] }
      : m
    ));
  }

  function removeTaskFromMission(missionId: string, taskId: string) {
    setMissions(prev => prev.map(m => m.id === missionId
      ? { ...m, tasks: m.tasks.filter(t => t.id !== taskId) }
      : m
    ));
  }

  function updateTask(missionId: string, taskId: string, patch: Partial<WizardTask>) {
    setMissions(prev => prev.map(m => m.id === missionId
      ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) }
      : m
    ));
  }

  /* ── Final submit (creates quest + missions + tasks) ── */
  async function handleFinish() {
    if (!title.trim()) { setErr('Quest title is required.'); setStep(1); return; }
    setSaving(true);
    setErr('');

    const q = await createQuest(userId, {
      title: title.trim(),
      goal: goal.trim() || undefined,
      vector,
      deadline: deadline || undefined,
    });

    if (!q) {
      setErr('Failed to create quest. Please try again.');
      setSaving(false);
      return;
    }

    /* Create missions + tasks sequentially */
    for (let i = 0; i < missions.length; i++) {
      const m = missions[i];
      const plan = await createPlan(q.id, {
        title: m.title,
        description: m.description || undefined,
        due_date: m.deadline || undefined,
        ordering: i + 1,
        xp_required: m.xpGate.trim() ? Math.max(0, Number(m.xpGate)) : undefined,
      });
      if (plan) {
        for (const t of m.tasks) {
          await createTask(q.id, plan.id, {
            title: t.title,
            description: t.description || undefined,
            priority: t.priority,
          });
        }
      }
    }

    /* Initialize task checks for Action step */
    const checks: Record<string, boolean> = {};
    missions.forEach(m => m.tasks.forEach(t => { checks[t.id] = false; }));
    setTaskChecks(checks);
    setCreatedQuest(q);
    setSaving(false);
    setStep(4);
  }

  /* ── Step indicators ── */
  const stepLabels = ['Title', 'Goal', 'Plan', 'Action'];

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal aria-label="Create Quest">
      <div className={styles.wizardModal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.wizardHeader}>
          <div>
            <span className={styles.wizardEyebrow}>NEW QUEST</span>
            <h2 className={styles.wizardTitle}>
              {step === 1 && 'Name your quest'}
              {step === 2 && 'Define your goal'}
              {step === 3 && 'Build your plan'}
              {step === 4 && 'Action — check off tasks'}
            </h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Step indicators */}
        <div className={styles.stepBar}>
          {stepLabels.map((label, i) => {
            const n = (i + 1) as WizardStep;
            const active = step === n;
            const done   = step > n;
            return (
              <div key={n} className={`${styles.stepItem} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
                <span className={styles.stepCircle}>{done ? '✓' : n}</span>
                <span className={styles.stepLabel}>{label}</span>
                {i < 3 && <span className={styles.stepLine} />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className={styles.wizardBody}>

          {/* ── Step 1: Title ── */}
          {step === 1 && (
            <div className={styles.wizardStep}>
              <Field label="Quest title *" id="wt">
                <input
                  id="wt"
                  className={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Launch SaaS MVP"
                  maxLength={120}
                  autoFocus
                />
              </Field>

              <Field label="Vector" id="wv">
                <div className={styles.vectorPicker}>
                  {VECTOR_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      className={`${styles.vectorOption} ${vector === o.value ? styles.vectorOptionActive : ''} ${styles[`vec_${o.value}`]}`}
                      onClick={() => setVector(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Overall deadline (optional)" id="wdl">
                <input
                  id="wdl"
                  className={styles.input}
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* ── Step 2: Goal ── */}
          {step === 2 && (
            <div className={styles.wizardStep}>
              <div className={styles.questPreviewBadge}>
                <span className={`${styles.vecChip} ${styles[`vec_${vector}`]}`}>{vector.toUpperCase()}</span>
                <strong>{title}</strong>
              </div>
              <Field label="What does success look like? *" id="wg">
                <textarea
                  id="wg"
                  className={styles.textarea}
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. A live product with 10 paying customers, <100ms API p99 response time, and $500 MRR"
                  rows={4}
                  autoFocus
                />
              </Field>
              <p className={styles.fieldHint}>Be specific. This is your north star for the whole quest.</p>
            </div>
          )}

          {/* ── Step 3: Plan (missions + tasks) ── */}
          {step === 3 && (
            <div className={styles.wizardStep}>
              <div className={styles.questPreviewBadge}>
                <span className={`${styles.vecChip} ${styles[`vec_${vector}`]}`}>{vector.toUpperCase()}</span>
                <strong>{title}</strong>
              </div>

              {/* Add mission inline */}
              <div className={styles.addMissionRow}>
                <input
                  className={styles.input}
                  value={newMissionTitle}
                  onChange={e => setNewMissionTitle(e.target.value)}
                  placeholder="Mission name (e.g. Backend Development)"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMission(); } }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addMission}
                  style={{ minWidth: '120px', flexShrink: 0 }}
                >
                  + Mission
                </button>
              </div>

              {missions.length === 0 && (
                <div className={styles.emptyMissions}>
                  <span>No missions yet.</span>
                  <span className={styles.fieldHint}>Add at least one mission to organize your tasks. You can also skip and add later.</span>
                </div>
              )}

              {/* Mission list */}
              <div className={styles.wizardMissionList}>
                {missions.map((m, mi) => (
                  <WizardMissionBlock
                    key={m.id}
                    mission={m}
                    index={mi + 1}
                    onUpdate={patch => updateMission(m.id, patch)}
                    onRemove={() => removeMission(m.id)}
                    onAddTask={taskTitle => addTaskToMission(m.id, taskTitle)}
                    onRemoveTask={taskId => removeTaskFromMission(m.id, taskId)}
                    onUpdateTask={(taskId, patch) => updateTask(m.id, taskId, patch)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Action ── */}
          {step === 4 && (
            <div className={styles.wizardStep}>
              <div className={styles.actionHeader}>
                <div className={styles.questPreviewBadge}>
                  <span className={`${styles.vecChip} ${styles[`vec_${vector}`]}`}>{vector.toUpperCase()}</span>
                  <strong>{title}</strong>
                </div>
                {goal && <p className={styles.actionGoal}>{goal}</p>}
              </div>

              {missions.length === 0 ? (
                <div className={styles.emptyMissions}>
                  <span>Quest created!</span>
                  <span className={styles.fieldHint}>You can add missions and tasks from the quest detail view.</span>
                </div>
              ) : (
                <div className={styles.actionMissionList}>
                  {missions.map((m, mi) => (
                    <div key={m.id} className={styles.actionMission}>
                      <div className={styles.actionMissionHeader}>
                        <span className={styles.planIndex}>0{mi + 1}</span>
                        <span className={styles.actionMissionTitle}>{m.title}</span>
                        {m.deadline && (
                          <span className={styles.planDue}>
                            Due {new Date(m.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {m.tasks.length === 0 ? (
                        <p className={styles.noTasks}>No tasks in this mission.</p>
                      ) : (
                        m.tasks.map(t => (
                          <div key={t.id} className={`${styles.actionTaskRow} ${taskChecks[t.id] ? styles.actionTaskDone : ''}`}>
                            <button
                              type="button"
                              className={`${styles.taskCheck} ${taskChecks[t.id] ? styles.taskCheckDone : ''}`}
                              onClick={() => setTaskChecks(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                              aria-pressed={taskChecks[t.id]}
                              aria-label={taskChecks[t.id] ? `Uncheck: ${t.title}` : `Check: ${t.title}`}
                            >
                              {taskChecks[t.id] && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                            <span className={`${styles.taskTitle} ${taskChecks[t.id] ? styles.taskTitleDone : ''}`}>
                              {t.title}
                            </span>
                            <span className={`${styles.taskPriority} ${styles[`priority_${t.priority}`]}`}>
                              {priorityLabel(t.priority)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className={styles.actionFootnote}>
                ✓ Quest created! These checks are just for review — task status is tracked in the quest view.
              </p>
            </div>
          )}

          {err && <p className={styles.fieldError} role="alert">{err}</p>}
        </div>

        {/* Footer */}
        <div className={styles.wizardFooter}>
          <div>
            {step > 1 && step < 4 && (
              <button type="button" className="btn-secondary" onClick={back}>← Back</button>
            )}
          </div>
          <div className={styles.wizardFooterRight}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              {step === 4 ? 'Close' : 'Cancel'}
            </button>
            {step < 3 && (
              <button type="button" className="btn-primary" onClick={next}>
                Continue →
              </button>
            )}
            {step === 3 && (
              <button type="button" className="btn-primary" onClick={handleFinish} disabled={saving}>
                {saving ? 'Creating…' : 'Create Quest →'}
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => { if (createdQuest) onCreated(createdQuest); }}
              >
                Go to Quest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   WIZARD MISSION BLOCK (Step 3)
   ════════════════════════════════════════════════════════════════════════ */
function WizardMissionBlock({
  mission,
  index,
  onUpdate,
  onRemove,
  onAddTask,
  onRemoveTask,
  onUpdateTask,
}: {
  mission: WizardMission;
  index: number;
  onUpdate: (patch: Partial<WizardMission>) => void;
  onRemove: () => void;
  onAddTask: (title: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, patch: Partial<WizardTask>) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [newTask, setNewTask]   = useState('');

  function addTask() {
    if (!newTask.trim()) return;
    onAddTask(newTask.trim());
    setNewTask('');
  }

  return (
    <div className={styles.wizardMission}>
      <div className={styles.wizardMissionHeader}>
        <button
          type="button"
          className={styles.planToggle}
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          <span className={styles.planChevron}>{expanded ? '▾' : '▸'}</span>
        </button>
        <span className={styles.planIndex}>0{index}</span>
        <span className={styles.wizardMissionTitle}>{mission.title}</span>
        <button type="button" className={styles.planDeleteBtn} onClick={onRemove} aria-label="Remove mission">✕</button>
      </div>

      {expanded && (
        <div className={styles.wizardMissionBody}>
          {/* Mission deadline + XP gate */}
          <div className={styles.missionDeadlineRow}>
            <label className={styles.fieldLabel} htmlFor={`deadline-${mission.id}`}>Mission deadline</label>
            <input
              id={`deadline-${mission.id}`}
              className={styles.input}
              type="date"
              value={mission.deadline}
              onChange={e => onUpdate({ deadline: e.target.value })}
              style={{ maxWidth: '200px' }}
            />
            <label className={styles.fieldLabel} htmlFor={`gate-${mission.id}`}>XP gate</label>
            <input
              id={`gate-${mission.id}`}
              className={styles.input}
              type="number"
              min={0}
              step={10}
              value={mission.xpGate}
              onChange={e => onUpdate({ xpGate: e.target.value })}
              placeholder="Auto"
              style={{ maxWidth: '120px' }}
            />
            <span className={styles.missionGateHint}>
              Claimed XP needed before this milestone unlocks. Blank = unlock after the previous plan.
            </span>
          </div>

          {/* Task list */}
          {mission.tasks.map(t => (
            <div key={t.id} className={styles.wizardTask}>
              <span className={styles.wizardTaskTitle}>{t.title}</span>
              <select
                className={styles.select}
                value={t.priority}
                onChange={e => onUpdateTask(t.id, { priority: Number(e.target.value) })}
                style={{ width: '100px', height: '30px', fontSize: '12px' }}
                aria-label="Priority"
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
              <button
                type="button"
                className={styles.planDeleteBtn}
                onClick={() => onRemoveTask(t.id)}
                aria-label={`Remove task ${t.title}`}
                style={{ opacity: 1 }}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add task */}
          <div className={styles.addTaskInline}>
            <input
              className={styles.input}
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task…"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
              style={{ flex: 1 }}
            />
            <button type="button" className={styles.addTaskInlineBtn} onClick={addTask}>
              + Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ADD PLAN MODAL
   ════════════════════════════════════════════════════════════════════════ */
function AddPlanModal({
  questId,
  nextOrder,
  onClose,
  onCreated,
}: {
  questId: string;
  nextOrder: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [dueDate, setDueDate] = useState('');
  const [xpGate,  setXpGate]  = useState('');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Title is required.'); return; }
    setSaving(true);
    const p = await createPlan(questId, {
      title: title.trim(),
      description: desc.trim() || undefined,
      due_date: dueDate || undefined,
      ordering: nextOrder,
      xp_required: xpGate.trim() ? Math.max(0, Number(xpGate)) : undefined,
    });
    setSaving(false);
    if (!p) { setErr('Failed to create mission.'); return; }
    onCreated();
  }

  return (
    <Modal title="ADD MISSION" onClose={onClose}>
      <form onSubmit={submit} className={styles.modalForm}>
        <Field label="Mission title *" id="pt">
          <input id="pt" className={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} placeholder="e.g. Backend Development" autoFocus />
        </Field>
        <Field label="Description (optional)" id="pd">
          <input id="pd" className={styles.input} value={desc}
            onChange={e => setDesc(e.target.value)} placeholder="What does this phase cover?" />
        </Field>
        <Field label="Deadline" id="pdd">
          <input id="pdd" className={styles.input} type="date" value={dueDate}
            onChange={e => setDueDate(e.target.value)} />
        </Field>
        <Field label="XP gate (optional)" id="pxp">
          <input id="pxp" className={styles.input} type="number" min={0} step={10} value={xpGate}
            onChange={e => setXpGate(e.target.value)} placeholder="Auto — unlock after the previous plan" />
        </Field>
        <p className={styles.fieldHint}>Claimed XP needed before this milestone opens.</p>
        {err && <p className={styles.fieldError} role="alert">{err}</p>}
        <div className={styles.modalFooter}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding…' : 'Add Mission'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ADD TASK MODAL
   ════════════════════════════════════════════════════════════════════════ */
function AddTaskModal({
  questId,
  planId,
  onClose,
  onCreated,
}: {
  questId: string;
  planId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [dueDate,  setDueDate]  = useState('');
  const [priority, setPriority] = useState(2);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Title is required.'); return; }
    setSaving(true);
    const t = await createTask(questId, planId, {
      title: title.trim(),
      description: desc.trim() || undefined,
      due_date: dueDate || undefined,
      priority,
    });
    setSaving(false);
    if (!t) { setErr('Failed to add task.'); return; }
    onCreated();
  }

  return (
    <Modal title="ADD TASK" onClose={onClose}>
      <form onSubmit={submit} className={styles.modalForm}>
        <Field label="Task title *" id="tt">
          <input id="tt" className={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} placeholder="e.g. Set up Supabase auth" autoFocus />
        </Field>
        <Field label="Description (optional)" id="td">
          <input id="td" className={styles.input} value={desc}
            onChange={e => setDesc(e.target.value)} placeholder="Details, acceptance criteria, notes" />
        </Field>
        <div className={styles.inlineFields}>
          <Field label="Due date" id="tdd">
            <input id="tdd" className={styles.input} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} />
          </Field>
          <Field label="Priority" id="tp">
            <select id="tp" className={styles.select} value={priority}
              onChange={e => setPriority(Number(e.target.value))}>
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </Field>
        </div>
        {err && <p className={styles.fieldError} role="alert">{err}</p>}
        <div className={styles.modalFooter}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EDIT QUEST MODAL
   ════════════════════════════════════════════════════════════════════════ */
function EditQuestModal({
  quest,
  onClose,
  onSave,
}: {
  quest: Quest;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string | null;
    goal: string | null;
    vector: Vector;
    deadline: string | null;
  }) => Promise<boolean>;
}) {
  const [title,    setTitle]    = useState(quest.title);
  const [goal,     setGoal]     = useState(quest.goal ?? '');
  const [desc,     setDesc]     = useState(quest.description ?? '');
  const [vector,   setVector]   = useState<Vector>(quest.vector);
  const [deadline, setDeadline] = useState(quest.deadline ?? '');
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Quest title is required.'); return; }
    setSaving(true);
    setErr('');
    const ok = await onSave({
      title: title.trim(),
      goal: goal.trim() ? goal.trim() : null,
      description: desc.trim() ? desc.trim() : null,
      vector,
      deadline: deadline || null,
    });
    setSaving(false);
    if (!ok) setErr('Failed to save the quest.');
  }

  return (
    <Modal title="EDIT QUEST" onClose={onClose}>
      <form onSubmit={submit} className={styles.modalForm}>
        <Field label="Quest title *" id="eqt">
          <input id="eqt" className={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} maxLength={120} autoFocus />
        </Field>
        <Field label="Definition of done" id="eqg">
          <textarea id="eqg" className={styles.textarea} value={goal}
            onChange={e => setGoal(e.target.value)} rows={3}
            placeholder="What does success look like?" />
        </Field>
        <Field label="Description (optional)" id="eqd">
          <textarea id="eqd" className={styles.textarea} value={desc}
            onChange={e => setDesc(e.target.value)} rows={2}
            placeholder="Context, constraints, notes" />
        </Field>
        <Field label="Vector" id="eqv">
          <div className={styles.vectorPicker}>
            {VECTOR_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                className={`${styles.vectorOption} ${vector === o.value ? styles.vectorOptionActive : ''} ${styles[`vec_${o.value}`]}`}
                onClick={() => setVector(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Overall deadline" id="eqdl">
          <input id="eqdl" className={styles.input} type="date" value={deadline}
            onChange={e => setDeadline(e.target.value)} />
        </Field>
        {err && <p className={styles.fieldError} role="alert">{err}</p>}
        <div className={styles.modalFooter}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EDIT MISSION MODAL
   ════════════════════════════════════════════════════════════════════════ */
function EditPlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: Plan;
  onClose: () => void;
  onSave: (payload: { title: string; description: string | null; due_date: string | null; xp_required: number | null }) => Promise<boolean>;
}) {
  const [title,   setTitle]   = useState(plan.title);
  const [desc,    setDesc]    = useState(plan.description ?? '');
  const [dueDate, setDueDate] = useState(plan.due_date ?? '');
  const [xpGate,  setXpGate]  = useState(plan.xp_required != null ? String(plan.xp_required) : '');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Mission title is required.'); return; }
    setSaving(true);
    setErr('');
    const ok = await onSave({
      title: title.trim(),
      description: desc.trim() ? desc.trim() : null,
      due_date: dueDate || null,
      xp_required: xpGate.trim() ? Math.max(0, Number(xpGate)) : null,
    });
    setSaving(false);
    if (!ok) setErr('Failed to save the mission.');
  }

  return (
    <Modal title="EDIT MISSION" onClose={onClose}>
      <form onSubmit={submit} className={styles.modalForm}>
        <Field label="Mission title *" id="ept">
          <input id="ept" className={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Description (optional)" id="epd">
          <input id="epd" className={styles.input} value={desc}
            onChange={e => setDesc(e.target.value)} placeholder="What does this phase cover?" />
        </Field>
        <Field label="Deadline" id="epdd">
          <input id="epdd" className={styles.input} type="date" value={dueDate}
            onChange={e => setDueDate(e.target.value)} />
        </Field>
        <Field label="XP gate (optional)" id="epxp">
          <input id="epxp" className={styles.input} type="number" min={0} step={10} value={xpGate}
            onChange={e => setXpGate(e.target.value)} placeholder="Auto — unlock after the previous plan" />
        </Field>
        <p className={styles.fieldHint}>Claimed XP needed before this milestone opens. Leave blank for sequential unlocking.</p>
        {err && <p className={styles.fieldError} role="alert">{err}</p>}
        <div className={styles.modalFooter}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EDIT TASK MODAL
   ════════════════════════════════════════════════════════════════════════ */
function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string | null;
    due_date: string | null;
    priority: number;
  }) => Promise<boolean>;
}) {
  const [title,    setTitle]    = useState(task.title);
  const [desc,     setDesc]     = useState(task.description ?? '');
  const [dueDate,  setDueDate]  = useState(task.due_date ?? '');
  const [priority, setPriority] = useState(task.priority);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Task title is required.'); return; }
    setSaving(true);
    setErr('');
    const ok = await onSave({
      title: title.trim(),
      description: desc.trim() ? desc.trim() : null,
      due_date: dueDate || null,
      priority,
    });
    setSaving(false);
    if (!ok) setErr('Failed to save the task.');
  }

  return (
    <Modal title="EDIT TASK" onClose={onClose}>
      <form onSubmit={submit} className={styles.modalForm}>
        <Field label="Task title *" id="ett">
          <input id="ett" className={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Description (optional)" id="etd">
          <textarea id="etd" className={styles.textarea} value={desc}
            onChange={e => setDesc(e.target.value)} rows={2}
            placeholder="Details, acceptance criteria, notes" />
        </Field>
        <div className={styles.inlineFields}>
          <Field label="Due date" id="etdd">
            <input id="etdd" className={styles.input} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} />
          </Field>
          <Field label="Priority" id="etp">
            <select id="etp" className={styles.select} value={priority}
              onChange={e => setPriority(Number(e.target.value))}>
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </Field>
        </div>
        <p className={styles.fieldHint}>Change status from the task row so the change is logged in Activity.</p>
        {err && <p className={styles.fieldError} role="alert">{err}</p>}
        <div className={styles.modalFooter}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ════════════════════════════════════════════════════════════════════════ */
function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal aria-label={title}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label, id, children,
}: {
  label: string; id: string; children: React.ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
