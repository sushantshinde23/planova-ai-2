import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import {
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Clock,
  Activity,
  Sparkles,
  Play,
} from 'lucide-react';

export const PredictiveFailureView: React.FC = () => {
  const { activeMission, triggerDisruption, createPlanVersion } = useMission();
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [simulatedIds, setSimulatedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const predictions = [
    {
      id: 'pred-01',
      taskId: 'TASK 09',
      target: 'Causeway Bridge Route R2 Submergence',
      probability: 89,
      horizon: 'T-Minus 12 Mins',
      severity: 'HIGH RISK',
      reasons: [
        'River gauge S-402 rising +4.2cm/min',
        'Bridge deck clearance limit (0.35m) exceeded',
        'Downstream tasks T-10, T-11, T-12 dependent on corridor',
      ],
      recommendation: 'Pre-emptively divert Convoy Alpha & Bravo to Elevated Bypass R4',
      impactAvoided: 'Saves 2 ALS Ambulances from flood stranding & +95m delay',
      triggerType: 'route_r2_blocked' as const,
    },
    {
      id: 'pred-02',
      taskId: 'TASK 10',
      target: 'Ambulance Fleet Bottleneck at Staging Alpha',
      probability: 73,
      horizon: 'T-Minus 24 Mins',
      severity: 'HIGH RISK',
      reasons: [
        'Resource shortage: 3 ALS units drawn to trauma call',
        'Route congestion adding +15 min turnaround',
        'Dependency delay on geriatric ward evacuation',
      ],
      recommendation: 'Reassign Agent 04 & Mobilize 6 Municipal Transit Shuttles',
      impactAvoided: 'Maintains 65-min evacuation SLA for 4,200 citizens',
      triggerType: 'ambulance_reduced' as const,
    },
    {
      id: 'pred-03',
      taskId: 'TASK 15',
      target: 'Shelter 1 Intake Triage Queue Saturation',
      probability: 64,
      horizon: 'T-Minus 38 Mins',
      severity: 'MEDIUM RISK',
      reasons: [
        'Simultaneous arrival of 3 high-capacity shuttle waves',
        'Biometric check-in terminal bandwidth at 88%',
        'Medical triage nurse ratio approaching threshold',
      ],
      recommendation: 'Re-balance 35% of Wave-2 arrivals to Shelter 2 (Civic Stadium)',
      impactAvoided: 'Reduces patient intake wait time from 42m to 9m',
      triggerType: null,
    },
    {
      id: 'pred-04',
      taskId: 'TASK 18',
      target: 'Cellular Telemetry Packet Loss in Lower Basin',
      probability: 41,
      horizon: 'T-Minus 50 Mins',
      severity: 'MODERATE RISK',
      reasons: [
        'Heavy precipitation attenuation (85mm/hr)',
        'Primary tower backup battery at 62%',
      ],
      recommendation: 'Switch Ambulance GPS heartbeats to Low-Bandwidth Satellite Fallback',
      impactAvoided: '100% continuous tracking of high-acuity ICU transits',
      triggerType: null,
    },
  ];

  const handleApplyMitigation = async (pred: (typeof predictions)[0]) => {
    setApplyingId(pred.id);
    try {
      if (pred.triggerType) {
        await triggerDisruption(pred.triggerType);
      } else {
        await createPlanVersion(
          `Applied predictive mitigation: ${pred.recommendation}`,
          'Predictive Failure Sentinel'
        );
      }
      setAppliedIds((prev) => [...prev, pred.id]);
    } finally {
      setApplyingId(null);
    }
  };

  const handleSimulateMitigation = (id: string) => {
    setSimulatedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#DC2626]">
            <span>PROACTIVE RISK INTELLIGENCE</span>
            <span aria-hidden="true">·</span>
            <span>MONTE CARLO TELEMETRY FORECASTING</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            Predictive Failure & Bottleneck Sentinel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Forecasts task failure probabilities for <strong className="text-slate-800 dark:text-slate-200">{activeMission?.title}</strong> before cascades occur.
          </p>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            PREDICTED BOTTLENECKS
          </span>
          <span className="text-3xl font-extrabold text-[#DC2626] block mt-1">
            0{predictions.length - appliedIds.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Next 60 mins window</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            FORECAST HORIZON
          </span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white block mt-1">
            +60m
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">1,000 Monte Carlo runs</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            CASCADES AVERTED
          </span>
          <span className="text-3xl font-extrabold text-[#16A34A] block mt-1">
            {appliedIds.length + 2}
          </span>
          <span className="text-[11px] text-[#16A34A] mt-1 block">Zero stranded units</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            MODEL CONFIDENCE
          </span>
          <span className="text-3xl font-extrabold text-[#7C3AED] block mt-1">
            94.2%
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Grounded sensor feed</span>
        </div>
      </div>

      {/* =====================================================================
          VISUAL RISK DASHBOARD CARDS (SECTION 17 SPECIFICATION)
      ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {predictions.map((pred) => {
          const isApplied = appliedIds.includes(pred.id);
          const isSimulated = simulatedIds.includes(pred.id);
          const isBusy = applyingId === pred.id;

          return (
            <div
              key={pred.id}
              className="p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Header: TASK ID + SEVERITY + HORIZON */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-extrabold">
                      <span className="text-[#2563EB]">{pred.taskId}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span
                        className={
                          pred.probability >= 70 ? 'text-[#DC2626]' : 'text-[#EAB308]'
                        }
                      >
                        {pred.severity}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">
                      {pred.target}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                    {pred.horizon}
                  </span>
                </div>

                {/* Failure Probability Visual Meter */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      FAILURE PROBABILITY
                    </span>
                    <span
                      className={`text-lg font-extrabold ${
                        pred.probability >= 70 ? 'text-[#DC2626]' : 'text-[#EAB308]'
                      }`}
                    >
                      {isApplied ? '12% (MITIGATED)' : `${pred.probability}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isApplied
                          ? 'bg-[#16A34A]'
                          : pred.probability >= 70
                          ? 'bg-[#DC2626]'
                          : 'bg-[#EAB308]'
                      }`}
                      style={{ width: `${isApplied ? 12 : pred.probability}%` }}
                    />
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    RISK DRIVERS & REASONS:
                  </span>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {pred.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendation Box */}
                <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200/90 dark:border-purple-800/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-[#7C3AED] dark:text-purple-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI RECOMMENDATION
                    </span>
                    <span className="text-[#16A34A] font-semibold">
                      {pred.impactAvoided}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white pt-0.5">
                    {pred.recommendation}
                  </p>
                </div>

                {isSimulated && !isApplied && (
                  <div className="p-2.5 bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg text-[11px] font-mono text-cyan-800 dark:text-cyan-300">
                    Simulation Result: Risk drops from {pred.probability}% → 12% with zero downstream task failures.
                  </div>
                )}
              </div>

              {/* Action Buttons: [ SIMULATE ] [ APPLY ] */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulateMitigation(pred.id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isSimulated ? 'SIMULATED ✓' : 'SIMULATE'}
                </button>
                <button
                  type="button"
                  disabled={isApplied || isBusy}
                  onClick={() => handleApplyMitigation(pred)}
                  className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isApplied
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>APPLIED</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isBusy ? 'APPLYING...' : 'APPLY'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
