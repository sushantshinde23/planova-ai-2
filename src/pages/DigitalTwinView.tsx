import React, { useState, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  Route,
  Shield,
  ShieldAlert,
  Sparkles,
  Truck,
  Users,
  Zap,
} from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const {
    activeMission,
    tasks,
    resources,
    plans,
    selectedPlanVersion,
    setSelectedPlanVersion,
    triggerDisruption,
    t,
  } = useMission();

  const [activeZone, setActiveZone] = useState<string>('sector-4');
  const [pulseTick, setPulseTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const currentPlan = plans.find((p) => p.version === selectedPlanVersion) || plans[0];
  const activeTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified');
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'planned' || t.status === 'waiting_approval');

  const isR2Blocked = selectedPlanVersion >= 2;
  const isFleetReduced = selectedPlanVersion >= 3;

  const fleetStatus = [
    { id: 'A-1', model: 'ALS Ambulance Type 4', route: isR2Blocked ? 'Bypass R4 (Elevated)' : 'Route R2 (Causeway)', speed: isR2Blocked ? '48 km/h' : '0 km/h (HALTED)', fuel: '84%', patients: 4, status: isR2Blocked ? 'In Transit' : 'Hazard Stopped' },
    { id: 'A-2', model: 'ALS Ambulance Type 4', route: isR2Blocked ? 'Bypass R4 (Elevated)' : 'Route R2 (Causeway)', speed: isR2Blocked ? '52 km/h' : '0 km/h (HALTED)', fuel: '79%', patients: 3, status: isR2Blocked ? 'In Transit' : 'Hazard Stopped' },
    { id: 'A-3', model: 'ALS Ambulance Type 3', route: 'Expressway R1 North', speed: '64 km/h', fuel: '91%', patients: 4, status: 'Approaching Shelter 2' },
    { id: 'A-4', model: 'ALS Ambulance Type 3', route: 'Expressway R1 North', speed: '0 km/h (Staged)', fuel: '95%', patients: 0, status: 'Unloading at S2' },
    { id: 'A-5', model: 'ALS Ambulance Type 2', route: 'Southern Connector R3', speed: '58 km/h', fuel: '72%', patients: 2, status: 'Arrived at Shelter 3' },
    { id: 'A-6', model: 'ALS Ambulance Type 2', route: isFleetReduced ? 'DIVERTED: Mountain Landslide' : 'Southern Connector R3', speed: isFleetReduced ? '75 km/h (Off-grid)' : '60 km/h', fuel: '68%', patients: isFleetReduced ? 0 : 3, status: isFleetReduced ? 'External Triage' : 'En route S3' },
    { id: 'A-7', model: 'ALS Ambulance Type 1', route: isFleetReduced ? 'DIVERTED: Mountain Landslide' : 'Expressway R1 North', speed: isFleetReduced ? '78 km/h (Off-grid)' : '55 km/h', fuel: '88%', patients: isFleetReduced ? 0 : 2, status: isFleetReduced ? 'External Triage' : 'ICU Transit' },
    { id: 'A-8', model: 'ALS Ambulance Type 1', route: isFleetReduced ? 'DIVERTED: Mountain Landslide' : 'Sector 4 Staging Alpha', speed: isFleetReduced ? '70 km/h (Off-grid)' : '15 km/h (Staging)', fuel: '82%', patients: isFleetReduced ? 0 : 1, status: isFleetReduced ? 'External Triage' : 'Staged Alpha' },
  ];

  const shelters = [
    { id: 'S1', name: 'Shelter 1 — North Ridge Community Center', capCurrent: 1120, capMax: 1500, status: 'Optimal Intake', power: 'Grid + Solar Backup', icuBeds: '18 / 20' },
    { id: 'S2', name: 'Shelter 2 — Civic Stadium & Trauma Wing', capCurrent: 1580, capMax: 2000, status: 'Heavy Trauma Intake', power: 'Auxiliary Generator Active', icuBeds: '38 / 40' },
    { id: 'S3', name: 'Shelter 3 — Holy Cross Pediatric Wing', capCurrent: 690, capMax: 1000, status: 'Pediatric & Maternity', power: 'Grid Normal', icuBeds: '12 / 15' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>REAL-TIME MISSION DIGITAL TWIN</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              TELEMETRY SYNCED (TICK #{pulseTick})
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            Physical Operating Environment Digital Twin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            Real-time cyber-physical mirror of active tasks, emergency assets, transit corridors, and dynamic field telemetry for {activeMission?.title}.
          </p>
        </div>

        {/* Live Disruption Test Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerDisruption('route_r2_blocked');
              setSelectedPlanVersion(2);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isR2Blocked
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isR2Blocked ? 'Route R2 Submerged (Active)' : 'Inject Flood Breach'}</span>
          </button>

          <button
            onClick={() => {
              triggerDisruption('ambulance_reduced');
              setSelectedPlanVersion(3);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isFleetReduced
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isFleetReduced ? 'Fleet Scarcity (Active)' : 'Inject Fleet Scarcity'}</span>
          </button>
        </div>
      </div>

      {/* METRICS SPEEDOMETER / GAUGES BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
            Active / Executing Tasks
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono flex items-center gap-2">
            <span>{activeTasks.length}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
            {completedTasks.length} resolved · {pendingTasks.length} queued
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
            Evacuation Clearance Progress
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {activeMission?.progress || 58}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${activeMission?.progress || 58}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
            Fleet Deployment Status
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {isFleetReduced ? '5 / 8 ALS Units' : '8 / 8 ALS Units'}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
            {isFleetReduced ? '3 Diversions Authorized' : '100% On Mission Corridor'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
            Casualty Accountability
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>0 Fatalities</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
            3,390 Citizens Safely Sheltered
          </span>
        </div>
      </div>

      {/* DIGITAL TWIN 3D / SCHEMATIC VISUALIZATION CANVAS */}
      <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        {/* Tactical Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                SECTOR 4 FLOOD PLAIN · GEODETIC ELEVATION GRID
              </span>
              <h2 className="text-base font-bold text-white">
                Live Physical Infrastructure & Corridors Status
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Plan v{selectedPlanVersion} Active
            </span>
          </div>
        </div>

        {/* Isometric Corridor Nodes Schematic */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Node 1: Epicenter Staging Alpha */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                STAGING POINT ALPHA
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                EVACUATION ZONE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Riverbank Sector 4 epicenter. 4,200 vulnerable residents registered. First responder triage tent operational.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Water Crest: 0.92m</span>
              <span className="text-emerald-400 font-bold">14 Convoys Dispatched</span>
            </div>
          </div>

          {/* Node 2: Arterial Route R2 & Alternate R4 */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            isR2Blocked
              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 ${isR2Blocked ? 'text-rose-400' : 'text-slate-300'}`}>
                <Route className="w-3.5 h-3.5" />
                ROUTE R2 vs BYPASS R4
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isR2Blocked
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {isR2Blocked ? 'R2 CLOSED → R4 ACTIVE' : 'R2 OPEN (MONITORED)'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed font-sans">
              {isR2Blocked
                ? 'Causeway Bridge R2 submerged past safety clearance. PLANOVA AI autonomously detoured all ambulances to Elevated Bypass R4.'
                : 'Primary causeway operational. Continuous IoT hydrometric depth sensors polling every 1 second.'}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span>Bypass Clearance: +14m elevation</span>
              <span className="text-amber-400 font-bold">+9 min detour delta</span>
            </div>
          </div>

          {/* Node 3: Medical Relief Shelters */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                RELIEF DESTINATIONS (S1-S3)
              </span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                SAFE HAVENS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              3 designated facilities: North Ridge, Civic Stadium, and Holy Cross Pediatric. Biometric headcount cross-referenced in real-time.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Total Intake: 3,390 / 4,500</span>
              <span className="text-emerald-400 font-bold">75% Capacity</span>
            </div>
          </div>
        </div>

        {/* Shelters Telemetry Table */}
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Field Shelter Occupancy & Life Support Gauges:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            {shelters.map((s) => {
              const pct = Math.round((s.capCurrent / s.capMax) * 100);
              return (
                <div key={s.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-emerald-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Intake: {s.capCurrent} / {s.capMax}</span>
                    <span>ICU Beds: {s.icuBeds}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE FLEET TELEMETRY IN MOTION TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">
              Emergency Fleet Telemetry & Dynamic Corridor Routing
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time GPS Tracking via Google Maps Platform API
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase text-slate-400 font-bold">
              <tr>
                <th className="py-2.5 px-4">Vehicle ID</th>
                <th className="py-2.5 px-4">Model & Equipment</th>
                <th className="py-2.5 px-4">Active Route</th>
                <th className="py-2.5 px-4">Speed / Telemetry</th>
                <th className="py-2.5 px-4">Fuel</th>
                <th className="py-2.5 px-4">Patients</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fleetStatus.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{v.id}</td>
                  <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{v.model}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{v.route}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{v.speed}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{v.fuel}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{v.patients}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status.includes('Hazard')
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : v.status.includes('Diverted') || v.status.includes('External')
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
