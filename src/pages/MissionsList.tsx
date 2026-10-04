import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { Mission, MissionCategory } from '../types';
import {
  FolderGit2,
  Search,
  ArrowRight,
  Flame,
  Shield,
  Wheat,
  Building,
  HeartPulse,
  Car,
  Package,
  Wrench,
  GraduationCap,
  Briefcase,
  Trash2,
  X,
  Cpu,
  Play,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';

export const MissionsList: React.FC<{
  onSelectMission: (id: string) => void;
  onLaunchNew: () => void;
}> = ({ onSelectMission, onLaunchNew }) => {
  const {
    missions,
    activeMissionId,
    setActiveMissionId,
    tasks,
    plans,
    deleteMission,
    t,
  } = useMission();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inspectedMissionId, setInspectedMissionId] = useState<string | null>(null);

  const filteredMissions = missions.filter((m) => {
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const inspectedMission: Mission | undefined = missions.find(
    (m) => m.id === inspectedMissionId
  );

  const handleDeleteMission = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteMission(id);
      if (inspectedMissionId === id) {
        setInspectedMissionId(null);
      }
    } catch {
      // handled by context
    } finally {
      setDeletingId(null);
    }
  };

  const handleInspectMission = (e: React.MouseEvent, mission: Mission) => {
    e.stopPropagation();
    setActiveMissionId(mission.id);
    setInspectedMissionId(mission.id);
  };

  const getDomainIcon = (cat: MissionCategory) => {
    switch (cat) {
      case 'emergency':
        return <Flame className="w-4 h-4 text-[#DC2626]" />;
      case 'disaster':
        return <Shield className="w-4 h-4 text-[#EAB308]" />;
      case 'agriculture':
        return <Wheat className="w-4 h-4 text-[#16A34A]" />;
      case 'government':
        return <Building className="w-4 h-4 text-[#2563EB]" />;
      case 'healthcare':
        return <HeartPulse className="w-4 h-4 text-[#DB2777]" />;
      case 'accident':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'logistics':
        return <Package className="w-4 h-4 text-cyan-500" />;
      case 'industrial':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'career':
        return <GraduationCap className="w-4 h-4 text-[#7C3AED]" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-[#7C3AED]" />;
      default:
        return <FolderGit2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getDomainLabel = (cat: MissionCategory) => {
    return t.domains[cat] || cat;
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          dot: 'bg-[#DC2626] shadow-[0_0_6px_#DC2626]',
          text: 'text-[#DC2626] dark:text-rose-400',
          label: 'CRITICAL',
        };
      case 'high':
        return {
          dot: 'bg-[#EAB308]',
          text: 'text-amber-700 dark:text-amber-400',
          label: 'HIGH',
        };
      default:
        return {
          dot: 'bg-[#2563EB]',
          text: 'text-[#2563EB] dark:text-blue-400',
          label: priority.toUpperCase(),
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Inspect Mission Plan Drawer */}
      {inspectedMission && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          onClick={() => setInspectedMissionId(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#111827] h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="font-bold text-[#2563EB]">{inspectedMission.id}</span>
                    <span>·</span>
                    <span className="uppercase">{getDomainLabel(inspectedMission.category)}</span>
                    <span>·</span>
                    <span className="text-[#7C3AED] font-bold">
                      Plan v{inspectedMission.planVersion}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">
                    {inspectedMission.title}
                  </h2>
                </div>
                <button
                  onClick={() => setInspectedMissionId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Objective */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  MISSION OBJECTIVE
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {inspectedMission.objective}
                </p>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Health</span>
                  <span className="font-bold text-[#16A34A] text-sm">
                    {Math.max(82, inspectedMission.progress)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Tasks</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {inspectedMission.completedCount} / {inspectedMission.tasksCount}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">ETA</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {inspectedMission.eta}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Priority</span>
                  <span className="font-bold text-[#DC2626] uppercase text-sm">
                    {inspectedMission.priority}
                  </span>
                </div>
              </div>

              {/* AI Understanding */}
              {inspectedMission.aiUnderstanding && (
                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#7C3AED] uppercase text-[10px] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      AI Analyst Synthesis
                    </span>
                    <span className="text-[10px] font-bold text-[#16A34A]">
                      {inspectedMission.aiUnderstanding.confidenceScore}% Confidence
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {inspectedMission.aiUnderstanding.explanation}
                  </p>
                </div>
              )}

              {/* Active Mission Tasks List Preview */}
              {activeMissionId === inspectedMission.id && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Mission DAG Tasks ({tasks.length} Nodes)
                    </span>
                    <span className="text-[10px] font-mono text-[#2563EB]">
                      {plans.length} Plan Version(s)
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {tasks.map((tk) => (
                      <div
                        key={tk.id}
                        className="p-2.5 flex items-center justify-between gap-2 text-xs font-mono"
                      >
                        <div className="truncate">
                          <span className="font-bold text-[#2563EB] mr-2">{tk.id}</span>
                          <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">
                            {tk.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold shrink-0 ${
                            tk.status === 'completed' || tk.status === 'verified'
                              ? 'text-[#16A34A]'
                              : tk.status === 'in_progress'
                              ? 'text-[#2563EB]'
                              : tk.status === 'waiting_approval'
                              ? 'text-[#EAB308]'
                              : 'text-slate-500'
                          }`}
                        >
                          ● {tk.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectedMissionId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMissionId(inspectedMission.id);
                  setInspectedMissionId(null);
                  onSelectMission(inspectedMission.id);
                }}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open Interactive Mission Planner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            <span>{t.missionsList.kicker}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            {t.missionsList.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            {t.missionsList.subtitle}
          </p>
        </div>

        <button
          onClick={onLaunchNew}
          className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{t.dashboard.launchNew}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.missionsList.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/30 w-72"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono capitalize cursor-pointer focus:outline-hidden"
          >
            <option value="all">{t.missionsList.allDomains}</option>
            <option value="emergency">{t.domains.emergency}</option>
            <option value="disaster">{t.domains.disaster}</option>
            <option value="agriculture">{t.domains.agriculture}</option>
            <option value="government">{t.domains.government}</option>
            <option value="healthcare">{t.domains.healthcare}</option>
            <option value="accident">{t.domains.accident}</option>
            <option value="logistics">{t.domains.logistics}</option>
            <option value="industrial">{t.domains.industrial}</option>
            <option value="career">{t.domains.career}</option>
            <option value="project">{t.domains.project}</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500 font-semibold">
          {filteredMissions.length} {t.missionsList.missionsLoaded}
        </span>
      </div>

      {/* Mission Cards Grid (Redesigned per Section 9 specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMissions.map((mission) => {
          const isComplete = mission.status === 'completed';
          const isActive = mission.id === activeMissionId;
          const isDeleting = deletingId === mission.id;
          const prio = getPriorityIndicator(mission.priority);
          const healthScore = Math.max(78, Math.min(100, mission.progress + 18));

          return (
            <div
              key={mission.id}
              onClick={() => {
                setActiveMissionId(mission.id);
                onSelectMission(mission.id);
              }}
              className={`p-5 bg-white dark:bg-[#111827] border rounded-2xl transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between space-y-4 group ${
                isActive
                  ? 'border-[#2563EB] ring-1 ring-[#2563EB]/30 shadow-xs'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-[#2563EB]/60'
              }`}
            >
              <div className="space-y-3">
                {/* Top Kicker Row: Priority + Domain + Delete */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span className={`w-2 h-2 rounded-full ${prio.dot}`} />
                    <span className={prio.text}>{prio.label}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {getDomainIcon(mission.category)}
                      {getDomainLabel(mission.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="text-[10px] font-mono font-bold text-[#2563EB] dark:text-blue-400 uppercase">
                        ● ACTIVE COMMAND
                      </span>
                    )}
                    {mission.id !== 'mission-flood-evac-01' && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => handleDeleteMission(e, mission.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Mission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Objective */}
                <div>
                  <h2 className="text-base font-extrabold text-slate-950 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {mission.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {mission.objective}
                  </p>
                </div>

                {/* Mission Health & Progress Bar */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Mission Health & Completion
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#16A34A] font-bold">{healthScore}% Health</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {mission.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-[#16A34A]' : 'bg-[#2563EB]'
                      }`}
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {/* 3-Column Metrics Row: TASKS | AGENTS | ETA */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">TASKS</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {mission.completedCount}/{mission.tasksCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">AGENTS</span>
                    <span className="font-bold text-[#7C3AED] dark:text-purple-400">
                      6 ACTIVE
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">ETA</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {mission.eta}
                    </span>
                  </div>
                </div>

                {/* Bottom Status & Inspect Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isComplete ? 'bg-[#16A34A]' : 'bg-[#2563EB] animate-pulse'
                      }`}
                    />
                    <span
                      className={`font-bold uppercase text-[11px] ${
                        isComplete
                          ? 'text-[#16A34A]'
                          : 'text-[#2563EB] dark:text-blue-400'
                      }`}
                    >
                      {isComplete ? t.status.completed : t.status.executing}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-[11px] text-slate-400">
                      Plan v{mission.planVersion}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleInspectMission(e, mission)}
                      className="text-[11px] font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      PREVIEW
                    </button>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                      <span>INSPECT</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
