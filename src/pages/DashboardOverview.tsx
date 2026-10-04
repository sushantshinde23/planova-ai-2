import React from 'react';
import { useMission } from '../store/missionContext';
import { tr } from '../i18n/translations';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  ShieldAlert,
  Truck,
  Cpu,
  Layers,
  Clock,
  MapPin,
  Sparkles,
  Play,
  Radio,
  GitBranch,
  Zap,
} from 'lucide-react';

export const DashboardOverview: React.FC<{
  onLaunchNewMission: () => void;
  onNavigate: (view: string) => void;
}> = ({ onLaunchNewMission, onNavigate }) => {
  const {
    t,
    language,
    missions,
    activeMission,
    tasks,
    resources,
    auditLogs,
    approvals,
    currentUser,
    triggerDisruption,
    openApprovalModal,
    setSelectedPlanVersion,
  } = useMission();

  const activeMissionsCount = missions.filter(
    (m) => m.status === 'executing' || m.status === 'planning'
  ).length;
  const completedMissionsCount = missions.filter((m) => m.status === 'completed').length;
  const tasksExecuting = tasks.filter((tk) => tk.status === 'in_progress').length;
  const tasksWaitingApproval = tasks.filter((tk) => tk.status === 'waiting_approval').length;
  const tasksBlocked = tasks.filter(
    (tk) => tk.status === 'blocked' || tk.status === 'failed' || tk.status === 'replanning'
  ).length;
  const atRiskCount = tasksWaitingApproval + tasksBlocked;

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const progressPct = activeMission?.progress ?? 58;
  const missionHealth = Math.max(
    72,
    Math.min(99, 94 - tasksBlocked * 6 - tasksWaitingApproval * 2)
  );
  const resourceUtilizationAvg =
    resources.length > 0
      ? Math.round(
          resources.reduce((acc, r) => acc + (r.inUse / Math.max(1, r.total)) * 100, 0) /
            resources.length
        )
      : 82;

  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12
      ? tr('GOOD MORNING', language)
      : hour < 18
      ? tr('GOOD AFTERNOON', language)
      : tr('GOOD EVENING', language);
  const operatorFirstName = (currentUser?.name || 'Sushant').split(' ')[0].toUpperCase();

  const liveAgentStates = [
    {
      name: tr('Planning', language),
      role: 'DAG Decomposition',
      state: `${t.planner.version} v${activeMission?.planVersion || 1}`,
      dot: 'bg-[#7C3AED]',
      accent: 'text-[#7C3AED] dark:text-purple-400',
    },
    {
      name: tr('Execution', language),
      role: 'Field Dispatch',
      state: `${tasksExecuting} ${tr('Executing', language)}`,
      dot: 'bg-[#2563EB]',
      accent: 'text-[#2563EB] dark:text-blue-400',
    },
    {
      name: tr('Monitoring', language),
      role: 'Telemetry Sweep',
      state:
        tasksWaitingApproval > 0
          ? `${tasksWaitingApproval} ${tr('Gated', language)}`
          : tr('Nominal', language),
      dot: 'bg-[#06B6D4]',
      accent: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      name: tr('Resource', language),
      role: 'Fleet Allocation',
      state: `${resourceUtilizationAvg}% ${tr('Allocated', language)}`,
      dot: 'bg-[#DB2777]',
      accent: 'text-[#DB2777] dark:text-pink-400',
    },
    {
      name: tr('Risk & Route Gate', language),
      role: 'Hazard Sentinel',
      state:
        tasksBlocked > 0
          ? `${tasksBlocked} ${tr('Alert', language)}`
          : tr('Corridors Clear', language),
      dot: tasksBlocked > 0 ? 'bg-[#DC2626]' : 'bg-[#16A34A]',
      accent:
        tasksBlocked > 0
          ? 'text-[#DC2626] dark:text-rose-400'
          : 'text-[#16A34A] dark:text-emerald-400',
    },
    {
      name: tr('Verification', language),
      role: 'Outcome Proof',
      state: `${activeMission?.completedCount || 0} ${tr('Verified', language)}`,
      dot: 'bg-[#16A34A]',
      accent: 'text-[#16A34A] dark:text-emerald-400',
    },
  ];

  const missionStages = [
    { label: tr('INPUT', language), status: tr('Ingested', language), dot: 'bg-[#DB2777]' },
    { label: tr('ANALYZE', language), status: tr('AI Parsed', language), dot: 'bg-[#7C3AED]' },
    {
      label: tr('PLAN', language),
      status: `DAG v${activeMission?.planVersion || 1}`,
      dot: 'bg-[#2563EB]',
    },
    {
      label: tr('EXECUTE', language),
      status: `${tasksExecuting} ${tr('Active', language)}`,
      dot: 'bg-[#16A34A]',
    },
    { label: tr('MONITOR', language), status: tr('TELEMETRY', language), dot: 'bg-[#06B6D4]' },
    {
      label: tr('ADAPT', language),
      status:
        (activeMission?.planVersion || 1) > 1
          ? tr('Rerouted', language)
          : tr('Standby', language),
      dot: (activeMission?.planVersion || 1) > 1 ? 'bg-[#EAB308]' : 'bg-slate-400',
    },
    {
      label: tr('VERIFY', language),
      status: `${progressPct}% ${tr('VERIFIED', language)}`,
      dot: 'bg-[#16A34A]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================================
          HERO COMMAND HEADER
      ===================================================================== */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-blue-400">
            <span>
              {greetingPrefix}, {operatorFirstName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 dark:text-slate-500">
              {tr('MISSION OPERATIONS CENTER', language)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            {t.dashboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('planner')}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200/90 dark:border-slate-800 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{t.dashboard.interactiveGraph}</span>
          </button>
          <button
            onClick={onLaunchNewMission}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t.dashboard.launchNew}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          PENDING HUMAN APPROVAL GATEWAY BANNER (IF ANY)
      ===================================================================== */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-50/95 dark:bg-amber-950/30 border border-amber-300/90 dark:border-amber-800/80 border-l-4 border-l-[#EAB308] rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-[#EAB308] text-slate-950 rounded-xl font-bold shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-amber-300">
                <span className="uppercase font-mono tracking-wider text-[10px] text-amber-800 dark:text-amber-400">
                  {tr('HUMAN-IN-THE-LOOP GATEWAY', language)}
                </span>
                <span>·</span>
                <span>{t.dashboard.humanApprovalReq}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-amber-100 mt-0.5">
                {pendingApprovals[0].action} — {t.approval.aiConfidence}{' '}
                <span className="font-mono font-bold">{pendingApprovals[0].aiConfidence}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => openApprovalModal(pendingApprovals[0])}
            className="px-4 py-2 bg-[#EAB308] hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t.dashboard.reviewAuthorize}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          PREMIUM KPI CARDS ROW (5 HIGH-IMPACT OPERATIONAL METRICS)
      ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: ACTIVE MISSIONS */}
        <div
          onClick={() => onNavigate('missions')}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-2xs hover:border-[#2563EB]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.metrics.activeMissions}
            </span>
            <Compass className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-950 dark:text-white font-mono tracking-tight">
            {String(activeMissionsCount).padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
            <span>
              {completedMissionsCount} {tr('Completed', language)}
            </span>
            <span className="text-[#2563EB] font-semibold">{tr('10 Domains', language)}</span>
          </div>
        </div>

        {/* KPI 2: TASKS EXECUTING */}
        <div
          onClick={() => onNavigate('execution')}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-2xs hover:border-[#2563EB]/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.metrics.tasksExecuting}
            </span>
            <Zap className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-extrabold text-[#2563EB] font-mono tracking-tight flex items-center gap-2">
            <span>{String(tasksExecuting).padStart(2, '0')}</span>
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
            <span>
              {t.planner.tasksTotal}: {tasks.length}
            </span>
            <span className="text-[#16A34A] font-semibold">
              {activeMission?.completedCount || 0} {tr('Done', language)}
            </span>
          </div>
        </div>

        {/* KPI 3: AI AGENTS ACTIVE */}
        <div
          onClick={() => onNavigate('agents')}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-2xs hover:border-[#7C3AED]/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.missionCard.activeAgents}
            </span>
            <Cpu className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-3xl font-extrabold text-[#7C3AED] font-mono tracking-tight">
            07
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
            <span>{tr('Multi-Agent Bus', language)}</span>
            <span className="text-[#7C3AED] font-semibold">{tr('Synced', language)}</span>
          </div>
        </div>

        {/* KPI 4: AT-RISK / GATED TASKS */}
        <div
          onClick={() => onNavigate('predictive')}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-2xs hover:border-[#EAB308]/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.metrics.tasksWaitingApproval}
            </span>
            <AlertTriangle className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div
            className={`text-3xl font-extrabold font-mono tracking-tight ${
              atRiskCount > 0 ? 'text-[#EAB308]' : 'text-[#16A34A]'
            }`}
          >
            {String(atRiskCount).padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
            <span>
              {tasksWaitingApproval} {tr('Approval Gate', language)}
            </span>
            <span className="text-[#DC2626] font-semibold">
              {tasksBlocked} {tr('Blocked', language)}
            </span>
          </div>
        </div>

        {/* KPI 5: MISSION HEALTH */}
        <div
          onClick={() => onNavigate('analytics')}
          className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-2xs hover:border-[#16A34A]/50 transition-all cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.metrics.systemHealth}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-extrabold text-[#16A34A] font-mono tracking-tight">
            {missionHealth}%
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
            <span>{tr('SLA Integrity', language)}</span>
            <span className="text-[#16A34A] font-semibold">{tr('Optimal', language)}</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DOMINANT ACTIVE MISSION COMMAND CARD
      ===================================================================== */}
      {activeMission ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
          {/* Top Accent Hairline */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#16A34A]" />

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-[#2563EB] font-bold uppercase tracking-wider">
                  {t.dashboard.activeMissionKicker}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 uppercase">
                  {t.domains[activeMission.category as keyof typeof t.domains] ||
                    activeMission.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-[#DC2626] uppercase">
                  {tr(activeMission.priority.toUpperCase(), language)} {t.missionCard.priority}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#7C3AED] font-bold">
                  {t.planner.version} v{activeMission.planVersion || 1}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {activeMission.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeMission.objective}
              </p>
            </div>

            {/* Right: Progress Ring & Primary CTAs */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="4.5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    {tr('MISSION HEALTH', language)}
                  </span>
                  <span className="text-lg font-extrabold text-slate-950 dark:text-white leading-none">
                    {progressPct}%
                  </span>
                  <span className="text-[10px] text-[#16A34A] font-semibold block mt-0.5">
                    ● {activeMission.completedCount}/{activeMission.tasksCount} {tr('TASKS', language)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('planner')}
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <span>{t.missionCard.viewMission}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('execution')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3 h-3 fill-current text-[#16A34A]" />
                  <span>{tr('Execution Console', language)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Segmented Progress Bar + Key Telemetry Strip */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-900 dark:text-white font-bold">
                  {activeMission.completedCount} / {activeMission.tasksCount} {tr('TASKS COMPLETED', language)}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[#7C3AED] font-semibold">7 {t.missionCard.activeAgents}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {resourceUtilizationAvg}% {tr('Allocated', language)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="font-bold">
                  {t.missionCard.eta}: {activeMission.eta}
                </span>
                <span>·</span>
                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="truncate max-w-[220px]">{activeMission.location}</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#16A34A] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Mission Stage Pipeline & Live Agent States */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {/* 7-Stage Pipeline */}
            <div className="lg:col-span-6 p-3.5 bg-slate-50/90 dark:bg-slate-900/70 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {tr('MISSION FLOW PIPELINE', language)}
                </span>
                <span className="text-[#2563EB] font-semibold">
                  {tr('DAG Dependency Connected', language)}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {missionStages.map((st) => (
                  <div
                    key={st.label}
                    className="p-1.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mx-auto block mb-1 ${st.dot}`} />
                    <span className="text-[9px] font-bold text-slate-900 dark:text-white block">
                      {st.label}
                    </span>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 block truncate">
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 Agent Telemetry Nodes */}
            <div className="lg:col-span-6 p-3.5 bg-slate-50/90 dark:bg-slate-900/70 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {tr('LIVE AGENT TELEMETRY STATES', language)}
                </span>
                <span className="text-[#16A34A] font-semibold">
                  {tr('● Sub-Second Sync', language)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono">
                {liveAgentStates.map((ag) => (
                  <div
                    key={ag.name}
                    onClick={() => onNavigate('agents')}
                    className="p-1.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-[#7C3AED]/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ag.dot}`} />
                      <span className={`text-[9px] font-bold ${ag.accent} truncate`}>
                        {ag.state}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {ag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disruption Simulation Quick Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <Radio className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>{tr('LIVE DISRUPTION & RE-PLANNING CONTROLS:', language)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  triggerDisruption('route_r2_blocked');
                  setSelectedPlanVersion(2);
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-[#DC2626] dark:text-rose-300 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.dashboard.injectR2}</span>
              </button>
              <button
                onClick={() => {
                  triggerDisruption('ambulance_reduced');
                  setSelectedPlanVersion(3);
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t.dashboard.injectFleet}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
            {t.metrics.activeMissions}: 0
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.dashboard.subtitle}
          </p>
          <button
            onClick={onLaunchNewMission}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {t.dashboard.launchNew}
          </button>
        </div>
      )}

      {/* =====================================================================
          TWO-COLUMN COMMAND GRID: LIVE OPERATIONS TIMELINE & RESOURCE TELEMETRY
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIVE OPERATIONS ACTIVITY TIMELINE (7 COLS) */}
        <div className="lg:col-span-7 p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse shadow-[0_0_8px_#16A34A]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.dashboard.auditEventsTitle}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {tr(
                    'Real-time autonomous agent actions, route detours, and task state transitions',
                    language
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-mono font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              {t.dashboard.fullLedger}
            </button>
          </div>

          <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {auditLogs.slice(0, 6).map((log, idx) => {
              const isAlert =
                log.action.toLowerCase().includes('fail') ||
                log.action.toLowerCase().includes('block') ||
                log.action.toLowerCase().includes('disruption');
              const isReplan =
                log.action.toLowerCase().includes('re-plan') ||
                log.action.toLowerCase().includes('plan v');
              const dotColor = isAlert
                ? 'bg-[#DC2626]'
                : isReplan
                ? 'bg-[#7C3AED]'
                : idx === 0
                ? 'bg-[#16A34A]'
                : 'bg-[#2563EB]';

              return (
                <div
                  key={log.id}
                  className="relative p-3 bg-slate-50/80 dark:bg-slate-900/70 rounded-xl border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${dotColor} absolute -left-[17px] top-4 ring-4 ring-white dark:ring-[#111827]`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="font-semibold text-[#7C3AED] dark:text-purple-400">
                        {tr(log.agent, language)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {log.missionId}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {log.action}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 line-clamp-1">
                    {log.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESOURCE UTILIZATION & ACTIVE TASKS SNAPSHOT (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resource Strain Card */}
          <div className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.dashboard.resourceStrainTitle}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('resources')}
                className="text-xs font-mono font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                {t.dashboard.viewAllResources}
              </button>
            </div>

            <div className="space-y-3.5">
              {resources.slice(0, 5).map((res) => {
                const pct = Math.round((res.inUse / Math.max(1, res.total)) * 100);
                return (
                  <div key={res.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{res.inUse}</strong> /{' '}
                        {res.total} {res.unit} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 85
                            ? 'bg-[#DC2626]'
                            : pct > 70
                            ? 'bg-[#EAB308]'
                            : 'bg-[#2563EB]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Executing Tasks Card */}
          <div className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {tr('ACTIVE TASK EXECUTION QUEUE', language)}
              </span>
              <button
                onClick={() => onNavigate('execution')}
                className="text-xs font-mono font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                {tr('Inspect All →', language)}
              </button>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 4).map((tk) => (
                <div
                  key={tk.id}
                  onClick={() => onNavigate('execution')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-[#2563EB]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-[#2563EB]">{tk.id}</span>
                      <span className="font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {tk.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {tr(tk.assignedAgent, language)} · {tk.requiredResource || 'Field Unit'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase shrink-0 ${
                      tk.status === 'completed' || tk.status === 'verified'
                        ? 'text-[#16A34A]'
                        : tk.status === 'in_progress'
                        ? 'text-[#2563EB]'
                        : tk.status === 'waiting_approval'
                        ? 'text-[#EAB308]'
                        : 'text-slate-500'
                    }`}
                  >
                    ● {t.status[tk.status as keyof typeof t.status] || tk.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
