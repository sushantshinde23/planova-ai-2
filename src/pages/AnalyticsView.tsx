import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import {
  BarChart3,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Cpu,
  Layers,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { analytics } = useMission();
  const [activeTab, setActiveTab] = useState<'mission' | 'agent' | 'resource' | 'replan'>('mission');

  const agentPerformance = [
    { name: 'Mission Analyst Agent', speed: '1.2s', tasks: 142, success: '99.4%', status: 'Optimal' },
    { name: 'Planning Agent', speed: '3.4s', tasks: 320, success: '98.8%', status: 'Optimal' },
    { name: 'Tool Orchestrator Agent', speed: '0.8s', tasks: 890, success: '99.9%', status: 'Optimal' },
    { name: 'Execution Agent', speed: '12.1m', tasks: 1240, success: '96.2%', status: 'Normal' },
    { name: 'Monitoring Agent', speed: '0.2s', tasks: 4200, success: '99.9%', status: 'Optimal' },
    { name: 'Replanning Agent', speed: '1.8s', tasks: 44, success: '97.4%', status: 'Optimal' },
    { name: 'Verification Agent', speed: '4.1s', tasks: 210, success: '99.1%', status: 'Optimal' },
  ];

  const replanningReasons = [
    { reason: 'Corridor / Bridge Submerged (Hydrological Flash)', count: 6, pct: 43 },
    { reason: 'Resource / Vehicle Allocation Drawdown', count: 4, pct: 28 },
    { reason: 'Triage Hospital Capacity Redirection', count: 3, pct: 21 },
    { reason: 'Severe Weather / Cloudburst Front', count: 1, pct: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>MISSION PERFORMANCE & AGENTIC BENCHMARKS</span>
          <span aria-hidden="true">·</span>
          <span>EMPIRICAL AUDIT METRICS</span>
        </div>
        <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
          System Analytics & Execution Telemetry
        </h1>
        <p className="text-xs text-zinc-500 max-w-2xl mt-1">
          Historical analysis of mission throughput, average autonomous re-plan latency, agent tool reliability, and human operator response times.
        </p>
      </div>

      {/* Top 6 KPI Cards (Requirement 27) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Mission Success</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {analytics?.missionCompletionRate || 98.4}%
          </span>
          <span className="text-[10px] text-zinc-500">Target &gt; 95%</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Task Completion</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">
            {analytics?.taskCompletionRate || 96.2}%
          </span>
          <span className="text-[10px] text-zinc-500">1,240 resolved</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Avg Replan Latency</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block mt-0.5">
            {analytics?.avgReplanningLatencySeconds || 1.8}s
          </span>
          <span className="text-[10px] text-zinc-500">Sub-2s synthesis</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Tool Success Rate</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {analytics?.toolSuccessRate || 99.4}%
          </span>
          <span className="text-[10px] text-zinc-500">Zero unhandled crashes</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Human Operator SLA</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-0.5">
            {analytics?.humanApprovalResponseMinutes || 3.2}m
          </span>
          <span className="text-[10px] text-zinc-500">High-impact signoff</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase block">Replanning Events</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white block mt-0.5">
            {analytics?.totalReplanningEvents || 14}
          </span>
          <span className="text-[10px] text-zinc-500">Self-healed adaptively</span>
        </div>
      </div>

      {/* Analytics Tabs (Requirement 27) */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono overflow-x-auto">
        {[
          { id: 'mission', label: 'Mission Performance' },
          { id: 'agent', label: 'Agent Performance' },
          { id: 'resource', label: 'Resource Efficiency' },
          { id: 'replan', label: 'Replanning Root-Cause Analysis' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Mission Performance */}
      {activeTab === 'mission' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Throughput by Operational Domain (Last 30 Days)
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                { domain: 'Emergency & Flood Response', count: 18, pct: 98 },
                { domain: 'Healthcare Administration', count: 24, pct: 95 },
                { domain: 'Disaster Relief Corridors', count: 12, pct: 100 },
                { domain: 'Farmer Assistance Schemes', count: 32, pct: 96 },
                { domain: 'Logistics Cold-Chain Transport', count: 28, pct: 99 },
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{row.domain}</span>
                    <span className="text-zinc-500">{row.count} missions ({row.pct}%)</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-900 dark:bg-white h-full rounded-full" style={{ width: `${row.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Mission Risk Distribution
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold block">LOW RISK</span>
                <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1 block">42%</span>
                <span className="text-[10px] text-zinc-500">Autonomous pass</span>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="text-blue-700 dark:text-blue-400 font-bold block">MEDIUM RISK</span>
                <span className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1 block">34%</span>
                <span className="text-[10px] text-zinc-500">Advisory telemetry</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                <span className="text-amber-700 dark:text-amber-400 font-bold block">HIGH RISK</span>
                <span className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1 block">18%</span>
                <span className="text-[10px] text-zinc-500">Configurable hold</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900">
                <span className="text-rose-700 dark:text-rose-400 font-bold block">CRITICAL RISK</span>
                <span className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1 block">6%</span>
                <span className="text-[10px] text-zinc-500">Human signoff mandatory</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Agent Performance */}
      {activeTab === 'agent' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Autonomous Agent Sub-System Metrics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Agent Specialized Role</th>
                  <th className="p-3">Avg Latency</th>
                  <th className="p-3">Tasks Handled</th>
                  <th className="p-3">Reliability</th>
                  <th className="p-3">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {agentPerformance.map((ag, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{ag.name}</td>
                    <td className="p-3 text-zinc-500">{ag.speed}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{ag.tasks}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{ag.success}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold">
                        {ag.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Resource Efficiency */}
      {activeTab === 'resource' && (
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Resource Echelon Efficiency & Bottlenecks
          </h3>
          <p className="text-xs text-zinc-500">
            Average utilization rates across heavy vehicles, medical beds, and specialized search-and-rescue gear.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 text-[10px] uppercase block">Ambulance Fleet Utilization</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white block mt-1">94.2%</span>
              <span className="text-amber-600 text-[11px] mt-1 block">Near capacity threshold</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 text-[10px] uppercase block">Shelter Bed Clearance</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1">74.5%</span>
              <span className="text-emerald-600 text-[11px] mt-1 block">1,110 slots remaining</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 text-[10px] uppercase block">Medical Oxygen Buffer</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block mt-1">68.0%</span>
              <span className="text-blue-600 text-[11px] mt-1 block">54 hours autonomy</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Replanning Root Cause Analysis */}
      {activeTab === 'replan' && (
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 font-mono text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Replanning Trigger Root-Cause Decomposition
          </h3>
          <div className="space-y-3">
            {replanningReasons.map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{r.reason}</span>
                  <span className="text-zinc-500">{r.count} incidents ({r.pct}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${r.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
