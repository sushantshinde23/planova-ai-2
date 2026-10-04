import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { useMission } from '../store/missionContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
  ArrowRight,
  User,
  Wrench,
  Play,
  Pause,
  AlertTriangle,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  GitBranch,
  Sparkles,
} from 'lucide-react';

interface DependencyGraphCanvasProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string | null;
}

export const DependencyGraphCanvas: React.FC<DependencyGraphCanvasProps> = ({
  onSelectTask,
  selectedTaskId,
}) => {
  const {
    tasks,
    activeMission,
    selectedPlanVersion,
    updateTaskStatus,
    openApprovalModal,
    approvals,
    triggerDisruption,
  } = useMission();

  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);

  // Detect any failed or blocked task for Dependency Cascade Alert Banner
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const failedOrBlockedTasks = safeTasks.filter(
    (tk) => tk.status === 'failed' || tk.status === 'blocked' || tk.status === 'replanning'
  );
  const primaryCascadeTask = failedOrBlockedTasks[0] || null;
  const cascadeDownstreamTasks = primaryCascadeTask
    ? safeTasks.filter(
        (tk) =>
          (tk.dependencies || []).includes(primaryCascadeTask.id) ||
          safeTasks
            .filter((mid) => (mid.dependencies || []).includes(primaryCascadeTask.id))
            .some((mid) => (tk.dependencies || []).includes(mid.id))
      )
    : [];

  // Group tasks dynamically into 4 operational columns
  const buildPhaseGroups = () => {
    const filtered = safeTasks.filter((tk) => {
      const matchesStatus = statusFilter === 'all' || tk.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        (tk.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tk.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tk.assignedAgent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tk.requiredResource || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const p1: Task[] = [];
    const p2: Task[] = [];
    const p3: Task[] = [];
    const p4: Task[] = [];

    filtered.forEach((tk, idx) => {
      const phaseText = (tk.metadata?.phase || '').toLowerCase();
      if (phaseText.includes('phase 1') || phaseText.includes('assessment') || phaseText.includes('intel')) {
        p1.push(tk);
      } else if (phaseText.includes('phase 2') || phaseText.includes('mobilization') || phaseText.includes('resource')) {
        p2.push(tk);
      } else if (phaseText.includes('phase 4') || phaseText.includes('verification') || phaseText.includes('audit')) {
        p4.push(tk);
      } else if (phaseText.includes('phase 3') || phaseText.includes('execution') || phaseText.includes('rerouting')) {
        p3.push(tk);
      } else {
        const ratio = idx / Math.max(1, filtered.length);
        if (ratio < 0.25) p1.push(tk);
        else if (ratio < 0.5) p2.push(tk);
        else if (ratio < 0.8) p3.push(tk);
        else p4.push(tk);
      }
    });

    return [
      { title: '01. ASSESSMENT & INTEL', subtitle: 'Ingestion & Hazard Mapping', tasks: p1 },
      { title: '02. RESOURCE MOBILIZATION', subtitle: 'Staging & Fleet Dispatch', tasks: p2 },
      { title: '03. ADAPTIVE EXECUTION', subtitle: 'Field Operations & Detours', tasks: p3 },
      { title: '04. OUTCOME VERIFICATION', subtitle: 'Audit & Closure Proofs', tasks: p4 },
    ];
  };

  const phases = buildPhaseGroups();

  const getStatusTheme = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return {
          border: 'border-emerald-300 dark:border-emerald-800/90',
          bg: 'bg-white dark:bg-[#111827]',
          topBar: 'bg-[#16A34A]',
          dot: 'bg-[#16A34A]',
          text: 'text-[#16A34A] dark:text-emerald-400',
          label: status === 'verified' ? 'VERIFIED' : 'COMPLETED',
          pct: 100,
        };
      case 'in_progress':
        return {
          border: 'border-[#2563EB] dark:border-blue-500 ring-1 ring-[#2563EB]/20',
          bg: 'bg-white dark:bg-[#111827]',
          topBar: 'bg-[#2563EB]',
          dot: 'bg-[#2563EB] animate-ping',
          text: 'text-[#2563EB] dark:text-blue-400',
          label: 'IN PROGRESS',
          pct: 67,
        };
      case 'waiting_approval':
        return {
          border: 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30',
          bg: 'bg-amber-50/30 dark:bg-amber-950/20',
          topBar: 'bg-[#EAB308]',
          dot: 'bg-[#EAB308] animate-pulse',
          text: 'text-amber-700 dark:text-amber-400',
          label: 'WAITING GATE',
          pct: 48,
        };
      case 'replanning':
        return {
          border: 'border-purple-400 dark:border-purple-600 ring-1 ring-purple-500/20',
          bg: 'bg-purple-50/30 dark:bg-purple-950/20',
          topBar: 'bg-[#7C3AED]',
          dot: 'bg-[#7C3AED] animate-spin',
          text: 'text-[#7C3AED] dark:text-purple-400',
          label: 'RE-PLANNING',
          pct: 52,
        };
      case 'failed':
      case 'blocked':
        return {
          border: 'border-rose-400 dark:border-rose-700 ring-1 ring-rose-500/30',
          bg: 'bg-rose-50/30 dark:bg-rose-950/20',
          topBar: 'bg-[#DC2626]',
          dot: 'bg-[#DC2626]',
          text: 'text-[#DC2626] dark:text-rose-400',
          label: status.toUpperCase(),
          pct: 35,
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-800',
          bg: 'bg-white dark:bg-[#111827]',
          topBar: 'bg-slate-300 dark:bg-slate-700',
          dot: 'bg-slate-400',
          text: 'text-slate-500 dark:text-slate-400',
          label: 'READY',
          pct: 15,
        };
    }
  };

  const isRelated = (task: Task) => {
    const activeRefId = hoveredTaskId || selectedTaskId;
    if (!activeRefId) return false;
    if (task.id === activeRefId) return true;
    const refTask = safeTasks.find((tk) => tk.id === activeRefId);
    if (!refTask) return false;
    return (
      (refTask.dependencies || []).includes(task.id) ||
      (task.dependencies || []).includes(activeRefId)
    );
  };

  const handleQuickAction = async (
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

  const handleQuickApprove = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const matchingApproval = approvals.find(
      (a) => a.taskId === task.id && a.status === 'pending'
    );
    if (matchingApproval) {
      openApprovalModal(matchingApproval);
    } else {
      updateTaskStatus(task.id, 'completed');
    }
  };

  return (
    <div className="space-y-4">
      {/* =====================================================================
          DEPENDENCY CASCADE ALERT BANNER (SECTION 13 REQUIREMENT)
      ===================================================================== */}
      {primaryCascadeTask && (
        <div className="p-4 bg-slate-950 text-white rounded-xl border border-rose-500/60 border-l-4 border-l-[#DC2626] shadow-lg space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#DC2626] text-white rounded-lg font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  <span>⚠ DEPENDENCY CASCADE DETECTED</span>
                  <span>·</span>
                  <span>
                    {primaryCascadeTask.id} {primaryCascadeTask.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  <strong className="text-white">{primaryCascadeTask.title}</strong> —{' '}
                  {cascadeDownstreamTasks.length} downstream task node(s) impacted in critical path.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => triggerDisruption('route_r2_blocked')}
              className="px-3.5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SYNTHESIZE PLAN V{(activeMission?.planVersion || 1) + 1}</span>
            </button>
          </div>

          {/* Visual Cascade Chain */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400 uppercase text-[10px]">Cascade Chain:</span>
            <button
              type="button"
              onClick={() => onSelectTask(primaryCascadeTask)}
              className="px-2 py-1 rounded bg-rose-950/90 border border-rose-600 text-rose-300 font-bold cursor-pointer"
            >
              {primaryCascadeTask.id} ({primaryCascadeTask.status.toUpperCase()})
            </button>
            {cascadeDownstreamTasks.slice(0, 4).map((dt) => (
              <React.Fragment key={dt.id}>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                <button
                  type="button"
                  onClick={() => onSelectTask(dt)}
                  className="px-2 py-1 rounded bg-slate-900 border border-amber-500/50 text-amber-300 font-semibold hover:border-amber-400 cursor-pointer"
                >
                  {dt.id}: {dt.title.slice(0, 22)}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          GRAPH CANVAS TOOLBAR: SEARCH, STATUS FILTERS, ZOOM & LEGEND
      ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task ID, title, agent..."
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/30 w-52 font-mono"
            />
          </div>

          {/* Segmented Status Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
            {[
              { id: 'all', label: `All (${tasks.length})` },
              {
                id: 'in_progress',
                label: `Executing (${tasks.filter((tk) => tk.status === 'in_progress').length})`,
              },
              {
                id: 'waiting_approval',
                label: `Gated (${tasks.filter((tk) => tk.status === 'waiting_approval').length})`,
              },
              {
                id: 'completed',
                label: `Done (${
                  tasks.filter((tk) => tk.status === 'completed' || tk.status === 'verified')
                    .length
                })`,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Legend & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" /> Waiting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> Replanning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Failed/Blocked
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.8, +(z - 0.1).toFixed(1)))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.2, +(z + 0.1).toFixed(1)))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          INTERACTIVE 4-PHASE DAG CANVAS WITH ANIMATED CONNECTOR HEADER
      ===================================================================== */}
      <div className="relative bg-grid-pattern rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 overflow-x-auto">
        {/* Animated SVG Pipeline Flow Strip Across Phases */}
        <div className="hidden lg:block mb-4">
          <svg viewBox="0 0 1200 28" className="w-full h-7">
            <line
              x1="80"
              y1="14"
              x2="1120"
              y2="14"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              className="dark:stroke-slate-800"
            />
            <line
              x1="80"
              y1="14"
              x2="1120"
              y2="14"
              stroke="#2563EB"
              strokeWidth="2"
              className="animate-data-flow"
            />
            {[150, 450, 750, 1050].map((cx, i) => (
              <g key={i}>
                <circle
                  cx={cx}
                  cy="14"
                  r="6"
                  fill={i === 0 ? '#16A34A' : i === 1 ? '#2563EB' : i === 2 ? '#7C3AED' : '#16A34A'}
                />
                <circle
                  cx={cx}
                  cy="14"
                  r="10"
                  fill="none"
                  stroke={i === 0 ? '#16A34A' : i === 1 ? '#2563EB' : i === 2 ? '#7C3AED' : '#16A34A'}
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* 4-Column DAG Phase Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-transform origin-top-left"
          style={{ transform: `scale(${zoomScale})` }}
        >
          {phases.map((phase, pIdx) => (
            <div key={pIdx} className="flex flex-col space-y-3 min-w-[240px]">
              {/* Column Header */}
              <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[11px] font-mono font-extrabold text-slate-900 dark:text-white block">
                    {phase.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {phase.subtitle}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-blue-400">
                  {phase.tasks.length}
                </span>
              </div>

              {/* Task Nodes in Phase */}
              <div className="space-y-3">
                {phase.tasks.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No tasks match filter in this phase
                  </div>
                ) : (
                  phase.tasks.map((task) => {
                    const theme = getStatusTheme(task.status);
                    const isSelected = selectedTaskId === task.id;
                    const related = isRelated(task);
                    const isBusy = busyTaskId === task.id;
                    const isReroutedNode =
                      selectedPlanVersion >= 2 &&
                      (task.id === 'T-09' ||
                        task.id === 'T-10' ||
                        task.status === 'replanning' ||
                        task.title.toLowerCase().includes('bypass') ||
                        task.title.toLowerCase().includes('re-plan'));

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                        className={`relative rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                          theme.bg
                        } ${theme.border} ${
                          isSelected
                            ? 'ring-2 ring-[#2563EB] shadow-md'
                            : related
                            ? 'ring-2 ring-[#7C3AED]/60'
                            : ''
                        }`}
                      >
                        {/* Top Semantic Color Strip */}
                        <div className={`h-1 w-full ${theme.topBar}`} />

                        <div className="p-3.5 space-y-2.5">
                          {/* Row 1: TASK ID + STATUS + PERCENTAGE */}
                          <div className="flex items-center justify-between gap-2 font-mono">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                              {task.id.replace('T-', 'TASK ')}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                              <span className={`text-[10px] font-bold uppercase ${theme.text}`}>
                                {theme.label}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Task Title */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {task.title}
                          </h4>

                          {/* Row 3: Progress Bar & Percentage */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>Execution</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {theme.pct}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${theme.topBar}`}
                                style={{ width: `${theme.pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Row 4: Agent & Dependencies */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="truncate font-semibold text-[#7C3AED] dark:text-purple-400">
                              Agent: {(task.assignedAgent || 'Execution Agent').replace(' Agent', '-AI')}
                            </span>
                            {(task.dependencies || []).length > 0 ? (
                              <span className="shrink-0 text-slate-400">
                                ← {(task.dependencies || []).join(', ')}
                              </span>
                            ) : (
                              <span className="shrink-0 text-slate-400">Root</span>
                            )}
                          </div>

                          {/* Adaptive Re-plan Callout if applicable */}
                          {isReroutedNode && (
                            <div className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[10px] font-mono text-[#7C3AED] dark:text-purple-300 font-semibold flex items-center justify-between">
                              <span>✦ Adaptive Plan v{selectedPlanVersion}</span>
                              <span>Rerouted</span>
                            </div>
                          )}

                          {/* Quick Inline Action Controls */}
                          <div
                            className="pt-1 flex items-center justify-between gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(task.status === 'ready' || task.status === 'pending') && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, task, 'in_progress')}
                                className="flex-1 py-1 px-2 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
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
                                  onClick={(e) => handleQuickAction(e, task, 'completed')}
                                  className="flex-1 py-1 px-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Complete</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={(e) => handleQuickAction(e, task, 'failed')}
                                  className="py-1 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-300 text-[10px] font-mono font-bold rounded cursor-pointer"
                                  title="Simulate Failure Cascade"
                                >
                                  Fail
                                </button>
                              </>
                            )}

                            {task.status === 'waiting_approval' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={(e) => handleQuickApprove(e, task)}
                                className="flex-1 py-1 px-2 bg-[#EAB308] hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <ShieldAlert className="w-2.5 h-2.5" />
                                <span>Approve Gate</span>
                              </button>
                            )}

                            {(task.status === 'blocked' ||
                              task.status === 'failed' ||
                              task.status === 'replanning') && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, task, 'in_progress')}
                                className="flex-1 py-1 px-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Resume</span>
                              </button>
                            )}

                            {(task.status === 'completed' || task.status === 'verified') && (
                              <span className="text-[10px] font-mono text-[#16A34A] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectTask(task)}
                              className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold rounded cursor-pointer"
                            >
                              Inspect →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Mini-Map Indicator in Bottom-Right of Canvas */}
        {showMinimap && (
          <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>
                DAG TOPOLOGY MAP · {tasks.length} NODES ACROSS 4 PHASES · PLAN V
                {selectedPlanVersion}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {phases.map((p, idx) => (
                <div
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px]"
                >
                  P{idx + 1}: <strong>{p.tasks.length}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
