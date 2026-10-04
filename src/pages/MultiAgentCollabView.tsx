import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import {
  Bot,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Activity,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Wrench,
  Send,
  Network,
} from 'lucide-react';

export const MultiAgentCollabView: React.FC = () => {
  const { activeMission, tasks, triggerDisruption, createTask } = useMission();
  const [selectedAgent, setSelectedAgent] = useState<string>('Planning Agent');
  const [directiveText, setDirectiveText] = useState<string>('');
  const [sendingDirective, setSendingDirective] = useState<boolean>(false);
  const [liveBusMessages, setLiveBusMessages] = useState<
    Array<{
      id: string;
      from: string;
      to: string;
      timestamp: string;
      intent: string;
      payload: string;
      confidence: number;
    }>
  >([
    {
      id: 'msg-1',
      from: 'Monitoring Agent',
      to: 'Replanning Agent',
      timestamp: '14:04:01.220',
      intent: 'HAZARD_INTERRUPT',
      payload:
        'Hydrological sensor S-402 reports 0.92m water depth on Causeway Route R2. Halting Task T-09.',
      confidence: 99.8,
    },
    {
      id: 'msg-2',
      from: 'Replanning Agent',
      to: 'Resource Agent',
      timestamp: '14:04:01.850',
      intent: 'QUERY_RESERVE_CAPACITY',
      payload:
        'Requesting clearance and fuel autonomy verification for 8 ALS ambulances along Elevated Bypass R4 (+9km).',
      confidence: 96.4,
    },
    {
      id: 'msg-3',
      from: 'Resource Agent',
      to: 'Planning Agent',
      timestamp: '14:04:02.410',
      intent: 'ALLOCATION_CONFIRMED',
      payload:
        'Confirmed: All 8 ALS units hold >78% diesel reserve. Municipal Bus Depot 4 standing by with 6 reserve shuttles.',
      confidence: 98.1,
    },
    {
      id: 'msg-4',
      from: 'Planning Agent',
      to: 'Execution Agent',
      timestamp: '14:04:03.110',
      intent: 'SYNTHESIZE_DAG_V2',
      payload:
        'Committed Plan v2. Rerouting Task T-09 via Bypass R4. Escalating to Human-in-the-Loop Gate.',
      confidence: 94.6,
    },
    {
      id: 'msg-5',
      from: 'Verification Agent',
      to: 'Mission Analyst Agent',
      timestamp: '14:05:19.004',
      intent: 'BIOMETRIC_AUDIT_SYNC',
      payload:
        'Shelter 1 intake tally verified: 412 citizens registered against Ward 12 census roll.',
      confidence: 99.9,
    },
  ]);

  const handleBroadcastDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveText.trim()) return;
    setSendingDirective(true);
    try {
      const nowStr = new Date().toTimeString().split(' ')[0] + '.410';
      setLiveBusMessages((prev) => [
        {
          id: `msg-${Date.now()}`,
          from: 'Human Command Operator',
          to: selectedAgent,
          timestamp: nowStr,
          intent: 'OPERATOR_DIRECTIVE_OVERRIDE',
          payload: directiveText.trim(),
          confidence: 100,
        },
        ...prev,
      ]);
      await createTask({
        title: `[Agent Directive] ${directiveText.trim().slice(0, 48)}`,
        description: directiveText.trim(),
        assignedAgent: selectedAgent as any,
        status: 'in_progress',
        priority: 'high',
      });
      setDirectiveText('');
    } finally {
      setSendingDirective(false);
    }
  };

  const agents = [
    {
      name: 'Mission Analyst Agent',
      role: 'Goal Ingestion & Constraint Extraction',
      status: 'ACTIVE',
      dot: 'bg-[#DB2777]',
      accent: 'text-[#DB2777] dark:text-pink-400',
      currentTask: `Monitoring scope for ${activeMission?.title || 'Active Mission'}`,
      tools: ['Census Demographics DB', 'Satellite Flood Telemetry'],
      decisionsCount: 14,
      latency: '140ms',
    },
    {
      name: 'Planning Agent',
      role: 'DAG Decomposition & Critical Path',
      status: 'ACTIVE',
      dot: 'bg-[#7C3AED]',
      accent: 'text-[#7C3AED] dark:text-purple-400',
      currentTask: `Maintaining ${tasks.length}-Node Dependency Graph (Plan v${activeMission?.planVersion || 2})`,
      tools: ['GIS Route Optimizer', 'DAG Solver Engine'],
      decisionsCount: 28,
      latency: '210ms',
    },
    {
      name: 'Resource Agent',
      role: 'Fleet & Shelter Capacity Balancing',
      status: 'ACTIVE',
      dot: 'bg-cyan-500',
      accent: 'text-cyan-600 dark:text-cyan-400',
      currentTask: 'Balancing 8 ALS Ambulances & 3 Shelter Intake Queues',
      tools: ['Fleet GPS Tracker', 'Hospital ICU Registry'],
      decisionsCount: 39,
      latency: '95ms',
    },
    {
      name: 'Execution Agent',
      role: 'Tool Invocation & Field Dispatch',
      status: 'EXECUTING',
      dot: 'bg-[#2563EB]',
      accent: 'text-[#2563EB] dark:text-blue-400',
      currentTask: `Executing ${tasks.filter((tk) => tk.status === 'in_progress').length} active field tasks`,
      tools: ['Emergency Broadcast API', 'Convoy Telemetry Bus'],
      decisionsCount: 64,
      latency: '115ms',
    },
    {
      name: 'Monitoring Agent',
      role: 'Real-Time Anomaly & Hazard Detection',
      status: 'WATCHING',
      dot: 'bg-[#EAB308]',
      accent: 'text-amber-600 dark:text-amber-400',
      currentTask: 'Polling River Gauge S-402 & Highway R1/R4 Traffic Radar',
      tools: ['IMD Weather Radar', 'IoT Bridge Sensors'],
      decisionsCount: 412,
      latency: '45ms',
    },
    {
      name: 'Replanning Agent',
      role: 'Dynamic Detour & Recovery Synthesis',
      status: 'STANDBY',
      dot: 'bg-[#7C3AED]',
      accent: 'text-[#7C3AED] dark:text-purple-400',
      currentTask: 'Evaluated 3 candidate detours; selected Bypass R4 (+15m)',
      tools: ['Counterfactual Simulator', 'Risk Scoring Kernel'],
      decisionsCount: 6,
      latency: '310ms',
    },
    {
      name: 'Verification Agent',
      role: 'Outcome Proof & Audit Cryptographer',
      status: 'VERIFIED',
      dot: 'bg-[#16A34A]',
      accent: 'text-[#16A34A] dark:text-emerald-400',
      currentTask: `Verified ${activeMission?.completedCount || 0}/${tasks.length} completed tasks`,
      tools: ['Shelter Check-in Scanner', 'Immutable Ledger Signer'],
      decisionsCount: 19,
      latency: '85ms',
    },
  ];

  const handoffChain = [
    { name: 'Planner Agent', role: 'DAG Plan v2', color: 'border-[#7C3AED] text-[#7C3AED]' },
    { name: 'Route & Resource Agent', role: 'Corridor R4 Allocation', color: 'border-cyan-500 text-cyan-500' },
    { name: 'Execution Agent', role: 'Field Dispatch', color: 'border-[#2563EB] text-[#2563EB]' },
    { name: 'Monitoring Agent', role: 'Telemetry Watch', color: 'border-[#EAB308] text-[#EAB308]' },
    { name: 'Verification Agent', role: 'Outcome Proof', color: 'border-[#16A34A] text-[#16A34A]' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#7C3AED]">
            <span>AUTONOMOUS SWARM ORCHESTRATION</span>
            <span aria-hidden="true">·</span>
            <span>7 SPECIALIZED AGENTS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            Multi-Agent Collaboration & Handoff Bus
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Inspect how specialized agents negotiate constraints, share telemetry, and coordinate autonomous re-planning.
          </p>
        </div>

        <button
          onClick={() => triggerDisruption('route_r2_blocked')}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Simulate Multi-Agent Negotiation</span>
        </button>
      </div>

      {/* =====================================================================
          VISUAL AGENT-TO-AGENT COMMUNICATION TOPOLOGY (SECTION 15)
      ===================================================================== */}
      <div className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-[#7C3AED]" />
            <span>AGENT-TO-AGENT COMMUNICATION PIPELINE</span>
          </span>
          <span className="text-[#16A34A] font-semibold">● Sub-Second Message Passing</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {handoffChain.map((node, idx) => (
            <React.Fragment key={node.name}>
              <div className="flex-1 min-w-[150px] p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center font-mono">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  ✦ {node.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{node.role}</div>
              </div>
              {idx < handoffChain.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#7C3AED] shrink-0 hidden md:block animate-pulse" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Operator Directive Broadcast Form */}
      <form
        onSubmit={handleBroadcastDirective}
        className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3 text-xs shadow-2xs"
      >
        <span className="font-mono font-bold text-[#7C3AED] uppercase text-[11px]">
          Operator → Agent Bus:
        </span>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
        >
          {agents.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          value={directiveText}
          onChange={(e) => setDirectiveText(e.target.value)}
          placeholder={`Issue direct command to ${selectedAgent}...`}
          className="flex-1 min-w-[220px] px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
        />
        <button
          type="submit"
          disabled={sendingDirective}
          className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{sendingDirective ? 'Dispatching...' : 'Send Directive'}</span>
        </button>
      </form>

      {/* =====================================================================
          AGENT ROSTER CARDS & INTER-AGENT MESSAGE STREAM
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7 Specialized Agent Cards (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agents.map((ag) => {
            const isSelected = selectedAgent === ag.name;
            return (
              <div
                key={ag.name}
                onClick={() => setSelectedAgent(ag.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white dark:bg-[#111827] border-[#7C3AED] ring-1 ring-[#7C3AED]/30 shadow-md'
                    : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800 hover:border-[#7C3AED]/50 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                      <span className="text-[#7C3AED]">✦</span>
                      {ag.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">{ag.latency}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                    <span className={`w-2 h-2 rounded-full ${ag.dot} animate-pulse`} />
                    <span className={ag.accent}>{ag.status}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 font-normal truncate">{ag.role}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Current Action:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {ag.currentTask}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{ag.tools[0]}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {ag.decisionsCount} ops
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inter-Agent Protocol Message Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  INTER-AGENT PROTOCOL STREAM
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">● LIVE BUS</span>
            </div>

            <div className="space-y-3 font-mono text-xs max-h-[540px] overflow-y-auto pr-1">
              {liveBusMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-white font-bold">
                      <span className="text-purple-400">{msg.from}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300">{msg.to}</span>
                    </div>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-bold">
                      [{msg.intent}]
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      Conf: {msg.confidence}%
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                    {msg.payload}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Zero message drops</span>
            <span className="text-emerald-400">Consensus Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
