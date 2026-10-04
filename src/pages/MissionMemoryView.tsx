import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import {
  Brain,
  History,
  Archive,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Flame,
  Wheat,
  Building,
  HeartPulse,
  Package,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HistoricalMemoryRecord {
  id: string;
  domain: string;
  title: string;
  year: string;
  outcomeStatus: '100% Verified' | '94% Success' | 'Strategy Archived';
  survivorsProtected: string;
  disruptionsEncountered: string[];
  successfulStrategy: string;
  failureLessons: string;
  reusablePatterns: string[];
}

export const MissionMemoryView: React.FC = () => {
  const { activeMission, plans, t } = useMission();

  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');

  const historicalMemories: HistoricalMemoryRecord[] = [
    {
      id: 'mem-01',
      domain: 'emergency',
      title: 'Monsoon 2024 Basin Flash Flood (Sector 2 & 3)',
      year: 'August 2024',
      outcomeStatus: '100% Verified',
      survivorsProtected: '6,450 Citizens',
      disruptionsEncountered: [
        'Bridge B-4 washed away at KM 18',
        'VHF repeater battery flooded',
      ],
      successfulStrategy: 'Immediate mobilization of high-clearance military flatbeds + drone mesh repeater deployment at 150m.',
      failureLessons: 'Waiting 35 minutes for human authorization of van commandeering delayed casualty triage. Established Pre-Authorized Emergency Declaration Protocol for 2026.',
      reusablePatterns: [
        'Autonomous bypass corridor synthesizer',
        'Multi-shelter dynamic intake load balancing',
        'Optical gate headcount verification',
      ],
    },
    {
      id: 'mem-02',
      domain: 'agriculture',
      title: 'Vidarbha Unseasonal Hailstorm DBT Damage Assessment',
      year: 'November 2025',
      outcomeStatus: '100% Verified',
      survivorsProtected: '14,200 Farmers',
      disruptionsEncountered: [
        'Dense cloud cover blinded optical Sentinel-2 imagery',
        'Land registry parcel ID discrepancies',
      ],
      successfulStrategy: 'Pivoted to synthetic aperture radar (SAR) soil backscatter penetration and cross-referenced Aadhaar-seeded PM-KISAN bank accounts.',
      failureLessons: 'Manual ground surveyor re-inspections created 12-day bottleneck. Replaced with drone swarm automated geo-tagged video audits.',
      reusablePatterns: [
        'SAR radar microwave penetration pipeline',
        'Direct Benefit Transfer smart ledger cutover',
      ],
    },
    {
      id: 'mem-03',
      domain: 'logistics',
      title: 'Disrupted Cold-Chain Insulin Multi-State Corridor',
      year: 'March 2025',
      outcomeStatus: '94% Success',
      survivorsProtected: '88,000 Doses Preserved',
      disruptionsEncountered: [
        'National Highway 48 landslide block (KM 140)',
        'Secondary cooling compressor fuse blew',
      ],
      successfulStrategy: 'Autonomous telemetry alarm detected internal reefer temperature rising to 5.8°C; auto-routed convoy to nearest dry-ice cryogenic depot.',
      failureLessons: 'Single-carrier SIM cards suffered roaming dropout in mountain gorges. Mandated dual-SIM satellite hybrid modems.',
      reusablePatterns: [
        'Sub-second thermal telemetry trigger',
        'Autonomous cryo-depot emergency diversion',
      ],
    },
    {
      id: 'mem-04',
      domain: 'healthcare',
      title: 'Regional Respiratory Surge ICU Bed & Oxygen Balancing',
      year: 'January 2025',
      outcomeStatus: '100% Verified',
      survivorsProtected: '4,100 Acute Patients',
      disruptionsEncountered: [
        'Liquid medical oxygen tank leak in District Hospital',
        'Pediatric ICU beds 100% saturated',
      ],
      successfulStrategy: 'Orchestrated mutual-aid bed swaps across 6 peripheral private hospitals with automated digital government reimbursement vouchers.',
      failureLessons: 'Inter-hospital patient transfers experienced ambulance queuing. Built centralized dispatch slot reservation queue.',
      reusablePatterns: [
        'Regional ICU bed dynamic balancing algorithm',
        'Government mutual-aid voucher auto-issuance',
      ],
    },
    {
      id: 'mem-05',
      domain: 'government',
      title: 'Multi-Department Citizen Flood Compensation Audit',
      year: 'October 2024',
      outcomeStatus: '100% Verified',
      survivorsProtected: '22,000 Beneficiaries',
      disruptionsEncountered: [
        'Duplicate compensation claims submitted across 3 tehsils',
        'Incomplete bank IFSC codes',
      ],
      successfulStrategy: 'Executed SHA-256 deduplication hash chain across Revenue, Municipal, and Civil Defense registries simultaneously.',
      failureLessons: 'Paper death certificates delayed orphan grant disbursals. Established direct hospital digital birth/death registry bridge.',
      reusablePatterns: [
        'Tamper-proof cryptographic deduplication',
        'Direct treasury single-click batch disbursal',
      ],
    },
  ];

  const filteredMemories = historicalMemories.filter(
    (m) => selectedDomainFilter === 'all' || m.domain === selectedDomainFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>EPISODIC & SEMANTIC MISSION MEMORY</span>
            <span aria-hidden="true">·</span>
            <span>HISTORICAL STRATEGY REPOSITORY</span>
          </div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            Institutional Mission Memory & Historical Benchmarks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            PLANOVA AI archives completed mission outcomes, operational failures, and successful adaptation strategies across 5 core verticals to continuously refine future autonomous plans.
          </p>
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs font-mono shadow-xs">
          <button
            onClick={() => setSelectedDomainFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDomainFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            All Verticals
          </button>
          <button
            onClick={() => setSelectedDomainFilter('emergency')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDomainFilter === 'emergency'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setSelectedDomainFilter('agriculture')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDomainFilter === 'agriculture'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Agriculture
          </button>
          <button
            onClick={() => setSelectedDomainFilter('logistics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDomainFilter === 'logistics'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Logistics
          </button>
          <button
            onClick={() => setSelectedDomainFilter('healthcare')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDomainFilter === 'healthcare'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Healthcare
          </button>
        </div>
      </div>

      {/* CLEAR VISUAL DEMARCATION BANNER (Requirement 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box A: Real-Time Active Mission */}
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME ACTIVE MISSION DATA
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            {activeMission?.title} (Plan v{plans[plans.length - 1].version})
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Real-time execution with active sensor sweeps, dynamic rerouting via Bypass R4, and live survivor accountability.
          </p>
        </div>

        {/* Box B: Historical Memory Isolation */}
        <div className="p-4 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              HISTORICAL BENCHMARK REPOSITORY (READ-ONLY)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              5 VERIFIED EPISODES
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            Immutable Historical Strategy Library
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Pre-computed operational heuristics, past failure root-causes, and validated casualty survival playbooks.
          </p>
        </div>
      </div>

      {/* HISTORICAL MEMORIES ARCHIVE LIST */}
      <div className="space-y-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{mem.domain}</span>
                  <span>·</span>
                  <span>{mem.year}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{mem.survivorsProtected}</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white mt-0.5">
                  {mem.title}
                </h3>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {mem.outcomeStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Disruptions Encountered */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-400 uppercase text-[10px] block">
                  Disruptions & Shocks Encountered
                </span>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-sans">
                  {mem.disruptionsEncountered.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Successful Strategy */}
              <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-1.5">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase text-[10px] block">
                  Proven Successful Adaptation Strategy
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                  {mem.successfulStrategy}
                </p>
              </div>

              {/* Failure Lessons & Reusable Patterns */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] block">
                  Key Institutional Takeaway
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-[11px]">
                  {mem.failureLessons}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Reusable Patterns:</span>
                {mem.reusablePatterns.map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                <span>View Cryptographic Outcome Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
