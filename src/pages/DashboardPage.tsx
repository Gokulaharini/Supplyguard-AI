/**
 * SupplyGuard AI - Command Centre Dashboard
 */

import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export function DashboardPage({ onNavigate, onRefresh }: DashboardPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSimulateS1 = async () => {
    setActionLoading(true);
    try {
      await api.simulateS1Outage();
      await fetchDashboard();
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateS2Surprise = async () => {
    setActionLoading(true);
    try {
      await api.simulateS2Surprise();
      await fetchDashboard();
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-mono">Synchronizing Digital Twin Telemetry...</span>
        </div>
      </div>
    );
  }

  const isCrisis = (data?.activeDisruptionsCount || 0) > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Top Banner: Crisis or Nominal State */}
      {isCrisis ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/40 border border-rose-500/40 shadow-xl shadow-rose-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold tracking-wider uppercase">
              <AlertOctagon className="w-4 h-4" />
              <span>Critical Supply Chain Disruption Active</span>
              {data.appliedRecoveryPlan && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 ml-2">
                  MITIGATED BY APPROVED PLAN
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {data.activeDisruptions[0]?.targetEntityName} Offline ({data.activeDisruptions[0]?.durationDays} Days Outage)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {data.activeDisruptions[0]?.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSimulateS2Surprise}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-semibold text-amber-200 bg-amber-950/60 border border-amber-600/50 rounded-lg hover:bg-amber-900/60 transition-colors whitespace-nowrap"
              title="Simulate dynamic secondary surprise crisis: S2 supplier fails simultaneously!"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Inject Surprise: S2 Fails</span>
              </span>
            </button>
            <button
              onClick={() => onNavigate('recovery')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-cyan-950/50 flex items-center gap-1.5"
            >
              <span>Auto Recovery Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>Network Status: Nominal Operating Conditions</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              All 6 Smartphone Supply Chain Tiers Operating Within Tolerance
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time continuous digital twin telemetry: 8 suppliers, 12 components, 3 megafactories, 3 continental hubs, 4 flagship stores, 12 carrier accounts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSimulateS1}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-950/80 border border-rose-600/50 rounded-lg hover:bg-rose-900/80 transition-colors whitespace-nowrap shadow-md flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate S1 14-Day Failure</span>
            </button>
            <button
              onClick={() => onNavigate('digital-twin')}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              Inspect Digital Twin
            </button>
          </div>
        </div>
      )}

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supply Chain Resilience Index</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${data.healthScore < 50 ? 'text-rose-400' : data.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.healthScore}%
            </span>
            <span className="text-xs text-slate-500">
              {data.healthScore < 50 ? 'Critical Degradation' : data.healthScore < 80 ? 'Moderate Alert' : 'Optimal'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-500 ${data.healthScore < 50 ? 'bg-rose-500' : data.healthScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${data.healthScore}%` }}
            />
          </div>
        </div>

        {/* Financial Exposure */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Value at Risk</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              ${(data.totalFinancialRiskUSD / 1000000).toFixed(2)}M
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            SLA Penalties: ${(data.totalSlaPenaltiesUSD / 1000).toFixed(0)}k · Line Idle: ${((data.totalFinancialRiskUSD - data.totalSlaPenaltiesUSD) / 1000).toFixed(0)}k
          </p>
        </div>

        {/* Orders At Risk */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>At-Risk Customer Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {data.atRiskOrdersCount} <span className="text-sm font-normal text-slate-400">/ 12</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Deficit: {data.totalProductionDeficitUnits.toLocaleString()} assembly units
          </p>
        </div>

        {/* Autonomous Recovery State */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rank #1 Recovery Strategy</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-cyan-300 truncate">
              {data.recommendedPlan?.code === 'plan_d' ? 'Hybrid Recovery' : data.recommendedPlan?.title?.slice(0, 18) || 'Nominal'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Score: <span className="font-mono font-semibold text-cyan-400">{data.recommendedPlan?.score || 95}/100</span> · SLA: <span className="font-mono text-emerald-400">{data.recommendedPlan?.slaPreservationRate || 100}%</span>
          </p>
        </div>
      </div>

      {/* Supply Chain 6-Tier Pipeline Status */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Multi-Tier Supply Chain Architecture</h3>
            <p className="text-xs text-slate-400">Topological flow from Tier-1/2 raw material extraction to enterprise consumers</p>
          </div>
          <button
            onClick={() => onNavigate('digital-twin')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Open Interactive Graph</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { tier: '1. Suppliers', count: '8 Component Entities', metric: isCrisis ? '1 Offline (S1)' : '100% Operational', state: isCrisis ? 'text-rose-400' : 'text-emerald-400' },
            { tier: '2. Materials', count: '12 Component BOMs', metric: isCrisis ? 'MAT001 OLED Bottleneck' : 'Buffers Nominal', state: isCrisis ? 'text-amber-400' : 'text-emerald-400' },
            { tier: '3. Factories', count: '3 Megafactories', metric: isCrisis ? 'F1 1.6d Stockout' : '92% Capacity', state: isCrisis ? 'text-rose-400' : 'text-emerald-400' },
            { tier: '4. Distribution', count: '3 Continental Hubs', metric: 'Rotterdam, LA, SG', state: 'text-slate-300' },
            { tier: '5. Stores', count: '4 Flagship Stores', metric: 'Demand: 355 u/day', state: 'text-slate-300' },
            { tier: '6. Customers', count: '12 Carrier & Fleet Accounts', metric: isCrisis ? `${data.atRiskOrdersCount} Orders At Risk` : '100% On-Time', state: isCrisis ? 'text-rose-400' : 'text-emerald-400' },
          ].map((col, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">{col.tier}</span>
              <span className="text-xs font-medium text-white block">{col.count}</span>
              <span className={`text-[11px] font-mono block ${col.state}`}>{col.metric}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Recommended Plan Spotlight & Recent System Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Recovery Plan Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">Autonomous Recovery Recommendation</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {data.recommendedPlan?.title || 'Strategy D: Autonomous Multi-Modal Hybrid Recovery'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Composite Score</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{data.recommendedPlan?.score || 96}/100</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The optimization engine has validated physical feasibility against material compatibility, supplier capacity, and safety stock floors. Recommends multi-action hybrid execution: air charter buffer from Austin (F3) + secondary qualified procurement + priority SLA queue re-sequencing.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">Execution Cost</span>
              <span className="text-sm font-bold font-mono text-white">
                ${data.recommendedPlan?.costUSD ? data.recommendedPlan.costUSD.toLocaleString() : '268,000'}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">SLA Protection</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {data.recommendedPlan?.slaPreservationRate || 96}%
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">Days to Recovery</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {data.recommendedPlan?.daysToRecover || 3.8} Days
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => onNavigate('scenarios')}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Adjust Optimization Weights
            </button>
            <button
              onClick={() => onNavigate('recovery')}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <span>Review & Authorize Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Log / Event Feed */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Audit & Event Ledger</h3>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {data.recentAuditLogs?.length > 0 ? (
              data.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{log.actor}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{log.details}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent events recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
