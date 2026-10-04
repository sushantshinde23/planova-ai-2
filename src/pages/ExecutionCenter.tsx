import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { Task, TaskStatus } from '../types';
import { TaskInspectorDrawer } from '../components/TaskInspectorDrawer';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Download,
  ArrowRight,
  Search,
  Play,
  Pause,
  ShieldAlert,
  Eye,
  Cpu,
  Truck,
  Activity,
  Zap,
} from 'lucide-react';

export const ExecutionCenter: React.FC = () => {
  const {
    activeMission,
    tasks,
    resources,
    auditLogs,
    approvals,
    createTask,
    updateTaskStatus,
    openApprovalModal,
    t,
  } = useMission();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskAgent, setNewTaskAgent] = useState<string>('Execution Agent');
  const [creatingTask, setCreatingTask] = useState<boolean>(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const liveSelectedTask = selectedTask
    ? tasks.find((tk) => tk.id === selectedTask.id) || selectedTask
    : null;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setCreatingTask(true);
    try {
      await createTask({
        title: newTaskTitle.trim(),
        description: `Operator-dispatched task for ${activeMission?.title || 'Active Mission'}`,
        assignedAgent: newTaskAgent as any,
        status: 'in_progress',
        priority: 'high',
        riskLevel: 'low',
        estimatedDurationMinutes: 15,
        metadata: {
          phase: 'Phase 3: Execution',
          location: activeMission?.location || 'Primary Operations Zone',
          resources: ['Field Operations Team'],
          successCriteria: '100% Verified Completion',
        },
      });
      setNewTaskTitle('');
      setIsNewTaskOpen(false);
    } catch {
      // handled by context
    } finally {
      setCreatingTask(false);
    }
  };

  const handleInlineTaskAction = async (
    e: React.MouseEvent,
    task: Task,
    nextStatus: TaskStatus
  ) => {
    e.stopPropagation();
    setBusyTaskId(task.id);
    try {
      await updateTaskStatus(task.id, nextStatus);
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleInlineApproval = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const matching = approvals.find(
      (a) => a.taskId === task.id && a.status === 'pending'
    );
    if (matching) {
      openApprovalModal(matching);
    } else {
      updateTaskStatus(task.id, 'completed');
    }
  };

  const handleStepNextTask = async () => {
    const candidate =
      tasks.find((tk) => tk.status === 'in_progress') ||
      tasks.find((tk) => tk.status === 'ready' || tk.status === 'pending');
    if (!candidate) return;
    setBusyTaskId(candidate.id);
    try {
      const nextState: TaskStatus =
        candidate.status === 'in_progress' ? 'completed' : 'in_progress';
      await updateTaskStatus(candidate.id, nextState);
    } finally {
      setBusyTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((tk) => {
    const matchesStatus = statusFilter === 'all' || tk.status === statusFilter;
    const matchesSearch =
      tk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tk.assignedAgent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedTasksCount = tasks.filter(
    (tk) => tk.status === 'completed' || tk.status === 'verified'
  ).length;
  const inProgressCount = tasks.filter((tk) => tk.status === 'in_progress').length;
  const waitingCount = tasks.filter((tk) => tk.status === 'waiting_approval').length;
  const blockedOrFailedCount = tasks.filter(
    (tk) => tk.status === 'blocked' || tk.status === 'failed' || tk.status === 'replanning'
  ).length;
  const missionHealth = Math.max(
    74,
    Math.min(100, 96 - blockedOrFailedCount * 6 - waitingCount * 2)
  );
  const resourceUtilPct =
    resources.length > 0
      ? Math.round(
          resources.reduce((acc, r) => acc + (r.inUse / Math.max(1, r.total)) * 100, 0) /
            resources.length
        )
      : 82;

  const isMissionComplete =
    tasks.length > 0 &&
    (activeMission?.status === 'completed' ||
      tasks.every((tk) => tk.status === 'completed' || tk.status === 'verified'));

  const downloadExecutiveReport = () => {
    const reportData = {
      missionId: activeMission?.id,
      mission: activeMission?.title,
      objective: activeMission?.objective,
      category: activeMission?.category,
      location: activeMission?.location,
      status: activeMission?.status,
      progress: activeMission?.progress,
      exportedAt: new Date().toISOString(),
      tasksTotal: tasks.length,
      tasksCompleted: completedTasksCount,
      tasks: tasks.map((tk) => ({
        id: tk.id,
        title: tk.title,
        status: tk.status,
        agent: tk.assignedAgent,
        resource: tk.requiredResource,
      })),
      auditLedgerEntries: auditLogs.length,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PLANOVA-Executive-Report-${activeMission?.id || 'mission'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIndicator = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return {
          dot: 'bg-[#16A34A]',
          text: 'text-[#16A34A] dark:text-emerald-400',
          label: status === 'verified' ? t.status.verified : t.status.completed,
        };
      case 'in_progress':
        return {
          dot: 'bg-[#2563EB] animate-ping',
          text: 'text-[#2563EB] dark:text-blue-400',
          label: t.status.in_progress,
        };
      case 'waiting_approval':
        return {
          dot: 'bg-[#EAB308] animate-pulse',
          text: 'text-amber-700 dark:text-amber-400',
          label: t.status.waiting_approval,
        };
      case 'replanning':
        return {
          dot: 'bg-[#7C3AED]',
          text: 'text-[#7C3AED] dark:text-purple-400',
          label: t.status.replanning,
        };
      case 'blocked':
      case 'failed':
        return {
          dot: 'bg-[#DC2626]',
          text: 'text-[#DC2626] dark:text-rose-400',
          label: status.toUpperCase(),
        };
      default:
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-500 dark:text-slate-400',
          label: t.status.ready,
        };
    }
  };

  return (
    <div className="space-y-6">
      <TaskInspectorDrawer
        task={liveSelectedTask}
        onClose={() => setSelectedTask(null)}
        onSelectTask={(tk) => setSelectedTask(tk)}
      />

      {/* =====================================================================
          COMMAND HEADER
      ===================================================================== */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            <span>{t.execution.kicker}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{activeMission?.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            {t.execution.title}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStepNextTask}
            className="px-3.5 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Advance Next Task</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTaskOpen(!isNewTaskOpen)}
            className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Dispatch Task</span>
          </button>

          <button
            onClick={downloadExecutiveReport}
            className="px-3.5 py-2 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{t.execution.downloadReport}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          7-METRIC EXECUTION COMMAND STRIP (SECTION 14 SPECIFICATION)
      ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            MISSION HEALTH
          </span>
          <span className="text-xl font-extrabold text-[#16A34A] block mt-1">
            {missionHealth}%
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            LIVE PROGRESS
          </span>
          <span className="text-xl font-extrabold text-[#2563EB] block mt-1">
            {activeMission?.progress || 0}%
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            ACTIVE TASKS
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-1">
            {inProgressCount} / {tasks.length}
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            AGENT STATUS
          </span>
          <span className="text-xl font-extrabold text-[#7C3AED] block mt-1">
            07 Active
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            RESOURCE UTIL
          </span>
          <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 block mt-1">
            {resourceUtilPct}%
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            CURRENT RISKS
          </span>
          <span
            className={`text-xl font-extrabold block mt-1 ${
              blockedOrFailedCount + waitingCount > 0 ? 'text-[#EAB308]' : 'text-[#16A34A]'
            }`}
          >
            {blockedOrFailedCount + waitingCount} Gated
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            MISSION ETA
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block mt-2">
            {activeMission?.eta || '35m'}
          </span>
        </div>
      </div>

      {/* Add Task Drawer Form */}
      {isNewTaskOpen && (
        <form
          onSubmit={handleAddTask}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-end gap-3 text-xs shadow-xs"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="font-bold block mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Deploy Emergency Medical Triage Team Bravo"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Assigned Agent</label>
            <select
              value={newTaskAgent}
              onChange={(e) => setNewTaskAgent(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            >
              <option value="Execution Agent">Execution Agent</option>
              <option value="Planning Agent">Planning Agent</option>
              <option value="Monitoring Agent">Monitoring Agent</option>
              <option value="Resource Agent">Resource Agent</option>
              <option value="Verification Agent">Verification Agent</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creatingTask}
            className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-lg cursor-pointer"
          >
            {creatingTask ? 'Saving Task...' : 'Save Task to Database'}
          </button>
        </form>
      )}

      {/* MISSION COMPLETED CELEBRATION DOSSIER */}
      {isMissionComplete && (
        <div className="p-6 bg-slate-950 text-white rounded-2xl border border-[#16A34A] border-l-4 border-l-[#16A34A] shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#16A34A] text-white font-black rounded-xl shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  {t.execution.autonomousVerified}
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  {t.execution.missionAccomplished}: {activeMission?.title}
                </h2>
              </div>
            </div>
            <button
              onClick={downloadExecutiveReport}
              className="px-4 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.execution.downloadDossier}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN EXECUTION LAYOUT: TASK QUEUE (8 COLS) + LIVE TIMELINE & RESOURCES (4 COLS)
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 8 COLS: FILTERABLE TASK EXECUTION QUEUE */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.execution.searchTasks}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/30 w-56 font-mono"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono capitalize cursor-pointer focus:outline-hidden"
              >
                <option value="all">{t.execution.filterAll}</option>
                <option value="completed">{t.status.completed}</option>
                <option value="in_progress">{t.status.in_progress}</option>
                <option value="waiting_approval">{t.status.waiting_approval}</option>
                <option value="replanning">{t.status.replanning}</option>
                <option value="blocked">Blocked</option>
                <option value="ready">{t.status.ready}</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-500 font-semibold">
              {filteredTasks.length} / {tasks.length} Tasks
            </span>
          </div>

          {/* Task Execution Table/List */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTasks.map((task) => {
                const isBusy = busyTaskId === task.id;
                const statusInfo = getStatusIndicator(task.status);
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-4 hover:bg-slate-50/90 dark:hover:bg-slate-900/60 cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-[240px] flex-1">
                      <div className="font-mono text-xs font-extrabold text-[#2563EB] w-14 shrink-0 pt-0.5">
                        {task.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-slate-950 dark:text-white group-hover:text-[#2563EB] transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                          <span className="text-[#7C3AED] font-semibold">{task.assignedAgent}</span>
                          <span>·</span>
                          <span>
                            {task.requiredResource ||
                              (task.metadata?.resources || ['Field Unit'])[0]}
                          </span>
                          <span>·</span>
                          <span>{task.estimatedDurationMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Controls */}
                    <div
                      className="flex flex-wrap items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(task.status === 'ready' || task.status === 'pending') && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleInlineTaskAction(e, task, 'in_progress')}
                          className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-mono font-bold rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Start</span>
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleInlineTaskAction(e, task, 'completed')}
                            className="px-2.5 py-1 bg-[#16A34A] hover:bg-emerald-700 text-white text-[10px] font-mono font-bold rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleInlineTaskAction(e, task, 'blocked')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <Pause className="w-2.5 h-2.5" />
                            <span>Pause</span>
                          </button>
                        </>
                      )}

                      {task.status === 'waiting_approval' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleInlineApproval(e, task)}
                          className="px-2.5 py-1 bg-[#EAB308] hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldAlert className="w-2.5 h-2.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {(task.status === 'blocked' ||
                        task.status === 'failed' ||
                        task.status === 'replanning') && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleInlineTaskAction(e, task, 'in_progress')}
                          className="px-2.5 py-1 bg-[#7C3AED] hover:bg-purple-700 text-white text-[10px] font-mono font-bold rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Resume</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-mono font-semibold rounded-md cursor-pointer"
                      >
                        Inspect
                      </button>

                      <div className="w-28 flex items-center justify-end gap-1.5 font-mono text-[10px] font-bold uppercase">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
                        <span className={`truncate ${statusInfo.text}`}>{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS: LIVE EXECUTION TIMELINE & RESOURCE UTILIZATION */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Execution Timeline */}
          <div className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  LIVE EXECUTION TIMELINE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                STREAMING
              </span>
            </div>

            <div className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800 text-xs font-mono">
              {auditLogs.slice(0, 5).map((log, i) => (
                <div key={log.id} className="relative">
                  <span
                    className={`w-2 h-2 rounded-full absolute -left-[13px] top-1.5 ${
                      i === 0 ? 'bg-[#16A34A]' : 'bg-[#2563EB]'
                    }`}
                  />
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()} ·{' '}
                    <span className="text-[#7C3AED] font-semibold">{log.agent}</span>
                  </div>
                  <div className="text-xs font-sans font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {log.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Utilization Compact Bars */}
          <div className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  RESOURCE UTILIZATION
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {resourceUtilPct}% Avg
              </span>
            </div>

            <div className="space-y-3">
              {resources.slice(0, 5).map((res) => {
                const pct = Math.round((res.inUse / Math.max(1, res.total)) * 100);
                return (
                  <div key={res.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-sans font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {res.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {res.inUse}/{res.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct > 85 ? 'bg-[#DC2626]' : pct > 70 ? 'bg-[#EAB308]' : 'bg-[#2563EB]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
