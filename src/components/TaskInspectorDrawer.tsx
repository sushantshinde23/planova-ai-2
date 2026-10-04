import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, MissionPriority } from '../types';
import { useMission } from '../store/missionContext';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  RotateCcw,
  Terminal,
  Wrench,
  User,
  Clock,
  GitCommit,
  FileCheck,
  MapPin,
  Layers,
  Save,
  ArrowRight,
  Cpu,
  Activity,
} from 'lucide-react';

interface TaskInspectorDrawerProps {
  task: Task | null;
  onClose: () => void;
  onSelectTask?: (task: Task) => void;
}

export const TaskInspectorDrawer: React.FC<TaskInspectorDrawerProps> = ({
  task,
  onClose,
  onSelectTask,
}) => {
  const {
    tasks,
    activeMission,
    updateTaskStatus,
    updateTask,
    openApprovalModal,
    approvals,
    triggerDisruption,
  } = useMission();

  const liveTask = task ? tasks.find((tk) => tk.id === task.id) || task : null;

  const [editPriority, setEditPriority] = useState<MissionPriority>('high');
  const [editResource, setEditResource] = useState<string>('');
  const [editAgent, setEditAgent] = useState<string>('Execution Agent');
  const [savingEdits, setSavingEdits] = useState<boolean>(false);
  const [actionBusy, setActionBusy] = useState<boolean>(false);

  useEffect(() => {
    if (liveTask) {
      setEditPriority(liveTask.priority || 'high');
      setEditResource(
        liveTask.requiredResource ||
          (liveTask.metadata?.resources && liveTask.metadata.resources[0]) ||
          'Field Operations Unit'
      );
      setEditAgent(liveTask.assignedAgent || 'Execution Agent');
    }
  }, [liveTask?.id, liveTask?.priority, liveTask?.requiredResource, liveTask?.assignedAgent]);

  if (!liveTask) return null;

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeDeps = Array.isArray(liveTask.dependencies) ? liveTask.dependencies : [];
  const upstreamTasks = safeTasks.filter((tk) => safeDeps.includes(tk.id));
  const downstreamTasks = safeTasks.filter((tk) => (tk.dependencies || []).includes(liveTask.id));
  const matchingApproval = (Array.isArray(approvals) ? approvals : []).find(
    (a) => a.taskId === liveTask.id && a.status === 'pending'
  );

  const getCompletionPct = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 100;
      case 'in_progress':
        return 67;
      case 'waiting_approval':
        return 48;
      case 'replanning':
        return 52;
      case 'blocked':
      case 'failed':
        return 35;
      default:
        return 15;
    }
  };

  const pct = getCompletionPct(liveTask.status);
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    setActionBusy(true);
    try {
      await updateTaskStatus(liveTask.id, nextStatus);
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveTaskConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdits(true);
    try {
      await updateTask(liveTask.id, {
        priority: editPriority,
        requiredResource: editResource,
        assignedAgent: editAgent as any,
        metadata: {
          ...liveTask.metadata,
          resources: [
            editResource,
            ...((liveTask.metadata?.resources || []).slice(1)),
          ],
        },
      });
    } finally {
      setSavingEdits(false);
    }
  };

  const stateTimeline = [
    { state: 'READY', active: true, desc: 'Ingested into Mission DAG' },
    { state: 'ASSIGNED', active: true, desc: `Bound to ${liveTask.assignedAgent}` },
    {
      state:
        liveTask.status === 'waiting_approval'
          ? 'WAITING APPROVAL'
          : liveTask.status === 'blocked' || liveTask.status === 'failed'
          ? 'ALERT / HALTED'
          : 'IN PROGRESS',
      active: liveTask.status !== 'pending',
      desc: `Current Execution Progress: ${pct}%`,
    },
    {
      state: 'VERIFIED COMPLETE',
      active: liveTask.status === 'completed' || liveTask.status === 'verified',
      desc: liveTask.metadata?.successCriteria || '100% Telemetry Proof',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F172A] h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* =================================================================
              HEADER: TASK ID, TITLE, STATUS, AND VISUAL PROGRESS RING
          ================================================================= */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-extrabold text-[#2563EB] dark:text-blue-400">
                  {liveTask.id.replace('T-', 'TASK ')}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 uppercase">
                  {liveTask.metadata?.phase || 'Operational Phase'}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white leading-snug">
                {liveTask.title}
              </h2>
              <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveTask.status === 'completed' || liveTask.status === 'verified'
                      ? 'bg-[#16A34A]'
                      : liveTask.status === 'in_progress'
                      ? 'bg-[#2563EB] animate-ping'
                      : liveTask.status === 'waiting_approval'
                      ? 'bg-[#EAB308] animate-pulse'
                      : liveTask.status === 'failed' || liveTask.status === 'blocked'
                      ? 'bg-[#DC2626]'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-bold uppercase text-slate-800 dark:text-slate-200">
                  {liveTask.status.replace('_', ' ')}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-bold text-[#2563EB]">{pct}%</span>
              </div>
            </div>

            {/* Right: SVG Progress Ring + Close */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke={pct === 100 ? '#16A34A' : '#2563EB'}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-extrabold text-slate-900 dark:text-white">
                  {pct}%
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* =================================================================
              SECTION 1: OVERVIEW
          ================================================================= */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              OVERVIEW
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {liveTask.description}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span className="truncate">
                  {liveTask.metadata?.location || activeMission?.location || 'Sector 4'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                <span>Est. Duration: {liveTask.estimatedDurationMinutes} mins</span>
              </div>
            </div>
          </div>

          {/* =================================================================
              SECTION 2: EXECUTION CONTROLS (STATE MACHINE)
          ================================================================= */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EXECUTION STATE CONTROLS
              </span>
              <span className="text-[10px] font-mono text-[#16A34A] font-semibold">
                ● Persisted to Database
              </span>
            </div>

            {liveTask.status === 'waiting_approval' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Human-in-the-Loop Governance Gate Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (matchingApproval) {
                      onClose();
                      openApprovalModal(matchingApproval);
                    } else {
                      handleStatusChange('completed');
                    }
                  }}
                  className="w-full py-2 bg-[#EAB308] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Review & Authorize Execution Gate
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                disabled={actionBusy || liveTask.status === 'in_progress'}
                onClick={() => handleStatusChange('in_progress')}
                className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 text-[#2563EB] dark:text-blue-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Task</span>
              </button>

              <button
                type="button"
                disabled={actionBusy || liveTask.status === 'completed'}
                onClick={() => handleStatusChange('completed')}
                className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#16A34A] dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>

              <button
                type="button"
                disabled={actionBusy || liveTask.status === 'blocked'}
                onClick={() => handleStatusChange('blocked')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause / Hold</span>
              </button>

              <button
                type="button"
                disabled={actionBusy || liveTask.status === 'failed'}
                onClick={() => handleStatusChange('failed')}
                className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 text-[#DC2626] dark:text-rose-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Mark Failed</span>
              </button>

              <button
                type="button"
                disabled={actionBusy}
                onClick={async () => {
                  setActionBusy(true);
                  try {
                    await triggerDisruption('route_r2_blocked');
                  } finally {
                    setActionBusy(false);
                  }
                }}
                className="col-span-2 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Trigger Adaptive Re-Plan</span>
              </button>
            </div>
          </div>

          {/* =================================================================
              SECTION 3: AGENT & RESOURCES CONFIGURATION
          ================================================================= */}
          <form
            onSubmit={handleSaveTaskConfig}
            className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                AGENT & RESOURCE ASSIGNMENT
              </span>
              <button
                type="submit"
                disabled={savingEdits}
                className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-mono font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>{savingEdits ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  AGENT
                </label>
                <select
                  value={editAgent}
                  onChange={(e) => setEditAgent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="Planning Agent">Planning Agent</option>
                  <option value="Execution Agent">Execution Agent</option>
                  <option value="Resource Agent">Resource Agent</option>
                  <option value="Monitoring Agent">Monitoring Agent</option>
                  <option value="Verification Agent">Verification Agent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  PRIORITY
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as MissionPriority)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs uppercase"
                >
                  <option value="critical">CRITICAL</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  RESOURCE
                </label>
                <input
                  type="text"
                  value={editResource}
                  onChange={(e) => setEditResource(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </form>

          {/* =================================================================
              SECTION 4: DEPENDENCIES (UPSTREAM & DOWNSTREAM)
          ================================================================= */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              DEPENDENCIES & DAG TOPOLOGY
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  Upstream Prerequisites ({upstreamTasks.length}):
                </span>
                {upstreamTasks.length === 0 ? (
                  <span className="text-slate-500 text-[11px]">
                    Root Node — Zero upstream blockers
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {upstreamTasks.map((ut) => (
                      <button
                        key={ut.id}
                        type="button"
                        onClick={() => onSelectTask && onSelectTask(ut)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="font-bold text-[#2563EB]">{ut.id}</span>
                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                          {ut.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Downstream Dependents ({downstreamTasks.length}):
                </span>
                {downstreamTasks.length === 0 ? (
                  <span className="text-slate-500 text-[11px]">
                    Terminal Node — Finalizes phase
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {downstreamTasks.map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => onSelectTask && onSelectTask(dt)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#7C3AED] flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="font-bold text-[#7C3AED]">{dt.id}</span>
                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                          {dt.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================
              SECTION 5: STATE HISTORY TIMELINE (READY -> ASSIGNED -> IN PROGRESS -> 67%)
          ================================================================= */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              STATE HISTORY & PROGRESSION
            </span>
            <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800 font-mono text-xs">
              {stateTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`w-2.5 h-2.5 rounded-full absolute -left-[17px] top-1 ${
                      item.active ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                  <div
                    className={`font-bold text-[11px] ${
                      item.active
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {item.state}
                  </div>
                  <div className="text-[10px] text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================================
              SECTION 6: TELEMETRY & ACTIVITY LOGS
          ================================================================= */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#7C3AED]" />
              TELEMETRY & EXECUTION LOGS
            </span>
            <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5 border border-slate-800 max-h-44 overflow-y-auto">
              {(liveTask.executionLogs && liveTask.executionLogs.length > 0
                ? liveTask.executionLogs
                : [
                    `[00:00.12] Task ${liveTask.id} initialized in ${activeMission?.id}`,
                    `[00:01.04] Assigned to ${liveTask.assignedAgent} via Orchestration Bus`,
                    `[00:01.88] Bound tool: ${liveTask.requiredTool || 'Autonomous Executor'}`,
                    `[00:02.40] Status telemetry: ${liveTask.status.toUpperCase()} (${pct}%)`,
                  ]
              ).map((log, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-cyan-400 mr-1.5">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Tool: <strong className="text-slate-800 dark:text-slate-200">{liveTask.requiredTool || 'Autonomous API'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
