import React, { useState, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { ThemeToggle, LanguageSelector } from '../components/ThemeAndLanguageControls';
import {
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  FileCheck,
  Play,
  Flame,
  Wheat,
  Building,
  HeartPulse,
  Package,
  Wrench,
  Compass,
  Lock,
  GitBranch,
  Sliders,
  Network,
  Eye,
  RefreshCw,
  UserCheck,
  Terminal,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';

export interface LandingPageProps {
  onLaunchMission: () => void;
  onEnterDashboard: () => void;
  onRunDemo: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchMission,
  onEnterDashboard,
  onRunDemo,
  onSignIn,
  onSignUp,
}) => {
  const { isAuthenticated, currentUser } = useMission();
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Subtle animated cycle for Goal -> Plan -> Execute -> Monitor -> Adapt -> Verify
  const heroFlowSteps = [
    {
      id: 'goal',
      label: 'Goal',
      detail: 'Evacuate 4,200 citizens across Sector 4 Flood Plain within 6 hours',
      metric: 'Objective Ingested',
    },
    {
      id: 'plan',
      label: 'Plan',
      detail: 'Synthesized 24-node dependency graph with 8 ALS ambulances & 3 shelters',
      metric: 'DAG Plan v1 Ready',
    },
    {
      id: 'execute',
      label: 'Execute',
      detail: 'Dispatched multi-agent tool calls across GIS routing & medical registries',
      metric: '6 Convoys Active',
    },
    {
      id: 'monitor',
      label: 'Monitor',
      detail: 'Sub-second telemetry sweep detects 0.92m flood crest on Causeway Route R2',
      metric: 'Anomaly Detected',
    },
    {
      id: 'adapt',
      label: 'Adapt',
      detail: 'Autonomous Re-Planning Engine reroutes fleet via Elevated Bypass R4',
      metric: 'Plan v2 Approved',
    },
    {
      id: 'verify',
      label: 'Verify',
      detail: 'Biometric shelter tally & hospital intake confirmed with cryptographic audit',
      metric: '100% Outcome Verified',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % heroFlowSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [heroFlowSteps.length]);

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Understand',
      desc: 'Parse complex operational goals, environmental constraints, and multi-source documents into structured mission parameters.',
      icon: Compass,
    },
    {
      step: '02',
      title: 'Plan',
      desc: 'Decompose objectives into a prioritized task dependency graph with critical paths and resource assignments.',
      icon: GitBranch,
    },
    {
      step: '03',
      title: 'Execute',
      desc: 'Orchestrate specialized AI agents and external APIs to dispatch tasks across field teams and automated systems.',
      icon: Zap,
    },
    {
      step: '04',
      title: 'Monitor',
      desc: 'Track real-time execution states, geospatial telemetry, weather alerts, and predictive failure indicators.',
      icon: Eye,
    },
    {
      step: '05',
      title: 'Adapt',
      desc: 'Automatically calculate downstream cascade impacts when disruptions occur and generate versioned re-plans.',
      icon: RefreshCw,
    },
    {
      step: '06',
      title: 'Verify',
      desc: 'Validate real-world completion against ground-truth evidence before sealing the immutable mission audit ledger.',
      icon: FileCheck,
    },
  ];

  const coreCapabilities = [
    {
      title: 'Autonomous Mission Planning',
      desc: 'Converts high-level goals into structured Directed Acyclic Graphs (DAGs) with clear task dependencies and milestones.',
      icon: GitBranch,
    },
    {
      title: 'Multi-Agent Execution',
      desc: 'Coordinates Planning, Execution, Monitoring, Resource, and Verification agents over a unified orchestration bus.',
      icon: Network,
    },
    {
      title: 'Real-Time Monitoring',
      desc: 'Maintains a live Mission Digital Twin tracking active tasks, routes, field assets, and environmental sensors.',
      icon: Activity,
    },
    {
      title: 'Dynamic Resource Allocation',
      desc: 'Automatically assigns and reallocates vehicles, personnel, equipment, and budget as operational demands shift.',
      icon: Layers,
    },
    {
      title: 'Automatic Re-Planning',
      desc: 'Detects route blockages, delays, or asset shortages and synthesizes updated Plan v2/v3 revisions in seconds.',
      icon: RefreshCw,
    },
    {
      title: 'Human-in-the-Loop Approval',
      desc: 'Enforces risk-based governance gates so critical or high-impact actions require explicit operator authorization.',
      icon: UserCheck,
    },
    {
      title: 'What-If Simulation',
      desc: 'Tests hypothetical disruptions and resource constraints prior to execution to evaluate impact and readiness.',
      icon: Sliders,
    },
    {
      title: 'Outcome Verification',
      desc: 'Confirms mission success using multi-source evidence and generates tamper-evident operational audit records.',
      icon: CheckCircle2,
    },
  ];

  const missionDomains = [
    {
      name: 'Emergency Response',
      icon: Flame,
      scenario: 'Multi-sector flood evacuation, ambulance routing, and emergency shelter triage coordination.',
      metrics: 'Sub-2s Re-Planning · Zero-Casualty Routing',
    },
    {
      name: 'Disaster Relief',
      icon: Shield,
      scenario: 'Post-seismic aerial supply corridors, structural hazard mapping, and relief camp distribution.',
      metrics: 'Dynamic Asset Reallocation · Live GIS Twin',
    },
    {
      name: 'Agriculture',
      icon: Wheat,
      scenario: 'Satellite crop stress analysis, irrigation grid scheduling, and automated farmer relief dispatch.',
      metrics: 'Multi-Agent Telemetry · Verified Yield Audit',
    },
    {
      name: 'Government Services',
      icon: Building,
      scenario: 'Cross-departmental infrastructure programs, public works execution, and citizen service delivery.',
      metrics: 'Human Governance Gates · Full Audit Trail',
    },
    {
      name: 'Healthcare Administration',
      icon: HeartPulse,
      scenario: 'Regional ICU bed balancing, critical oxygen supply-chain routing, and trauma team mobilization.',
      metrics: 'Predictive Bottleneck Alerts · HIPAA-Grade Logs',
    },
    {
      name: 'Logistics & Supply Chain',
      icon: Package,
      scenario: 'Cold-chain pharmaceutical transit, port congestion rerouting, and fleet fuel/time optimization.',
      metrics: 'Event-Driven Detours · SLA Verification',
    },
    {
      name: 'Industrial Operations',
      icon: Wrench,
      scenario: 'Grid load-shedding prevention, refinery turnaround maintenance, and safety containment protocols.',
      metrics: 'Dependency Graph Control · Risk Scoring',
    },
  ];

  const whyPlanovaItems = [
    {
      title: 'Goal-to-Execution',
      traditional: 'Outputs static text advice that operators must manually translate into tasks.',
      planova: 'Decomposes goals directly into executable task graphs connected to live operational tools.',
    },
    {
      title: 'Real-Time Adaptation',
      traditional: 'Plans become obsolete the moment a road closes or a vehicle breaks down.',
      planova: 'Detects disruptions immediately, analyzes downstream impact, and generates Plan v2/v3.',
    },
    {
      title: 'Multi-Agent Collaboration',
      traditional: 'Single-prompt chatbot with no separation between planning, monitoring, and verification.',
      planova: 'Five specialized agents collaborate with structured handoffs and explainable reasoning.',
    },
    {
      title: 'Resource Intelligence',
      traditional: 'No awareness of fleet capacity, personnel fatigue, or budget burn rates.',
      planova: 'Continuously tracks and reallocates vehicles, personnel, equipment, and time.',
    },
    {
      title: 'Human-Controlled Critical Actions',
      traditional: 'Either fully manual or unguarded automation without risk boundaries.',
      planova: 'Automates low-risk tasks while pausing at HIGH and CRITICAL gates for operator approval.',
    },
    {
      title: 'Verified Outcomes',
      traditional: 'Assumes success as soon as a command is sent.',
      planova: 'Requires cryptographic and multi-source evidence verification before closing a mission.',
    },
  ];

  const techPills = [
    { label: 'Agentic AI', detail: '5-Agent Orchestration Kernel' },
    { label: 'LLM', detail: 'Gemini Multi-Modal Reasoning' },
    { label: 'RAG', detail: 'Grounded Operational Registries' },
    { label: 'Structured Tool Calling', detail: 'Deterministic Schema Execution' },
    { label: 'APIs', detail: 'Geospatial, Weather & Fleet Gateways' },
    { label: 'Real-Time Intelligence', detail: 'Sub-Second Digital Twin Sync' },
  ];

  const governanceTiers = [
    {
      level: 'LOW RISK',
      mode: 'Automatic Execution',
      desc: 'Routine telemetry polling, weather sweeps, and status notifications execute autonomously with zero latency.',
      indicator: 'bg-[#16A34A]',
      textAccent: 'text-[#16A34A] dark:text-emerald-400',
    },
    {
      level: 'MEDIUM RISK',
      mode: 'Operator Notified',
      desc: 'Secondary staging alerts and non-critical schedule adjustments execute automatically while logging operator alerts.',
      indicator: 'bg-[#2563EB]',
      textAccent: 'text-[#2563EB] dark:text-blue-400',
    },
    {
      level: 'HIGH RISK',
      mode: 'Approval Required',
      desc: 'Route diversions, reserve fleet requisitions, and budget reallocations pause for one-click human authorization.',
      indicator: 'bg-[#EAB308]',
      textAccent: 'text-[#EAB308] dark:text-amber-400',
    },
    {
      level: 'CRITICAL RISK',
      mode: 'Mandatory Human Approval',
      desc: 'Emergency zone evacuations, life-safety overrides, and sovereign policy changes require explicit operator sign-off.',
      indicator: 'bg-[#DC2626]',
      textAccent: 'text-[#DC2626] dark:text-red-400',
    },
  ];

  // Mission Flow Visual Stages (Requirement 3)
  const missionFlowBar = [
    { stage: 'INPUT', role: 'Special Insight', color: '#DB2777', dot: 'bg-[#DB2777]' },
    { stage: 'ANALYZE', role: 'AI Reasoning', color: '#7C3AED', dot: 'bg-[#7C3AED]' },
    { stage: 'PLAN', role: 'DAG Synthesis', color: '#2563EB', dot: 'bg-[#2563EB]' },
    { stage: 'EXECUTE', role: 'Verified Dispatch', color: '#16A34A', dot: 'bg-[#16A34A]' },
    { stage: 'MONITOR', role: 'Anomaly Watch', color: '#EAB308', dot: 'bg-[#EAB308]' },
    { stage: 'ADAPT', role: 'Critical Re-Plan', color: '#DC2626', dot: 'bg-[#DC2626]' },
    { stage: 'VERIFY', role: 'Outcome Sealed', color: '#16A34A', dot: 'bg-[#16A34A]' },
  ];

  // Connected Multi-Agent Topology (Requirement 2 & 6)
  const agentNodesVisual = [
    { name: 'Planning Agent', status: 'Planning', dotColor: '#7C3AED', labelColor: 'text-[#7C3AED]', x: 110, y: 55 },
    { name: 'Execution Agent', status: 'Executing', dotColor: '#2563EB', labelColor: 'text-[#2563EB]', x: 300, y: 35 },
    { name: 'Monitoring Agent', status: 'Waiting', dotColor: '#EAB308', labelColor: 'text-[#EAB308]', x: 490, y: 55 },
    { name: 'Resource Agent', status: 'Insight', dotColor: '#DB2777', labelColor: 'text-[#DB2777]', x: 205, y: 125 },
    { name: 'Verification Agent', status: 'Completed', dotColor: '#16A34A', labelColor: 'text-[#16A34A]', x: 395, y: 125 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#111827] text-[#1F2937] dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* TOP NAVIGATION HEADER */}
      <header className="border-b border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF]/95 dark:bg-[#1F2937]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-[#1F2937] dark:text-white leading-none">
                PLANOVA<span className="text-[#7C3AED] font-semibold ml-1">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
                Plan. Execute. Adapt.
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#6B7280] dark:text-slate-400 pl-4 border-l border-[#E5E7EB] dark:border-slate-800">
            <a href="#how-it-works" className="hover:text-[#1F2937] dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-[#1F2937] dark:hover:text-white transition-colors">
              Core Capabilities
            </a>
            <a href="#domains" className="hover:text-[#1F2937] dark:hover:text-white transition-colors">
              Mission Domains
            </a>
            <a href="#why-planova" className="hover:text-[#1F2937] dark:hover:text-white transition-colors">
              Why PLANOVA AI
            </a>
            <a href="#governance" className="hover:text-[#1F2937] dark:hover:text-white transition-colors">
              Human Governance
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector variant="dropdown" />
          <ThemeToggle showLabel={false} />

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E5E7EB] dark:border-slate-800">
              <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span>Session Active ({currentUser.name.split(' ')[0]})</span>
              </span>
              <button
                onClick={onEnterDashboard}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB] dark:border-slate-800">
              <button
                onClick={onSignIn || onEnterDashboard}
                className="px-3.5 py-2 text-xs font-semibold text-[#1F2937] dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Sign In</span>
              </button>
              <button
                onClick={onSignUp || onLaunchMission}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Account</span>
                <span className="sm:hidden">Start</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ==================================================
          HERO SECTION
      ================================================== */}
      <section className="relative bg-grid-pattern border-b border-[#E5E7EB] dark:border-slate-800/80 py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Quiet Kicker */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2563EB] font-semibold">
              <span>AUTONOMOUS MISSION PLANNING & EXECUTION PLATFORM</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#7C3AED]">ENTERPRISE AI</span>
            </div>

            {/* Brand & Tagline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1F2937] dark:text-white leading-[1.08]">
                PLANOVA AI
                <span className="block text-2xl sm:text-4xl font-bold text-[#2563EB] mt-2">
                  Plan. Execute. Adapt.
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-[#1F2937] dark:text-slate-200">
                From complex goals to verified real-world outcomes.
              </p>
            </div>

            {/* Concise Description */}
            <p className="text-sm sm:text-base text-[#6B7280] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              PLANOVA AI transforms complex real-world goals into executable missions, continuously monitors progress, adapts to changing conditions, and verifies outcomes.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={onLaunchMission}
                className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
              >
                <span>Create Your Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onRunDemo}
                className="px-6 py-3.5 bg-[#FFFFFF] dark:bg-[#1F2937] hover:bg-[#F5F7FA] dark:hover:bg-slate-800 text-[#1F2937] dark:text-white text-sm font-semibold rounded-xl border border-[#E5E7EB] dark:border-slate-700 shadow-2xs transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 text-[#2563EB] fill-current" />
                <span>Explore Demo</span>
              </button>
            </div>
          </div>

          {/* SUBTLE ANIMATED VISUAL: Goal -> Plan -> Execute -> Monitor -> Adapt -> Verify */}
          <div className="mt-14 max-w-5xl mx-auto bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1F2937] dark:text-white">
                  AUTONOMOUS MISSION TELEMETRY LOOP
                </span>
              </div>
              <span className="text-xs font-mono text-[#6B7280] dark:text-slate-400">
                Live Mission Cycle · Click any stage to inspect
              </span>
            </div>

            {/* 1. HERO SECTION CONNECTED NODE SVG DATA-FLOW VISUALIZATION */}
            <div className="hidden md:block px-2 pt-1">
              <svg viewBox="0 0 900 54" className="w-full h-12 overflow-visible">
                {/* Base structural line */}
                <line x1="75" y1="27" x2="825" y2="27" stroke="#E5E7EB" strokeWidth="2" />
                {/* Animated active data-flow stream */}
                <line
                  x1="75"
                  y1="27"
                  x2="825"
                  y2="27"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  className="animate-data-flow"
                />
                {heroFlowSteps.map((step, idx) => {
                  const cx = 75 + idx * 150;
                  const isCurrent = idx === activePipelineStep;
                  const isDone = idx < activePipelineStep;
                  const strokeColor = isCurrent ? '#2563EB' : isDone ? '#16A34A' : '#7C3AED';
                  return (
                    <g
                      key={step.id}
                      className="cursor-pointer"
                      onClick={() => setActivePipelineStep(idx)}
                    >
                      {isCurrent && (
                        <circle cx={cx} cy={27} r="14" fill="#2563EB" fillOpacity="0.14" />
                      )}
                      <circle
                        cx={cx}
                        cy={27}
                        r="8"
                        fill={isCurrent ? '#2563EB' : isDone ? '#16A34A' : '#FFFFFF'}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />
                      <text
                        x={cx}
                        y={48}
                        textAnchor="middle"
                        fill={isCurrent ? '#2563EB' : '#6B7280'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {step.label.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 6-Node Interactive Animated Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {heroFlowSteps.map((node, index) => {
                const isCurrent = index === activePipelineStep;
                const isCompleted = index < activePipelineStep;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActivePipelineStep(index)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm -translate-y-0.5'
                        : isCompleted
                        ? 'bg-[#F5F7FA] dark:bg-slate-800/70 text-[#1F2937] dark:text-slate-200 border-[#16A34A]/40'
                        : 'bg-[#F5F7FA] dark:bg-slate-900/50 text-[#6B7280] dark:text-slate-400 border-[#E5E7EB] dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className={isCurrent ? 'text-blue-100 font-bold' : 'text-[#6B7280] dark:text-slate-400'}>
                        0{index + 1}
                      </span>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                    </div>
                    <div className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-[#1F2937] dark:text-white'}`}>
                      {node.label}
                    </div>
                    <div className={`text-[10px] font-mono mt-1 truncate ${isCurrent ? 'text-blue-100' : 'text-[#6B7280] dark:text-slate-400'}`}>
                      {node.metric}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Inspector Bar */}
            <div className="p-4 rounded-xl bg-[#F5F7FA] dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#2563EB] font-bold uppercase">
                  <span>STAGE 0{activePipelineStep + 1}: {heroFlowSteps[activePipelineStep].label}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#16A34A]">{heroFlowSteps[activePipelineStep].metric}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#1F2937] dark:text-slate-200">
                  {heroFlowSteps[activePipelineStep].detail}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onLaunchMission}
                  className="px-3.5 py-2 bg-[#FFFFFF] dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1F2937] dark:text-slate-200 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          1. HOW IT WORKS + MISSION FLOW VISUAL
      ================================================== */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] font-bold">
            1 · CLOSED-LOOP ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
            How PLANOVA AI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400">
            Understand → Plan → Execute → Monitor → Adapt → Verify
          </p>
        </div>

        {/* 3. HORIZONTAL MISSION PROCESS VISUALIZATION */}
        <div className="p-4 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-[#6B7280]">
            <span className="uppercase font-bold text-[#1F2937] dark:text-white">
              END-TO-END MISSION PIPELINE TELEMETRY
            </span>
            <span>INPUT → ANALYZE → PLAN → EXECUTE → MONITOR → ADAPT → VERIFY</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {missionFlowBar.map((item, idx) => (
              <div
                key={item.stage}
                className="p-2.5 rounded-lg bg-[#F5F7FA] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`}></span>
                  <div className="truncate">
                    <div className="text-[11px] font-bold font-mono text-[#1F2937] dark:text-white leading-tight">
                      {item.stage}
                    </div>
                    <div className="text-[9px] font-mono text-[#6B7280] truncate">
                      {item.role}
                    </div>
                  </div>
                </div>
                {idx < missionFlowBar.length - 1 && (
                  <span className="text-[10px] font-mono text-[#6B7280] hidden lg:inline">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 border-l-4 border-l-[#2563EB] rounded-xl shadow-2xs hover:border-[#2563EB]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#6B7280] dark:text-slate-400">
                      STEP {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-[#2563EB]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          2. CORE CAPABILITIES + MULTI-AGENT TOPOLOGY VISUAL
      ================================================== */}
      <section id="capabilities" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#FFFFFF] dark:bg-[#1F2937] border-y border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold">
                2 · ENTERPRISE CAPABILITIES
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
                Core Autonomous Capabilities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 max-w-md">
              Built for high-consequence operations where static recommendations are not enough.
            </p>
          </div>

          {/* 2 & 6. ABSTRACT AI MULTI-AGENT GRAPHIC & LIVE AGENT STATES */}
          <div className="p-5 bg-[#F5F7FA] dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#7C3AED] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                <span>5-AGENT ORCHESTRATION TOPOLOGY</span>
              </div>
              <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                Synchronized Multi-Agent Intelligence Bus
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                Five specialized autonomous agents coordinate over a deterministic state graph with real-time telemetry handoffs.
              </p>
              {/* Agent Activity Legend (Requirement 6) */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span> Planning
                </span>
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Executing
                </span>
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Completed
                </span>
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Waiting
                </span>
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span> Blocked
                </span>
                <span className="flex items-center gap-1.5 text-[#1F2937] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#DB2777]"></span> Insight
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-4">
              <svg viewBox="0 0 600 165" className="w-full h-40">
                {/* Connecting Neural Lines */}
                <line x1="110" y1="55" x2="300" y2="35" stroke="#2563EB" strokeWidth="1.5" className="animate-data-flow" />
                <line x1="300" y1="35" x2="490" y2="55" stroke="#7C3AED" strokeWidth="1.5" className="animate-data-flow" />
                <line x1="110" y1="55" x2="205" y2="125" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="300" y1="35" x2="205" y2="125" stroke="#2563EB" strokeWidth="1.5" />
                <line x1="300" y1="35" x2="395" y2="125" stroke="#16A34A" strokeWidth="1.5" className="animate-data-flow" />
                <line x1="205" y1="125" x2="395" y2="125" stroke="#DB2777" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="490" y1="55" x2="395" y2="125" stroke="#16A34A" strokeWidth="1.5" />

                {agentNodesVisual.map((ag) => (
                  <g key={ag.name}>
                    <rect
                      x={ag.x - 72}
                      y={ag.y - 20}
                      width="144"
                      height="40"
                      rx="8"
                      fill="#FFFFFF"
                      stroke={ag.dotColor}
                      strokeWidth="1.5"
                    />
                    <circle cx={ag.x - 56} cy={ag.y} r="4.5" fill={ag.dotColor} />
                    <text
                      x={ag.x - 44}
                      y={ag.y - 3}
                      fill="#1F2937"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {ag.name}
                    </text>
                    <text
                      x={ag.x - 44}
                      y={ag.y + 10}
                      fill={ag.dotColor}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ● {ag.status.toUpperCase()}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-5 bg-[#F5F7FA] dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 border-l-4 border-l-[#7C3AED] rounded-xl hover:border-[#2563EB]/50 transition-all space-y-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          3. MISSION DOMAINS
      ================================================== */}
      <section id="domains" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] font-bold">
            3 · CROSS-DOMAIN MISSION ENGINE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
            One Universal Engine Across Critical Sectors
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400">
            Every domain runs on the same planning, execution, monitoring, adaptation, and verification kernel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {missionDomains.map((dom, idx) => {
            const Icon = dom.icon;
            return (
              <div
                key={idx}
                onClick={onLaunchMission}
                className="p-5 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 rounded-xl shadow-2xs hover:border-[#2563EB] transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                    {dom.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                    {dom.scenario}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-slate-800 text-[11px] font-mono text-[#2563EB] font-medium">
                  {dom.metrics}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          4. WHY PLANOVA AI
      ================================================== */}
      <section id="why-planova" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#FFFFFF] dark:bg-[#1F2937] border-y border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold">
              4 · THE PARADIGM SHIFT
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1F2937] dark:text-white tracking-tight">
              “Existing AI generates recommendations.{' '}
              <span className="text-[#2563EB]">PLANOVA AI manages the mission.</span>”
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyPlanovaItems.map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#F5F7FA] dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                    {item.title}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                </div>
                <div className="text-xs text-[#6B7280] dark:text-slate-400 line-through">
                  {item.traditional}
                </div>
                <p className="text-xs font-medium text-[#1F2937] dark:text-slate-200 leading-relaxed pt-1 border-t border-[#E5E7EB] dark:border-slate-800">
                  {item.planova}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          5. TECHNOLOGY STACK BAR
      ================================================== */}
      <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="p-6 sm:p-8 bg-[#1F2937] text-white rounded-2xl shadow-sm space-y-6 border-l-4 border-l-[#7C3AED]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] font-bold block">
                5 · CORE TECHNOLOGY ARCHITECTURE
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Agentic AI • LLM • RAG • Structured Tool Calling • APIs • Real-Time Intelligence
              </h3>
            </div>
            <Terminal className="w-5 h-5 text-[#2563EB] hidden sm:block" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {techPills.map((tech, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1"
              >
                <div className="text-xs font-bold text-white">{tech.label}</div>
                <div className="text-[10px] font-mono text-slate-300">{tech.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          6. HUMAN-CONTROLLED AI GOVERNANCE
      ================================================== */}
      <section id="governance" className="py-14 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] font-bold">
            6 · HUMAN-CONTROLLED AI GOVERNANCE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
            Autonomous Speed with Sovereign Human Control
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">
            PLANOVA AI automates low-risk telemetry and routine dispatches while enforcing mandatory human approval for high-impact or critical operational decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {governanceTiers.map((tier, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-slate-800 rounded-xl shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tier.indicator}`}></span>
                <span className="text-xs font-mono font-bold text-[#1F2937] dark:text-white">
                  {tier.level}
                </span>
              </div>
              <div className={`text-sm font-bold ${tier.textAccent}`}>
                {tier.mode}
              </div>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                {tier.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          7. FINAL CTA
      ================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#FFFFFF] dark:bg-[#1F2937] border-t border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold">
            READY FOR MISSION COMMAND
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1F2937] dark:text-white tracking-tight">
            Turn complex goals into verified outcomes.
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-slate-400 max-w-xl mx-auto">
            Deploy autonomous planning, real-time digital twin monitoring, and human-governed execution across your operations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onLaunchMission}
              className="px-7 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start with PLANOVA AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRunDemo}
              className="px-6 py-3.5 bg-[#F5F7FA] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#1F2937] dark:text-white text-sm font-semibold rounded-xl border border-[#E5E7EB] dark:border-slate-700 transition-all cursor-pointer"
            >
              Explore Flagship Demo
            </button>
          </div>
        </div>
      </section>

      {/* ENTERPRISE FOOTER */}
      <footer className="py-8 px-4 sm:px-8 border-t border-[#E5E7EB] dark:border-slate-800 bg-[#F5F7FA] dark:bg-[#111827] text-xs text-[#6B7280] dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#2563EB] text-white flex items-center justify-center font-black text-xs">
              P
            </div>
            <span className="font-bold text-[#1F2937] dark:text-white">PLANOVA AI</span>
            <span>·</span>
            <span>Plan. Execute. Adapt.</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Cryptographic Auth</span>
            <span>·</span>
            <span>Firestore Digital Twin</span>
            <span>·</span>
            <span>Human-in-the-Loop Governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
