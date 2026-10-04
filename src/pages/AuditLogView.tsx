import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { AuditLogEntry } from '../types';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Shield,
  Layers,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useMission();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || log.riskLevel === riskFilter;
    const matchesResult = resultFilter === 'all' || log.result === resultFilter;
    return matchesSearch && matchesRisk && matchesResult;
  });

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Mission', 'Agent', 'Action', 'Tool', 'User', 'Risk', 'Result', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.missionTitle}"`,
      `"${l.agent}"`,
      `"${l.action}"`,
      `"${l.toolUsed || 'None'}"`,
      `"${l.user}"`,
      l.riskLevel,
      l.result,
      `"${l.details}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PLANOVA-Audit-Ledger-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>IMMUTABLE OPERATIONAL AUDIT TRAIL</span>
            <span aria-hidden="true">·</span>
            <span>REGULATORY COMPLIANCE</span>
          </div>
          <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
            System Audit Log & Decision Ledger
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl mt-1">
            Every autonomous task execution, telemetry shock detection, re-planning trigger, and human operator approval is immutably timestamped.
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Dossier (.CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search actions, agents, directives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 w-64"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono"
          >
            <option value="all">All Results</option>
            <option value="success">Success</option>
            <option value="re-planned">Re-planned</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Showing {filteredLogs.length} verified records
        </span>
      </div>

      {/* Audit Log Table (Requirement 28) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">Tool Invocations</th>
                <th className="p-3">Authority / User</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {log.agent}
                  </td>
                  <td className="p-3 max-w-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {log.details}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {log.toolUsed || 'Internal Pipeline'}
                  </td>
                  <td className="p-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.riskLevel === 'critical'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : log.riskLevel === 'high'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {log.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        log.result === 'success'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : log.result === 're-planned'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {log.result === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      {log.result === 're-planned' && <RotateCcw className="w-3.5 h-3.5 text-purple-500" />}
                      {log.result === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      <span className="capitalize">{log.result}</span>
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
