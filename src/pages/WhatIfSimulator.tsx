import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { apiClient } from '../services/api';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Truck,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  GitCompare,
} from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const {
    activeMission,
    tasks,
    triggerDisruption,
    setSelectedPlanVersion,
    createPlanVersion,
    t,
  } = useMission();

  const [scenario, setScenario] = useState<string>('route_r2_submerged');
  const [ambulanceCount, setAmbulanceCount] = useState<number>(5);
  const [rainIntensity, setRainIntensity] = useState<number>(85);
  const [shelter2Closed, setShelter2Closed] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>({
    scenarioName: 'What if Causeway Bridge R2 is submerged & 3 ambulances are diverted?',
    baselineEta: '42 min',
    simulatedEta: '47 min',
    etaDelta: '+5 min',
    tasksAffected: 3,
    resourcesChanged: 2,
    riskLevel: 'Medium',
    casualtyRisk: '0% (Zero-Casualty Maintained)',
    affectedNodes: ['TASK 09 (Route R2)', 'TASK 10 (Convoy Alpha)', 'TASK 14 (ICU Transfer)'],
    mitigations: [
      'Reroute Convoy Alpha & Bravo via Elevated Bypass R4 (+9km)',
      'Mobilize 6 Municipal Transit Shuttles in 2-wave staging',
      'Prioritize 18 ICU high-acuity patients in Wave 1',
    ],
    confidenceScore: 95.8,
  });
  const [showCompare, setShowCompare] = useState<boolean>(true);
  const [applyingPlan, setApplyingPlan] = useState<boolean>(false);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const response = await apiClient.runSimulation({
        missionId: activeMission?.id,
        scenario,
        ambulanceCount,
        rainIntensity,
        shelter2Closed,
      });

      const baseMins = 42;
      const delay =
        (8 - ambulanceCount) * 3 +
        (rainIntensity > 80 ? 4 : 1) +
        (shelter2Closed ? 9 : 0);
      const simMins = baseMins + Math.max(3, delay);

      setSimResult({
        ...response,
        scenarioName:
          scenario === 'route_r2_submerged'
            ? 'What if Causeway Route R2 becomes impassable during peak rain?'
            : scenario === 'ambulance_shortage'
            ? `What if ALS Ambulance fleet drops to ${ambulanceCount} units?`
            : 'What if Compound Cyclone + Shelter 2 Closure occurs simultaneously?',
        baselineEta: `${baseMins} min`,
        simulatedEta: `${simMins} min`,
        etaDelta: `+${simMins - baseMins} min`,
        tasksAffected: shelter2Closed ? 5 : 3,
        resourcesChanged: 8 - ambulanceCount + (shelter2Closed ? 2 : 1),
        riskLevel: shelter2Closed ? 'High' : 'Medium',
        affectedNodes: [
          'TASK 09 (Route Assessment)',
          'TASK 10 (Convoy Dispatch)',
          'TASK 12 (Shelter Triage)',
        ],
        mitigations: response?.mitigations || [
          `Divert active fleet (${ambulanceCount} ALS units) to Elevated Bypass R4`,
          shelter2Closed
            ? 'Re-allocate Shelter 2 quota across Shelter 1 & Shelter 3'
            : 'Activate 2-wave shuttle rotation from Municipal Depot',
          'Maintain Human-in-the-Loop approval gate on critical reroutes',
        ],
        confidenceScore: response?.confidenceScore || 94.6,
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleApplySimulatedPlan = async () => {
    setApplyingPlan(true);
    try {
      if (scenario === 'route_r2_submerged') {
        await triggerDisruption('route_r2_blocked');
        setSelectedPlanVersion(2);
      } else {
        await triggerDisruption('ambulance_reduced');
        setSelectedPlanVersion(3);
      }
      await createPlanVersion(
        `Applied What-If Simulation Plan: ${simResult.scenarioName}`,
        'What-If Counterfactual Simulator'
      );
    } finally {
      setApplyingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#7C3AED]">
            <span>{t.simulator.kicker}</span>
            <span aria-hidden="true">·</span>
            <span>COUNTERFACTUAL SANDBOX</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            {t.simulator.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            {t.simulator.subtitle}
          </p>
        </div>

        {/* Top Action Buttons: RUN SIMULATION | COMPARE | APPLY PLAN */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runSimulation}
            disabled={simulating}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{simulating ? 'RUNNING...' : 'RUN SIMULATION'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCompare(!showCompare)}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer ${
              showCompare
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>COMPARE</span>
          </button>

          <button
            type="button"
            disabled={applyingPlan}
            onClick={handleApplySimulatedPlan}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-mono font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{applyingPlan ? 'APPLYING...' : 'APPLY PLAN'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VISUAL PIPELINE FLOW: PLAN V1 -> SIMULATION -> PLAN V1-A (SECTION 18)
      ===================================================================== */}
      <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center font-mono text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                CURRENT BASELINE
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                PLAN V{activeMission?.planVersion || 1}
              </span>
            </div>
            <span className="text-xs font-bold text-[#2563EB]">
              ETA: {simResult.baselineEta}
            </span>
          </div>

          <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#7C3AED] block font-bold">
                WHAT-IF STRESS ENGINE
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                SIMULATION KERNEL
              </span>
            </div>
            <span className="text-xs font-bold text-[#7C3AED]">
              {simResult.tasksAffected} Tasks Perturbed
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#16A34A] block font-bold">
                SYNTHESIZED CANDIDATE
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                PLAN V{activeMission?.planVersion || 1}-A
              </span>
            </div>
            <span className="text-xs font-bold text-[#16A34A]">
              ETA: {simResult.simulatedEta}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PARAMETERS (LEFT 5 COLS) + SIMULATION COMPARISON (RIGHT 7 COLS)
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: What-If Parameter Controls */}
        <div className="lg:col-span-5 p-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              WHAT IF? — SCENARIO PARAMETERS
            </h2>
            <Sliders className="w-4 h-4 text-[#2563EB]" />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Primary Disruption Scenario
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
              >
                <option value="route_r2_submerged">
                  What if Causeway Bridge R2 is Submerged?
                </option>
                <option value="ambulance_shortage">
                  What if Agent / Ambulance Fleet is Reduced?
                </option>
                <option value="compound_cyclone">
                  What if Compound Cyclone + Power Outage Strikes?
                </option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Available ALS Ambulances
                </span>
                <span className="font-extrabold text-[#2563EB]">{ambulanceCount} / 8 Units</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={ambulanceCount}
                onChange={(e) => setAmbulanceCount(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Precipitation Intensity
                </span>
                <span className="font-extrabold text-[#EAB308]">{rainIntensity} mm/hr</span>
              </div>
              <input
                type="range"
                min={20}
                max={150}
                step={5}
                value={rainIntensity}
                onChange={(e) => setRainIntensity(Number(e.target.value))}
                className="w-full accent-[#EAB308] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Simulate Shelter 2 Structural Closure
                </span>
                <span className="text-[11px] text-slate-500">
                  Forces immediate reallocation of 1,500 evacuee slots
                </span>
              </div>
              <input
                type="checkbox"
                checked={shelter2Closed}
                onChange={(e) => setShelter2Closed(e.target.checked)}
                className="w-4 h-4 accent-[#DC2626] rounded cursor-pointer"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={simulating}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-mono font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'EXECUTING MONTE CARLO...' : 'RUN SIMULATION'}</span>
            </button>
          </div>
        </div>

        {/* Right: Counterfactual Comparison Output */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7C3AED] block">
                WHAT IF SIMULATION REPORT
              </span>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">
                "{simResult.scenarioName}"
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#16A34A]">
              {simResult.confidenceScore}% Confidence
            </span>
          </div>

          {/* Side-by-Side Current Plan vs Simulated Plan */}
          {showCompare && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  CURRENT PLAN (PLAN V{activeMission?.planVersion || 1})
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ETA: {simResult.baselineEta}
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <div>Primary Corridor: Route R2 Bridge</div>
                  <div>Fleet Assigned: 8 ALS Units</div>
                  <div>Risk Exposure: Nominal</div>
                </div>
              </div>

              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/25 rounded-xl border border-purple-300 dark:border-purple-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#7C3AED] dark:text-purple-400 block">
                  SIMULATED PLAN (PLAN V{activeMission?.planVersion || 1}-A)
                </span>
                <div className="text-2xl font-extrabold text-[#7C3AED] dark:text-purple-300">
                  ETA: {simResult.simulatedEta}{' '}
                  <span className="text-xs text-amber-600">({simResult.etaDelta})</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 pt-1">
                  <div>
                    Tasks affected: <strong>{simResult.tasksAffected}</strong>
                  </div>
                  <div>
                    Resources changed: <strong>{simResult.resourcesChanged}</strong>
                  </div>
                  <div>
                    Risk: <strong className="text-amber-600">{simResult.riskLevel}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Synthesized Mitigations */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              AI SYNTHESIZED RECOVERY ACTIONS
            </span>
            <ul className="space-y-1.5 font-mono text-slate-800 dark:text-slate-200">
              {(simResult.mitigations || []).map((m: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={applyingPlan}
              onClick={handleApplySimulatedPlan}
              className="px-5 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{applyingPlan ? 'PROMOTING PLAN...' : 'APPLY SIMULATED PLAN TO ACTIVE MISSION'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
