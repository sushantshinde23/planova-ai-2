import React, { useState, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Wrench,
  Radio,
  FileCheck,
  Activity,
  X,
  Sparkles,
  Download,
} from 'lucide-react';

export const AutopilotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}> = ({ isOpen, onClose }) => {
  const {
    activeMission,
    tasks,
    plans,
    selectedPlanVersion,
    setSelectedPlanVersion,
    triggerDisruption,
    decideApproval,
    approvals,
    openApprovalModal,
    t,
  } = useMission();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [evidenceVerified, setEvidenceVerified] = useState<boolean>(false);

  // Exact 11-step pipeline from prompt
  const autopilotSteps = [
    {
      id: 'step-1-goal',
      title: '1. GOAL INGESTION',
      agent: 'Planning Agent',
      desc: 'Natural language mission objective received: "Coordinate emergency flood evacuation across Sector 4 Riverbank with 3 medical shelters and 8 ALS ambulances". Extracted hard constraints and 4,200 vulnerable citizens.',
      actionLabel: 'Synthesize Autonomous Plan',
      execute: () => {
        setSelectedPlanVersion(1);
      },
    },
    {
      id: 'step-2-plan',
      title: '2. AUTONOMOUS PLANNING',
      agent: 'Planning Agent',
      desc: 'Generated Plan v1: Decomposed mission into a multi-echelon Directed Acyclic Graph (DAG) with 24 tasks, critical path calculation, and optimal ambulance transit through Causeway Bridge Route R2.',
      actionLabel: 'Dispatch to Execution Layer',
      execute: () => {
        setSelectedPlanVersion(1);
      },
    },
    {
      id: 'step-3-tools',
      title: '3. TOOL EXECUTION',
      agent: 'Execution Agent',
      desc: 'Invoked specialized tools: OpenRouteService Matrix API, Google Maps Platform Routing, and Ayushman Bharat Health Patient Registry. Allocated 8 ALS ambulances and opened triage points.',
      actionLabel: 'Initiate Live Monitoring',
      execute: () => {},
    },
    {
      id: 'step-4-monitor',
      title: '4. LIVE MONITORING',
      agent: 'Monitoring Agent',
      desc: 'Continuous sub-second telemetry sweep active across hydrological stream sensors, IoT bridge stress gauges, and GPS vehicle transponders. Convoys 1 to 4 successfully in transit.',
      actionLabel: 'Simulate Environmental Shock',
      execute: () => {},
    },
    {
      id: 'step-5-disruption',
      title: '5. DISRUPTION OCCURS',
      agent: 'Monitoring Agent',
      desc: 'SHOCK DETECTED: Hydro Sensor #12 reports flash flood crest of 0.92m breaching the Causeway Bridge deck on Route R2. Ambulances A-1 and A-2 halted. 6 downstream tasks paralyzed.',
      actionLabel: 'Analyze Cascade Impact',
      execute: () => {
        triggerDisruption('route_r2_blocked');
      },
    },
    {
      id: 'step-6-impact',
      title: '6. IMPACT ANALYSIS',
      agent: 'Planning & Resource Agents',
      desc: 'Automated impact cascade computed: 6 tasks blocked, +45 minute delay projected on Route R2, potential casualty risk for 18 ICU patients. Identified Elevated Bypass Route R4 at KM 14 (+12m elevation).',
      actionLabel: 'Generate Adaptive Plan v2',
      execute: () => {},
    },
    {
      id: 'step-7-replan',
      title: '7. AUTOMATIC RE-PLANNING',
      agent: 'Planning Agent',
      desc: 'Synthesized Adaptive Plan v2: Detours all medical convoys to Elevated Bypass R4. Restricts delay delta to only +9 minutes. Reroutes fuel supplies and updates shelter intake rosters.',
      actionLabel: 'Evaluate Governance Risk Tier',
      execute: () => {
        setSelectedPlanVersion(2);
      },
    },
    {
      id: 'step-8-approval',
      title: '8. HUMAN APPROVAL (CRITICAL TIER)',
      agent: 'Human-in-the-Loop Governance',
      desc: 'Risk Tier CRITICAL: Diverting primary arterial route requires Duty Officer digital authorization. Confidence Score: 94%. Expected impact: Zero casualties, +9 min transit shift.',
      actionLabel: 'Authorize & Sign Off',
      execute: () => {
        if (approvals.length > 0) {
          decideApproval(approvals[0].id, 'approved', 'Authorized by Duty Officer via Autopilot Demo');
        }
      },
    },
    {
      id: 'step-9-resume',
      title: '9. EXECUTION RESUMES',
      agent: 'Execution Agent',
      desc: 'Approved Adaptive Plan v2 immediately dispatched. Convoys re-vectored via Bypass R4 GPS waypoints. Ambulances A-1 through A-8 safely reach Shelters 1, 2, and 3 without casualty.',
      actionLabel: 'Execute Outcome Verification',
      execute: () => {
        setSelectedPlanVersion(2);
      },
    },
    {
      id: 'step-10-verify',
      title: '10. VERIFICATION',
      agent: 'Verification Agent',
      desc: 'Verification Engine triggered: Rejects task-only completion. Cross-references biometric triage manifests, optical gate headcounts, and water sensor readings. 100% verified survivor accountability.',
      actionLabel: 'Issue Final Certification',
      execute: () => {
        setEvidenceVerified(true);
      },
    },
    {
      id: 'step-11-outcome',
      title: '11. VERIFIED MISSION OUTCOME',
      agent: 'Verification Agent & Ledger',
      desc: 'MISSION ACCOMPLISHED: 4,200 / 4,200 citizens safely evacuated. 0 Fatalities. Cryptographic SHA-256 audit ledger generated and verified. Full executive dossier ready for export.',
      actionLabel: 'Completed — Restart Demo',
      execute: () => {},
    },
  ];

  const currentStep = autopilotSteps[currentStepIndex];

  // Pause playback immediately if modal is closed or unmounted
  useEffect(() => {
    if (!isOpen && isPlaying) {
      setIsPlaying(false);
    }
  }, [isOpen, isPlaying]);

  // Auto-step timer when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlaying && currentStepIndex < autopilotSteps.length - 1) {
      timer = setTimeout(() => {
        handleNextStep();
      }, 4000);
    } else if (currentStepIndex >= autopilotSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStepIndex]);

  const handleNextStep = () => {
    currentStep.execute();
    if (currentStepIndex < autopilotSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  const handleStepJump = (idx: number) => {
    autopilotSteps[idx].execute();
    setCurrentStepIndex(idx);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSelectedPlanVersion(1);
    setEvidenceVerified(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#172554] text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                  FLAGSHIP DEMONSTRATION · MISSION AUTOPILOT
                </span>
                <span className="text-blue-400/60">·</span>
                <span className="text-xs font-mono text-blue-200/80">Universal Autonomous Kernel</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                End-to-End Autonomous Mission Lifecycle & Disruption Recovery
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 11-Step Pipeline Visual Progress Bar */}
        <div className="bg-[#f8fafc] dark:bg-[#0b1120] px-6 py-3 border-b border-[#e2e8f0] dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[720px] gap-1.5">
            {autopilotSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepJump(idx)}
                  className="flex-1 flex flex-col items-center gap-1 group cursor-pointer focus:outline-hidden"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-[#2563eb] text-white ring-2 ring-[#6366f1] scale-105 shadow-xs'
                        : 'bg-[#e2e8f0] dark:bg-slate-800 text-[#64748b] dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] font-mono text-center truncate max-w-[62px] block ${
                      isCurrent
                        ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                        : 'text-[#64748b] dark:text-slate-400'
                    }`}
                  >
                    {step.title.split('. ')[1] || step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Stage Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Step Showcase Card */}
          <div className="p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/40 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
                  {currentStep.agent}
                </span>
                <span className="text-[#64748b]">·</span>
                <span className="text-xs font-mono text-[#64748b] dark:text-slate-400">
                  Stage {currentStepIndex + 1} of {autopilotSteps.length}
                </span>
              </div>

              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>STATE SYNCHRONIZED</span>
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs text-[#0f172a] dark:text-slate-300 leading-relaxed mt-2 font-normal">
                {currentStep.desc}
              </p>
            </div>

            {/* Contextual Micro-Gauges depending on active stage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-[#e2e8f0] dark:border-slate-800">
                <span className="text-[10px] text-[#64748b] dark:text-slate-400 block uppercase">Active Plan</span>
                <span className="text-sm font-bold text-[#0f172a] dark:text-white mt-0.5 block">
                  Plan v{selectedPlanVersion}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-[#e2e8f0] dark:border-slate-800">
                <span className="text-[10px] text-[#64748b] dark:text-slate-400 block uppercase">Corridor Status</span>
                <span className={`text-sm font-bold mt-0.5 block ${
                  selectedPlanVersion >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {selectedPlanVersion >= 2 ? 'Bypass R4 (Elevated)' : 'Route R2 (Causeway)'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-[#e2e8f0] dark:border-slate-800">
                <span className="text-[10px] text-[#64748b] dark:text-slate-400 block uppercase">Confidence Score</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  94% Verified
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-[#e2e8f0] dark:border-slate-800">
                <span className="text-[10px] text-[#64748b] dark:text-slate-400 block uppercase">Survivor Intake</span>
                <span className="text-sm font-bold text-[#0f172a] dark:text-white mt-0.5 block">
                  {currentStepIndex >= 9 ? '4,200 / 4,200 (100%)' : '3,390 / 4,200 (81%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Evidence Seal (when step >= 9) */}
          {currentStepIndex >= 9 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 rounded-xl flex items-center justify-between gap-3 text-emerald-950 dark:text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 uppercase font-bold block">
                    Cryptographic Evidence Chain Validated
                  </span>
                  <span className="text-xs font-semibold text-emerald-900 dark:text-white">
                    Outcome Certified: 0 Casualties · Biometric Roster Matched · Audit Hash Immutable
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded font-bold">
                SHA-256 Validated
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-[#f8fafc] dark:bg-[#0b1120] border-t border-[#e2e8f0] dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-semibold text-[#0f172a] dark:text-slate-300 hover:text-black dark:hover:text-white border border-[#e2e8f0] dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer bg-white dark:bg-[#0f172a]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pipeline</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isPlaying
                  ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                  : 'bg-white dark:bg-[#0f172a] text-[#0f172a] dark:text-slate-300 border-[#e2e8f0] dark:border-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Autopilot' : 'Auto-Run (4s)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextStep}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{currentStep.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
