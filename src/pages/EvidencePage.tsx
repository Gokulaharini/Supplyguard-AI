/**
 * SupplyGuard AI - Evidence & Audit Traceability Matrix
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { EvidenceRecord } from '../shared/types.ts';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Search,
  Filter,
  ArrowRight,
  Database,
} from 'lucide-react';

export function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvidence() {
      try {
        setLoading(true);
        const data = await api.getEvidence();
        setEvidenceList(data.evidenceTrace || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvidence();
  }, []);

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesFilter = filterType === 'all' || item.sourceType === filterType;
    const matchesSearch =
      searchQuery === '' ||
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.conclusion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceEntity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'known_data':
        return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40';
      case 'calculated_estimate':
        return 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/40';
      case 'simulation_assumption':
        return 'bg-amber-950/70 text-amber-400 border border-amber-800/40';
      case 'missing_info_warning':
        return 'bg-rose-950/70 text-rose-400 border border-rose-800/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Evidence & Mathematical Traceability</h1>
        <p className="text-xs text-slate-400 mt-1">
          Full algorithmic audit trail: Source ERP data → Mathematical formulas → Impact findings → Recovery recommendations.
        </p>
      </div>

      {/* Audit Pipeline Diagram Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {[
          { step: '01. Raw Telemetry', desc: 'On-hand stock & burn rates', type: 'Known Data' },
          { step: '02. Deterministic Math', desc: 'Depletion rate formulas', type: 'Calculated' },
          { step: '03. Downstream Impact', desc: 'Stockout date & SLA liability', type: 'Validated Finding' },
          { step: '04. Recovery Action', desc: 'Feasible constrained dispatch', type: 'Approved Mitigation' },
        ].map((st, sIdx) => (
          <React.Fragment key={sIdx}>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{st.type}</span>
              <h4 className="text-xs font-bold text-white">{st.step}</h4>
              <p className="text-[11px] text-slate-400">{st.desc}</p>
            </div>
            {sIdx < 3 && <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search claim, entity, rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'known_data', label: 'Known Data' },
            { id: 'calculated_estimate', label: 'Calculated Estimates' },
            { id: 'simulation_assumption', label: 'Simulation Assumptions' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Records List */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            No evidence records matched current filter criteria.
          </div>
        ) : (
          filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${getBadgeStyle(ev.sourceType)}`}>
                    {ev.sourceType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-white">{ev.claim}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                  <span>Source: {ev.sourceEntity}</span>
                  <span>·</span>
                  <span>Confidence: {(ev.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Conclusion & Formula */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="text-slate-200 leading-relaxed font-sans">{ev.conclusion}</div>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-cyan-400/90">
                  <span>Deterministic Rule: {ev.formulaOrRule}</span>
                </div>
              </div>

              {/* Input Parameters */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 text-[10px] uppercase">Grounded Parameters:</span>
                {Object.entries(ev.inputParameters).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-300">
                    {k}: <span className="text-white font-semibold">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
