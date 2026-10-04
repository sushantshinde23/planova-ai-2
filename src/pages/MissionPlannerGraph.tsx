import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { DependencyGraphCanvas } from '../components/DependencyGraphCanvas';
import { TaskInspectorDrawer } from '../components/TaskInspectorDrawer';
import { Task } from '../types';
import {
  GitCompare,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Route,
  Truck,
  Clock,
  Plus,
  Play,
} from 'lucide-react';

export const MissionPlannerGraph: React.FC = () => {
  const {
    activeMission,
    tasks,
    plans,
    selectedPlanVersion,
    setSelectedPlanVersion,
    createPlanVersion,
    createTask,
    triggerDisruption,
    t,
  } = useMission();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [savingPlan, setSavingPlan] = useState<boolean>(false);
  const [replanning, setReplanning] = useState<boolean>(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskAgent, setNewTaskAgent] = useState<string>('Execution Agent');
  const [newTaskResource, setNewTaskResource] = useState<string>('Field Response Unit');
  const [newTaskDep, setNewTaskDep] = useState<string>('');

  const liveSelectedTask = selectedTask
    ? tasks.find((tk) => tk.id === selectedTask.id) || selectedTask
    : null;

  const handleSaveNewPlanVersion = async () => {
    setSavingPlan(true);
    try {
      await createPlanVersion(
        `Operator-initiated plan snapshot & dependency verification checkpoint for ${activeMission?.title || 'Mission'}`,
        'Manual Command Snapshot'
      );
    } catch {
      // handled by context
    } finally {
      setSavingPlan(false);
    }
  };

  const handleAdaptiveReplan = async () => {
    setReplanning(true);
    try {
      await triggerDisruption('route_r2_blocked');
    } catch {
      // handled by context
    } finally {
      setReplanning(false);
    }
  };

  const handleCreateTaskInGraph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask({
      title: newTaskTitle.trim(),
      description: `Added to ${activeMission?.title} DAG graph`,
      assignedAgent: newTaskAgent as any,
      requiredResource: newTaskResource,
      dependencies: newTaskDep ? [newTaskDep] : [],
      status: 'ready',
      priority: activeMission?.priority || 'high',
      estimatedDurationMinutes: 20,
      metadata: {
        phase: 'Phase 3: Execution',
        location: activeMission?.location || 'Primary Sector',
        resources: [newTaskResource],
        successCriteria: '100% Verified Execution',
      },
    });
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const currentPlan = plans.find((p) => p.version === selectedPlanVersion) ||
    plans[plans.length - 1] || {
      version: activeMission?.planVersion || 1,
      createdAt: new Date().toISOString(),
      reason: `Baseline autonomous decomposition for ${activeMission?.title || 'Active Mission'}`,
      triggeredBy: 'Planning Agent',
      changes: ['Initial DAG synthesized from mission objective'],
      summaryDiff: {
        addedTasks: tasks.length,
        removedTasks: 0,
        reroutedPaths: 1,
        resourceAdjustments: 1,
      },
    };

  const originalPlan = plans.find((p) => p.version === 1) || currentPlan;

  const completedTasksCount = tasks.filter(
    (tk) => tk.status === 'completed' || tk.status === 'verified'
  ).length;
  const inProgressCount = tasks.filter((tk) => tk.status === 'in_progress').length;
  const blockedOrWaitingCount = tasks.filter(
    (tk) =>
      tk.status === 'blocked' ||
      tk.status === 'waiting_approval' ||
      tk.status === 'replanning' ||
      tk.status === 'failed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Drawer for task inspection */}
      <TaskInspectorDrawer
        task={liveSelectedTask}
        onClose={() => setSelectedTask(null)}
        onSelectTask={(tk) => setSelectedTask(tk)}
      />

      {/* Header and Version Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>{t.planner.kicker}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#2563EB]">
              {activeMission?.id}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeMission?.title}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            {t.planner.title}
          </h1>
        </div>

        {/* Plan Version Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Version Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
            {plans.map((p) => (
              <button
                key={p.version}
                onClick={() => setSelectedPlanVersion(p.version)}
                className={`px-3 py-1.5 font-bold rounded-md transition-all cursor-pointer ${
                  selectedPlanVersion === p.version
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {t.planner.version} v{p.version}{' '}
                {p.version === 1
                  ? '(Baseline)'
                  : p.version === 2
                  ? '(Adaptive v2)'
                  : `(Re-Plan v${p.version})`}
              </button>
            ))}
          </div>

          {/* Add Task Node Button */}
          <button
            type="button"
            onClick={() => setShowAddTaskModal(!showAddTaskModal)}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task Node</span>
          </button>

          {/* Trigger Adaptive Re-plan Button */}
          <button
            type="button"
            disabled={replanning}
            onClick={handleAdaptiveReplan}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${replanning ? 'animate-spin' : ''}`} />
            <span>{replanning ? 'Re-Planning...' : 'Trigger Re-Plan'}</span>
          </button>

          {/* Save New Plan Version Button */}
          <button
            type="button"
            disabled={savingPlan}
            onClick={handleSaveNewPlanVersion}
            className="px-3 py-1.5 bg-[#7C3AED] hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{savingPlan ? 'Saving Plan...' : `Save Plan v${plans.length + 1}`}</span>
          </button>

          {/* Toggle Plan Diff Mode */}
          <button
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isDiffMode
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isDiffMode ? t.common.close : t.planner.diffToggle}</span>
          </button>
        </div>
      </div>

      {/* ADD TASK NODE DRAWER/FORM */}
      {showAddTaskModal && (
        <form
          onSubmit={handleCreateTaskInGraph}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3 items-end text-xs shadow-xs"
        >
          <div className="sm:col-span-2">
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              New Task Node Title
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Deploy Auxiliary Telemetry Relay"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              Assigned Agent
            </label>
            <select
              value={newTaskAgent}
              onChange={(e) => setNewTaskAgent(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            >
              <option value="Planning Agent">Planning Agent</option>
              <option value="Execution Agent">Execution Agent</option>
              <option value="Resource Agent">Resource Agent</option>
              <option value="Monitoring Agent">Monitoring Agent</option>
              <option value="Verification Agent">Verification Agent</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              Upstream Dependency
            </label>
            <select
              value={newTaskDep}
              onChange={(e) => setNewTaskDep(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            >
              <option value="">None (Root Node)</option>
              {tasks.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.id}: {tk.title.slice(0, 26)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
            >
              Insert Node
            </button>
            <button
              type="button"
              onClick={() => setShowAddTaskModal(false)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* PLAN VERSION METADATA & REASON BANNER */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {t.planner.version}: Plan v{currentPlan.version}
            </span>
            <span aria-hidden="true">·</span>
            <span>{new Date(currentPlan.createdAt).toLocaleTimeString()}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#7C3AED] font-semibold">
              Triggered by: {currentPlan.triggeredBy || 'Planning Agent'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-slate-500">
              {t.planner.tasksTotal}:{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {tasks.length}
              </strong>
            </span>
            <span className="text-slate-500">
              Completed:{' '}
              <strong className="text-[#16A34A] font-mono">
                {completedTasksCount}
              </strong>
            </span>
            <span className="text-slate-500">
              Executing:{' '}
              <strong className="text-[#2563EB] font-mono">
                {inProgressCount}
              </strong>
            </span>
            <span className="text-slate-500">
              Gated/Blocked:{' '}
              <strong className="text-[#EAB308] font-mono">
                {blockedOrWaitingCount}
              </strong>
            </span>
            <span className="text-slate-500">
              {t.planner.criticalPath}:{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-mono">
                {currentPlan.summaryDiff?.reroutedPaths ?? 1}
              </strong>
            </span>
            <span className="text-slate-500">
              {t.planner.disruptionsHandled}:{' '}
              <strong className="text-purple-600 dark:text-purple-400 font-mono">
                {currentPlan.summaryDiff?.resourceAdjustments ?? 1}
              </strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 font-mono">
          <strong className="text-[#2563EB]">{t.approval.reason}:</strong>{' '}
          {currentPlan.reason}
        </p>
      </div>

      {/* SIDE-BY-SIDE DIFF COMPARATOR */}
      {isDiffMode && (
        <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4 shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {t.planner.diffToggle} — {activeMission?.title}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Comparing Baseline Plan v1 vs Active Plan v{currentPlan.version}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Original Plan Column */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-400 block border-b border-slate-800 pb-1">
                ORIGINAL BASELINE PLAN (v{originalPlan.version})
              </span>
              <p className="text-[11px] text-slate-400">{originalPlan.reason}</p>
              <ul className="space-y-1.5 text-slate-300">
                {(originalPlan.changes && originalPlan.changes.length > 0
                  ? originalPlan.changes
                  : [
                      `Primary Corridor: ${activeMission?.location || 'Standard Route'}`,
                      `Baseline Tasks: ${tasks.length} scheduled nodes`,
                      `Target ETA: ${activeMission?.eta || 'Standard SLA'}`,
                    ]
                ).map((chg, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Route className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{chg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Replanned Column */}
            <div className="p-4 bg-slate-950 rounded-lg border border-amber-900/60 space-y-2.5">
              <span className="font-bold text-amber-400 block border-b border-amber-900/60 pb-1 flex items-center justify-between">
                <span>ACTIVE PLAN (v{currentPlan.version})</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                  {currentPlan.version > 1 ? 'ADAPTIVE RE-PLAN' : 'ACTIVE BASELINE'}
                </span>
              </span>
              <p className="text-[11px] text-amber-200/90">{currentPlan.reason}</p>
              <ul className="space-y-1.5 text-slate-200">
                {(currentPlan.changes && currentPlan.changes.length > 0
                  ? currentPlan.changes
                  : [
                      `Dynamic rerouting & resource balancing active`,
                      `Rerouted Paths: ${currentPlan.summaryDiff?.reroutedPaths || 1}`,
                      `Resource Adjustments: ${currentPlan.summaryDiff?.resourceAdjustments || 1}`,
                    ]
                ).map((chg, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-amber-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{chg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE DEPENDENCY GRAPH CANVAS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">
              {t.planner.graphView}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-semibold">
              {tasks.length} Connected Nodes
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Click any task node to inspect telemetry, dependencies, or execute state transitions directly.
          </span>
        </div>

        {/* The Visual Canvas */}
        <DependencyGraphCanvas
          onSelectTask={(task) => setSelectedTask(task)}
          selectedTaskId={liveSelectedTask?.id || null}
        />
      </div>
    </div>
  );
};
