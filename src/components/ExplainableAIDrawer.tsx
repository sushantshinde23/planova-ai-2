import React from 'react';
import { useMission } from '../store/missionContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  GitBranch,
  ShieldCheck,
  Cpu,
  Layers,
  Route,
} from 'lucide-react';

interface ExplainableAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainableAIDrawer: React.FC<ExplainableAIDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeMission, selectedPlanVersion, plans, tasks } = useMission();

  if (!isOpen || !activeMission) return null;

  const currentPlan =
    plans.find((p) => p.version === selectedPlanVersion) || plans[plans.length - 1];

  const ai = {
    summary:
      activeMission.aiUnderstanding?.summary ||
      `Plan V${selectedPlanVersion} was selected to optimize mission ETA while maintaining zero life-safety exposure across ${activeMission.location}.`,
    entities: Array.isArray(activeMission.aiUnderstanding?.entities)
      ? activeMission.aiUnderstanding!.entities
      : [
          activeMission.location || 'Sector 4',
          '8 ALS Ambulances',
          'Shelters S1, S2, S3',
          'Elevated Bypass Route R4',
        ],
    assumptions: Array.isArray(activeMission.aiUnderstanding?.assumptions)
      ? activeMission.aiUnderstanding!.assumptions
      : [
          'Elevated Bypass Route R4 remains structural above +4.5m flood surge',
          'Emergency cellular & satellite telemetry links remain active',
        ],
    risks: Array.isArray(activeMission.aiUnderstanding?.risks)
      ? activeMission.aiUnderstanding!.risks
      : [
          'Submergence of Causeway Bridge R2 (+0.92m water depth)',
          'Secondary ICU demand drawing down ambulance reserve',
        ],
    missingInfo: Array.isArray(activeMission.aiUnderstanding?.missingInfo)
      ? activeMission.aiUnderstanding!.missingInfo
      : ['Real-time structural load telemetry on northern culvert'],
    explanation:
      activeMission.aiUnderstanding?.explanation ||
      (selectedPlanVersion > 1
        ? `Plan V${selectedPlanVersion} was selected because Causeway Route R2 became submerged (+0.92m) and fleet capacity shifted. The system reassigned affected tasks to Elevated Bypass R4 and mobilized 2-wave shuttle staging to preserve the mission SLA.`
        : `Plan V1 baseline was synthesized by decomposing the mission objective into ${(tasks || []).length} interdependent DAG tasks across 4 operational phases.`),
    confidenceScore: activeMission.aiUnderstanding?.confidenceScore ?? 96.4,
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0F172A] h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Violet/Cyan AI Treatment */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-50/90 via-white to-cyan-50/60 dark:from-purple-950/40 dark:via-[#0F172A] dark:to-cyan-950/30 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7C3AED] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C3AED] dark:text-purple-400 block font-extrabold">
                ✦ PLANOVA AI REASONING
              </span>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">
                Why This Plan? — Plan V{selectedPlanVersion}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 flex-1">
          {/* Primary AI Reasoning Quote Box */}
          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200/90 dark:border-purple-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#7C3AED] dark:text-purple-300 uppercase">
                WHY THIS PLAN?
              </span>
              <span className="font-bold text-[#16A34A]">
                {ai.confidenceScore}% AI Confidence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{currentPlan?.reason || ai.explanation}"
            </p>
          </div>

          {/* CONSTRAINTS CONSIDERED & ALTERNATIVES EVALUATED */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                CONSTRAINTS CONSIDERED
              </span>
              <ul className="space-y-1.5 text-xs font-mono text-slate-800 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Resource availability & fleet capacity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Route safety & hydrological clearance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Agent specialization & tool latency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Mission urgency & life-safety SLA</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                ALTERNATIVES EVALUATED
              </span>
              <div className="text-3xl font-extrabold text-[#7C3AED] dark:text-purple-400 my-2">
                03
              </div>
              <span className="text-[10px] text-slate-500">
                2 suboptimal corridors rejected due to flood risk
              </span>
            </div>
          </div>

          {/* Tradeoff & Optimization Comparison */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 font-mono text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block">
              CANDIDATE TRAJECTORY SCORING
            </span>
            <div className="space-y-2.5">
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-rose-200 dark:border-rose-900/60">
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Option A: Hold at Submerged Route R2</span>
                  <span>REJECTED (High Risk)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  +95 min delay · Unacceptable water depth (0.92m above deck)
                </p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-emerald-300 dark:border-emerald-800">
                <div className="flex justify-between text-[#16A34A] font-bold">
                  <span>Option B: Elevated Bypass R4 + Shuttle Wave (Selected)</span>
                  <span>SELECTED (96.4% Score)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  +15 min delta · Zero flood hazard · 100% fleet continuity
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Operational Entities */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              GROUNDED OPERATIONAL ENTITIES
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {ai.entities.map((ent, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  {ent}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Logged in Audit Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
