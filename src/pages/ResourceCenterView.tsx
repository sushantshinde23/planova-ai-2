import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { ResourceItem } from '../types';
import {
  Truck,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ResourceCenterView: React.FC = () => {
  const {
    resources,
    triggerDisruption,
    setSelectedPlanVersion,
    updateResourceAllocation,
    provisionResource,
  } = useMission();

  const [filterType, setFilterType] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Add new resource modal state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<'vehicle' | 'shelter' | 'personnel' | 'equipment' | 'medical'>('vehicle');
  const [newTotal, setNewTotal] = useState<number>(10);
  const [newLocation, setNewLocation] = useState<string>('Central Command Depot');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const filteredResources = resources.filter(
    (r) => filterType === 'all' || r.type === filterType
  );

  const handleAdjustFleet = async (res: ResourceItem, delta: number) => {
    setUpdatingId(res.id);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const nextTotal = Math.max(1, res.total + delta);
      const nextAvailable = Math.max(0, res.available + delta);
      const nextInUse = Math.min(nextTotal, res.inUse);
      const util = nextTotal > 0 ? nextInUse / nextTotal : 0;
      const nextStatus: ResourceItem['status'] =
        util >= 0.9 ? 'critical' : util >= 0.75 ? 'constrained' : 'optimal';

      await updateResourceAllocation(res.id, {
        total: nextTotal,
        available: nextAvailable,
        inUse: nextInUse,
        status: nextStatus,
      });

      if (res.id === 'res-amb-als' && delta < 0 && nextTotal <= 5) {
        await triggerDisruption('ambulance_reduced');
        setSelectedPlanVersion(3);
      }

      setStatusMessage(`Persisted allocation update for ${res.name} (${nextTotal} total).`);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update resource allocation on backend.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const created = await provisionResource({
        name: newName.trim(),
        type: newType,
        total: Number(newTotal) || 10,
        available: Number(newTotal) || 10,
        allocated: 0,
        inUse: 0,
        unit: newType === 'vehicle' ? 'units' : newType === 'personnel' ? 'responders' : 'assets',
        location: newLocation.trim() || 'Sector Staging Point',
        status: 'optimal',
      });
      setIsAddOpen(false);
      setNewName('');
      setStatusMessage(`Provisioned and saved ${created.name} to database.`);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to provision new resource.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#64748b]">
            <span>MULTI-ECHELON RESOURCE ALLOCATION</span>
            <span aria-hidden="true">·</span>
            <span>PERSISTENT INVENTORY</span>
          </div>
          <h1 className="text-xl font-black text-[#0f172a] dark:text-white tracking-tight">
            Resource Inventory & Fleet Allocation
          </h1>
          <p className="text-xs text-[#64748b] max-w-2xl mt-1">
            Track and dynamically reallocate vehicles, triage shelters, specialized personnel, and equipment across active operational theaters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Resource</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await triggerDisruption('ambulance_reduced');
              setSelectedPlanVersion(3);
            }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Sudden Ambulance Reduction (8 → 5)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Provision Resource Modal */}
      {isAddOpen && (
        <div className="p-5 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-xl shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-[#0f172a] dark:text-white">
              Provision New Operational Resource
            </h2>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateResource} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Resource Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Amphibious Rescue Unit"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Resource Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-lg"
              >
                <option value="vehicle">Vehicle</option>
                <option value="shelter">Shelter</option>
                <option value="personnel">Personnel</option>
                <option value="equipment">Equipment</option>
                <option value="medical">Medical</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Total Capacity</label>
              <input
                type="number"
                min={1}
                required
                value={newTotal}
                onChange={(e) => setNewTotal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Staging Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#172554] dark:bg-[#2563eb] text-white font-semibold rounded-lg shrink-0 cursor-pointer"
                >
                  {isCreating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-xl text-xs overflow-x-auto">
        {['all', 'vehicle', 'shelter', 'personnel', 'equipment'].map((tp) => (
          <button
            key={tp}
            onClick={() => setFilterType(tp)}
            className={`px-3 py-1.5 font-medium rounded-lg capitalize transition-colors cursor-pointer ${
              filterType === tp
                ? 'bg-[#172554] dark:bg-[#2563eb] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] dark:hover:text-white'
            }`}
          >
            {tp === 'all' ? 'All Resources' : `${tp}s`}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const utilPct = res.total > 0 ? Math.round((res.inUse / res.total) * 100) : 0;
          const isUpdating = updatingId === res.id;
          return (
            <div
              key={res.id}
              className="p-5 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-xl shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#64748b] font-bold block">
                    {res.type.toUpperCase()} · {res.location}
                  </span>
                  <h3 className="text-sm font-bold text-[#0f172a] dark:text-slate-100 line-clamp-1 mt-0.5">
                    {res.name}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize border ${
                    res.status === 'constrained' || res.status === 'critical'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748b]">Utilization Rate</span>
                  <span className="font-bold text-[#0f172a] dark:text-slate-100">{utilPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      utilPct >= 90 ? 'bg-rose-500' : utilPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, utilPct)}%` }}
                  ></div>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-4 gap-1 p-2.5 bg-[#f8fafc] dark:bg-slate-800/40 rounded-lg text-center font-mono text-[11px] border border-[#e2e8f0] dark:border-slate-800/70">
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Total</span>
                  <span className="font-bold text-[#0f172a] dark:text-slate-100">{res.total}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Avail</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{res.available}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Alloc</span>
                  <span className="font-bold text-[#2563eb] dark:text-blue-400">{res.allocated}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">In Use</span>
                  <span className="font-bold text-[#6366f1] dark:text-indigo-400">{res.inUse}</span>
                </div>
              </div>

              {/* Operator Pool Tuning Controls (Persisted for all resources) */}
              <div className="pt-2 border-t border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#64748b] font-mono">
                  {isUpdating ? 'Persisting...' : 'Adjust Pool Capacity:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleAdjustFleet(res, -1)}
                    className="p-1 rounded bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0f172a] dark:text-slate-200 border border-[#e2e8f0] dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    title="Reduce available capacity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold px-1.5 text-[#0f172a] dark:text-slate-100">
                    {res.total}
                  </span>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleAdjustFleet(res, 1)}
                    className="p-1 rounded bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0f172a] dark:text-slate-200 border border-[#e2e8f0] dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    title="Reinforce capacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
