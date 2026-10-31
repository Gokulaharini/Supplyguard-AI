/**
 * SupplyGuard AI - Downstream Impact & Blast Radius Analysis
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ImpactAssessment } from '../shared/types.ts';
import {
  DollarSign,
  AlertTriangle,
  Factory,
  PackageX,
  FileCheck2,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface ImpactAnalysisPageProps {
  onNavigate: (tab: string) => void;
}

export function ImpactAnalysisPage({ onNavigate }: ImpactAnalysisPageProps) {
  const [impact, setImpact] = useState<ImpactAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        setLoading(true);
        const data = await api.getImpact();
        setImpact(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  if (loading || !impact) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono text-slate-500">Calculating downstream blast radius...</span>
      </div>
    );
  }

  const isNominal = impact.totalFinancialImpactUSD === 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Downstream Impact & SLA Exposure</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic quantitative calculation of factory stockout dates, production stalls, and customer contractual liquidated damages.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recovery')}
          className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
        >
          <span>Formulate Autonomous Recovery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Financial Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Financial Exposure</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            ${(impact.totalFinancialImpactUSD / 1000000).toFixed(2)}M
          </div>
          <p className="text-xs text-slate-500">Unmitigated baseline financial liability</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contractual SLA Damages</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            ${impact.totalSlaPenaltiesUSD.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Across {impact.affectedOrders.length} delayed customer contracts
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Factory Production Deficit</span>
            <PackageX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {impact.totalProductionDeficitUnits.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">Units</span>
          </div>
          <p className="text-xs text-slate-500">Unabsorbed fixed overhead & idle labor costs</p>
        </div>
      </div>

      {/* Factory Buffer Exhaustion & Stockout Timelines */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Factory Days of Inventory Remaining (Stockout Forecast)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Days until assembly lines exhaust raw material on-hand buffer and halt production.
          </p>
        </div>

        {impact.affectedFactories.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            All factories maintain inventory buffers exceeding disruption horizons. Zero line stalls.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impact.affectedFactories.map((fact) => {
              const days = fact.firstStockoutDay;
              const isSevere = days < 3;
              return (
                <div
                  key={fact.factoryId}
                  className={`p-4 rounded-xl border bg-slate-950 space-y-3 ${
                    isSevere ? 'border-rose-800/60' : 'border-amber-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fact.factoryName}</span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        isSevere ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {days} Days to Zero Stock
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Production Loss:</span>
                      <span className="font-mono text-slate-200">
                        {fact.productionLossUnits.toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Idle Line OpEx:</span>
                      <span className="font-mono text-slate-200">
                        ${fact.financialLossUSD.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stockout Timeline Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Buffer Depletion Rate</span>
                      <span>Day {days} Stall</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isSevere ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (days / 14) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Affected Customer Orders Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">At-Risk Customer Commitments & SLA Penalties</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific commercial purchase orders facing delivery delays and contractual liquidated damages.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{impact.affectedOrders.length} Contracts Impacted</span>
        </div>

        {impact.affectedOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Zero customer orders delayed. 100% SLA preservation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Customer Enterprise</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Promised Delivery</th>
                  <th className="pb-3 px-3">Forecast Delivery</th>
                  <th className="pb-3 px-3">Delay</th>
                  <th className="pb-3 px-3 text-right">Contractual Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {impact.affectedOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-semibold">{ord.orderId}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">{ord.customerName}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          ord.priority === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {ord.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">Day {ord.promisedDay}</td>
                    <td className="py-3 px-3 text-rose-400 font-semibold">Day {ord.estimatedDay}</td>
                    <td className="py-3 px-3 text-rose-300">+{ord.delayDays} Days</td>
                    <td className="py-3 px-3 text-right text-rose-400 font-bold">
                      ${ord.penaltyUSD.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supporting Evidence Chain */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Mathematical Traceability & Evidence Records</h3>
          </div>
          <button
            onClick={() => onNavigate('evidence')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View Full Traceability Ledger
          </button>
        </div>

        <div className="space-y-2.5">
          {impact.evidenceTrace.slice(0, 3).map((ev) => (
            <div key={ev.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">{ev.claim}</span>
                <span className="font-mono text-cyan-400 text-[10px] uppercase">{ev.sourceType.replace('_', ' ')}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-mono">{ev.conclusion}</p>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3 pt-1 border-t border-slate-800/60">
                <span>Rule: {ev.formulaOrRule}</span>
                <span>·</span>
                <span>Confidence: {(ev.confidenceScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
