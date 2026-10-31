/**
 * SupplyGuard AI - Human Approval & Audit Log Console
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ApprovalRecord, AuditLogItem } from '../shared/types.ts';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  Send,
  FileCheck2,
} from 'lucide-react';

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [approverName, setApproverName] = useState('Dr. Sarah Chen');
  const [approverRole, setApproverRole] = useState('VP of Global Supply Operations');
  const [justificationNotes, setJustificationNotes] = useState('Authorized pursuant to operational resilience protocol.');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const app = await api.getApprovals();
      setApprovals(app.approvals);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalId) return;

    setActionLoading(true);
    try {
      await api.decideApproval({
        approvalId: activeModalId,
        decision,
        approverName,
        approverRole,
        justificationNotes,
      });
      setActiveModalId(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const pastApprovals = approvals.filter((a) => a.status !== 'pending');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Human Approval & Governance Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Responsible AI enforcement: AI autonomous agents formulate recommendations; authorized human operators hold execution sign-off.
        </p>
      </div>

      {/* Pending Approvals Queue */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Pending Executive Authorizations</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingApprovals.length} Pending
            </span>
          </div>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">All autonomous recommendations are actioned.</p>
            <p className="text-slate-500 text-[11px]">New recovery plans submitted from the Recovery page will appear here for review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      {app.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-bold text-white">{app.planTitle}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono flex items-center gap-4 pt-1">
                    <span>Outlay: ${app.estimatedCostUSD.toLocaleString()}</span>
                    <span>·</span>
                    <span className="text-emerald-400">SLA Shield: {app.slaPreservationPercent}%</span>
                    <span>·</span>
                    <span className="text-slate-500">
                      Requested: {new Date(app.requestedTimestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setActiveModalId(app.id);
                      setDecision('approved');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveModalId(app.id);
                      setDecision('rejected');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Sign-off Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                Executive Action Authorization
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Record Decision on Plan {activeModalId}
              </h3>
            </div>

            <form onSubmit={handleExecuteDecision} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Decision Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      decision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Authorize Execution
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      decision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Reject Plan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Authorizer Full Name</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Title & Authority Role</label>
                <input
                  type="text"
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Justification & Audit Statement</label>
                <textarea
                  rows={3}
                  value={justificationNotes}
                  onChange={(e) => setJustificationNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg"
                >
                  {actionLoading ? 'Recording...' : 'Commit Audit Signature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Immutable System Audit Log */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Full System Audit Ledger</h3>
          <span className="text-xs font-mono text-slate-500">{auditLogs.length} Events Logged</span>
        </div>

        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-cyan-400 font-bold uppercase">{log.eventType.replace('_', ' ')}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 font-sans font-medium">{log.actor}</span>
                </div>
                <p className="text-slate-400 text-xs font-sans">{log.details}</p>
              </div>

              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
