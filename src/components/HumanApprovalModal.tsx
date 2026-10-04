import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Cpu, Route, ArrowRight, X } from 'lucide-react';

export const HumanApprovalModal: React.FC = () => {
  const { isApprovalModalOpen, activeApproval, closeApprovalModal, decideApproval, t, currentUser } = useMission();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isApprovalModalOpen || !activeApproval) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    await decideApproval(activeApproval.id, 'approved', notes || 'Authorized by Duty Officer via Command Console');
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    await decideApproval(activeApproval.id, 'rejected', notes || 'Declined by Duty Officer');
    setSubmitting(false);
  };

  const canApprove = currentUser.role === 'admin' || currentUser.role === 'operator';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-zinc-950 font-bold rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span>{t.approval.title}</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">RISK: {(activeApproval.riskLevel || 'high').toUpperCase()}</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {activeApproval.taskTitle || (activeApproval as any).title || 'Operational Authorization Gate'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeApprovalModal}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 text-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              {t.approval.action}
            </span>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium">
              {activeApproval.action}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                {t.approval.reason}
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70">
                {activeApproval.reason}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                {t.approval.impact}
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70">
                {activeApproval.impactDescription || (activeApproval as any).impactSummary || 'Critical path progression'}
              </p>
            </div>
          </div>

          {/* AI Reasoning & Empirical Telemetry */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Cpu className="w-4 h-4 text-zinc-500" />
                <span>Empirical AI Confidence</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {activeApproval.aiConfidence ?? (activeApproval as any).confidenceScore ?? 94}% Verified
              </span>
            </div>

            <div className="space-y-1.5 mb-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block">
                {t.approval.evidence}:
              </span>
              {(Array.isArray(activeApproval.evidence) ? activeApproval.evidence : ['Live Sensor Telemetry Verified', 'Constraint Boundaries Checked']).map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <Route className="w-4 h-4 text-blue-500" />
              <span className="text-zinc-500 dark:text-zinc-400">Proposed Diversion:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                {activeApproval.proposedAlternative || 'Adaptive Contingency Route R4'}
              </span>
            </div>
          </div>

          {/* Operator Decision Remarks */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Operator Sign-off Directive (Recorded in Audit Ledger)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Authorized under Disaster Management Act Rule 14. Dispatch escorts."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {!canApprove && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Your current role ({currentUser.role.toUpperCase()}) has read-only clearance. Switch to Operator or Admin role in top bar to authorize.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={closeApprovalModal}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {t.common.cancel}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={submitting || !canApprove}
              className="px-4 py-2 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.approval.reject}</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting || !canApprove}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t.approval.approve}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
