/**
 * SupplyGuard AI - Autonomous Recovery Agent & Planning Command
 * 
 * Features:
 * - Autonomous investigation of active disruptions
 * - Dataset-grounded alternative supplier evaluation with capacity & lead time checks
 * - Internal inventory buffer reallocation analysis (Austin F3, Singapore DC3)
 * - Multi-objective recovery strategy formulation (Plan A, B, C, D)
 * - Feasibility constraint validation with explicit rejection reasons
 * - Dynamic multi-disruption adaptation without requiring simulation reset
 * - Live simulation application of approved recovery plans
 * - Grounded Gemini AI executive briefings and trade-off explanations
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  RecoveryPlan,
  AutoRecoveryInvestigation,
  EvaluatedSupplier,
  EvaluatedInventoryBuffer,
} from '../shared/types.ts';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Clock,
  DollarSign,
  Sparkles,
  ArrowRight,
  Send,
  Zap,
  Bot,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Play,
  Undo2,
  Check,
  Building2,
  Cpu,
} from 'lucide-react';

interface RecoveryPlanningPageProps {
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export function RecoveryPlanningPage({ onNavigate, onRefresh }: RecoveryPlanningPageProps) {
  const [investigation, setInvestigation] = useState<AutoRecoveryInvestigation | null>(null);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('plan_d');
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [applyingPlanId, setApplyingPlanId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'strategies' | 'suppliers' | 'inventory' | 'briefing'>('strategies');

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAgentState = async () => {
    try {
      setLoading(true);
      const res = await api.getAutoRecoveryState();
      setInvestigation(res.investigation);
      setPlans(res.investigation.plans);

      const top = res.investigation.plans.find((p: any) => p.scores.rank === 1) || res.investigation.plans[0];
      if (top) setSelectedPlanCode(top.code);
    } catch (err) {
      console.error('Failed to load agent state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentState();
  }, []);

  const handleRunAutoRecovery = async () => {
    setAgentRunning(true);
    try {
      const res = await api.runAutoRecovery();
      setInvestigation(res.investigation);
      setPlans(res.investigation.plans);

      const top = res.investigation.plans.find((p: any) => p.scores.rank === 1) || res.investigation.plans[0];
      if (top) setSelectedPlanCode(top.code);

      showNotification('Autonomous Recovery Agent finished investigation & formulated 4 recovery portfolios.');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Error running autonomous recovery', 'error');
    } finally {
      setAgentRunning(false);
    }
  };

  const handleRecalculateAfterDisruption = async () => {
    setAgentRunning(true);
    try {
      const res = await api.recalculateAfterDisruption();
      setInvestigation(res.investigation);
      setPlans(res.investigation.plans);

      const top = res.investigation.plans.find((p: any) => p.scores.rank === 1) || res.investigation.plans[0];
      if (top) setSelectedPlanCode(top.code);

      if (res.investigation.adaptationState.isMultiDisruption) {
        showNotification('Multi-disruption adaptation complete. Infeasible plans rejected; portfolios dynamically updated.', 'info');
      } else {
        showNotification('Recovery portfolios dynamically recalculated for current supply chain state.');
      }
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Error recalculating recovery', 'error');
    } finally {
      setAgentRunning(false);
    }
  };

  const handleApplyToSimulation = async (planId: string) => {
    setApplyingPlanId(planId);
    try {
      const res = await api.applyRecoveryPlan(planId);
      showNotification(`Recovery Plan "${res.appliedPlan.title}" applied! Digital Twin replenished & SLA damages mitigated.`);
      await loadAgentState();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to apply plan', 'error');
    } finally {
      setApplyingPlanId(null);
    }
  };

  const handleRollbackPlan = async () => {
    try {
      await api.rollbackRecoveryPlan();
      showNotification('Applied recovery plan rolled back. Simulation returned to raw disruption exposure state.', 'info');
      await loadAgentState();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to rollback plan', 'error');
    }
  };

  const handleAuthorize = async (planId: string) => {
    setSubmittingPlanId(planId);
    try {
      await api.submitApproval(planId);
      showNotification('Recovery Plan dispatched to Human Executive Approval ledger.');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit approval', 'error');
    } finally {
      setSubmittingPlanId(null);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      await loadAgentState();
      onRefresh();
      showNotification('Simulation reset to 100% nominal baseline.');
    } catch (err: any) {
      showNotification('Failed to reset simulation', 'error');
    }
  };

  if (loading && !investigation) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Bot className="w-8 h-8 text-cyan-400 animate-pulse" />
        <span className="text-xs font-mono text-slate-400">Autonomous Recovery Agent initializing digital twin telemetry...</span>
      </div>
    );
  }

  const activePlan = plans.find((p) => p.code === selectedPlanCode) || plans[0];
  const appliedPlan = investigation?.appliedPlan;
  const isMultiCrisis = investigation?.adaptationState.isMultiDisruption;
  const hasActiveDisruptions = (investigation?.activeDisruptions.length || 0) > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Page Title & Autonomous Agent Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Auto Recovery Agent</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              AUTONOMOUS v2.4
            </span>
            {appliedPlan && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse">
                PLAN APPLIED IN SIMULATION
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous agent that detects component disruptions, evaluates qualified alternative suppliers, reallocates internal buffers, and formulates feasible recovery strategies.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleRunAutoRecovery}
            disabled={agentRunning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40"
          >
            <Sparkles className={`w-3.5 h-3.5 ${agentRunning ? 'animate-spin' : ''}`} />
            <span>{agentRunning ? 'Agent Investigating...' : 'Run Auto Recovery'}</span>
          </button>

          <button
            onClick={handleRecalculateAfterDisruption}
            disabled={agentRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-600/50 hover:bg-amber-900 rounded-xl transition-all"
            title="Recalculates plans when new disruptions occur without resetting the simulation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Recalculate After New Disruption</span>
          </button>

          {appliedPlan && (
            <button
              onClick={handleRollbackPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-700/50 hover:bg-rose-900 rounded-xl transition-all"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Rollback Plan</span>
            </button>
          )}

          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Administrative fresh start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Simulation</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium border ${
            notification.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              : notification.type === 'info'
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : notification.type === 'info' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Multi-Disruption Adaptation Banner */}
      {isMultiCrisis && (
        <div className="p-4 bg-amber-950/40 border border-amber-600/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 font-mono text-[11px] uppercase tracking-wider block">
                Dynamic Multiple-Disruption Adaptation Active
              </span>
              <p className="text-slate-300 leading-relaxed">
                {investigation?.adaptationState.adaptationSummary}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-amber-900/60 text-amber-200 border border-amber-700/60 shrink-0">
            Plan A Invalidated
          </span>
        </div>
      )}

      {/* Investigation HUD Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Disruption */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Crisis Status</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasActiveDisruptions ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {hasActiveDisruptions
              ? `${investigation?.activeDisruptions.length} Active Disruption(s)`
              : 'Nominal Baseline'}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {hasActiveDisruptions
              ? investigation?.failedSuppliers.map((s) => s.name).join(', ')
              : 'All nodes within tolerance'}
          </p>
        </div>

        {/* Card 2: Affected Materials */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Affected Materials</span>
          <div className="text-base font-bold text-white font-mono">
            {investigation?.affectedMaterials.length || 0} Components
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {investigation?.affectedMaterials.map((m) => m.name).join(', ') || 'No material deficit'}
          </p>
        </div>

        {/* Card 3: Earliest Stockout */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Stockout Timeline</span>
          <div className="text-base font-bold font-mono text-rose-400">
            {investigation?.stockoutAlerts.length
              ? `Day ${Math.min(...investigation.stockoutAlerts.map((s) => s.daysRemaining))}`
              : 'No stockouts'}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {investigation?.stockoutAlerts[0]
              ? `${investigation.stockoutAlerts[0].factoryName} (${investigation.stockoutAlerts[0].materialId})`
              : 'Buffers exceed safety floors'}
          </p>
        </div>

        {/* Card 4: Recommended Action */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Recommended Plan</span>
          <div className="text-base font-bold text-cyan-400 font-mono">
            {investigation?.recommendedPlan.code.toUpperCase()} · Rank #1
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {investigation?.recommendedPlan.title}
          </p>
        </div>
      </div>

      {/* Applied Plan Notice (if any) */}
      {appliedPlan && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-600/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 font-mono text-[11px] uppercase tracking-wider block">
                Active Mitigated Simulation State: {appliedPlan.title}
              </span>
              <p className="text-slate-300 text-[11px]">
                Execution Cost: ${appliedPlan.metrics.totalRecoveryCostUSD.toLocaleString()} · Contract SLA Protection: {appliedPlan.metrics.slaPreservationRate}% · Orders Shielded: {appliedPlan.metrics.ordersPreservedCount}/12
              </p>
            </div>
          </div>
          <button
            onClick={handleRollbackPlan}
            className="px-3 py-1.5 text-[11px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-700/60 hover:bg-rose-900 rounded-lg shrink-0 transition-colors"
          >
            Rollback to Raw Crisis
          </button>
        </div>
      )}

      {/* Module View Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl w-fit text-xs">
        {[
          { id: 'strategies', label: '1. Formulated Recovery Strategies' },
          { id: 'suppliers', label: `2. Alternative Suppliers (${investigation?.evaluatedSuppliers.length || 0})` },
          { id: 'inventory', label: '3. Internal Buffers & Reallocation' },
          { id: 'briefing', label: '4. AI Executive Briefing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FORMULATED RECOVERY STRATEGIES */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* 4 Strategy Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((plan) => {
              const isSelected = plan.code === selectedPlanCode;
              const isRank1 = plan.scores.rank === 1;

              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanCode(plan.code)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isRank1 && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 shadow">
                      RANK #1 OPTIMAL
                    </span>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {plan.code.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          plan.isFeasible ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        {plan.isFeasible ? 'FEASIBLE' : 'INFEASIBLE'}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white line-clamp-1">{plan.title}</h3>

                    {!plan.isFeasible && (
                      <p className="text-[10px] text-rose-300/90 line-clamp-2 bg-rose-950/40 p-1.5 rounded border border-rose-900/40">
                        {plan.recommendationReason}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">SLA</span>
                      <span className={plan.isFeasible ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {plan.metrics.slaPreservationRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">COST</span>
                      <span className="text-slate-200">${(plan.metrics.totalRecoveryCostUSD / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SCORE</span>
                      <span className="text-cyan-400 font-bold">{plan.scores.weightedCompositeScore}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Strategy Deep-Dive */}
          {activePlan && (
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Header Info & Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                      {activePlan.code.toUpperCase()} · {activePlan.strategyCategory.replace('_', ' ')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-slate-400">
                      Score: {activePlan.scores.weightedCompositeScore}/100 (Rank #{activePlan.scores.rank})
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        activePlan.isFeasible ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {activePlan.isFeasible ? 'MATHEMATICALLY FEASIBLE' : 'INFEASIBLE (VIOLATES CONSTRAINTS)'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{activePlan.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{activePlan.summary}</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleApplyToSimulation(activePlan.id)}
                    disabled={applyingPlanId === activePlan.id || !activePlan.isFeasible}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      activePlan.isFeasible
                        ? 'text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-950/40'
                        : 'text-slate-500 bg-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {applyingPlanId === activePlan.id
                        ? 'Applying...'
                        : 'Apply to Live Simulation'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAuthorize(activePlan.id)}
                    disabled={submittingPlanId === activePlan.id || !activePlan.isFeasible}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      activePlan.isFeasible
                        ? 'text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/40'
                        : 'text-slate-500 bg-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submittingPlanId === activePlan.id
                        ? 'Dispatching...'
                        : 'Submit for Sign-off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Net Recovery Cost</span>
                  <span className="text-base font-bold font-mono text-white mt-0.5 block">
                    ${activePlan.metrics.totalRecoveryCostUSD.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Procurement & logistics</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Carrier SLA Preservation</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                    {activePlan.metrics.slaPreservationRate}%
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {activePlan.metrics.ordersPreservedCount}/12 orders protected
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Time to Equilibrium</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                    {activePlan.metrics.daysToFullRecovery} Days
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Full line replenishment</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Composite Optimization Score</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                    {activePlan.scores.weightedCompositeScore}/100
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Deterministic multi-objective</span>
                </div>
              </div>

              {/* Action Items Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Operational Action Items
                </h3>
                <div className="space-y-2.5">
                  {activePlan.actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] font-semibold">
                          <span>Action 0{idx + 1}</span>
                          <span className="text-slate-600">·</span>
                          <span className="capitalize">{act.actionType.replace('_', ' ')}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">
                            {act.sourceEntity} → {act.targetEntity}
                          </span>
                        </div>
                        <p className="text-slate-200">{act.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px] uppercase">Quantity</span>
                          <span className="text-white font-bold">{act.quantityUnits.toLocaleString()} u</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px] uppercase">Cost</span>
                          <span className="text-white font-bold">${act.estimatedCostUSD.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px] uppercase">Transit</span>
                          <span className="text-cyan-400 font-bold">{act.timeToImplementDays}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraint Checklist */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mathematical & Operational Constraint Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activePlan.feasibilityChecklist.map((chk, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                        chk.passed
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-rose-950/40 border-rose-800/60'
                      }`}
                    >
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{chk.checkName}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">{chk.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALTERNATIVE SUPPLIERS EVALUATED */}
      {activeTab === 'suppliers' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Automated Alternative Supplier Sourcing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dataset scan results evaluating candidate suppliers for disrupted components. Checks availability, surge capacity, lead times, and unit economics.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 px-3">Supplier</th>
                  <th className="pb-3 px-3">Component</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Daily Capacity</th>
                  <th className="pb-3 px-3">Lead Time</th>
                  <th className="pb-3 px-3">Expedite Rate</th>
                  <th className="pb-3 px-3">Reliability</th>
                  <th className="pb-3 px-3">Feasibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {investigation?.evaluatedSuppliers.map((sup, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="text-cyan-400 font-bold block">{sup.supplierId}</span>
                      <span className="font-sans text-slate-300 text-[11px] block">{sup.supplierName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">
                      <span className="text-white block font-medium">{sup.materialName}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{sup.materialId}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{sup.location}, {sup.country}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{sup.dailyCapacity.toLocaleString()} u/day</td>
                    <td className="py-2.5 px-3 text-slate-300">{sup.expediteLeadTimeDays}d (std: {sup.nominalLeadTimeDays}d)</td>
                    <td className="py-2.5 px-3 text-emerald-400">${sup.expediteCostPerUnitUSD}/u</td>
                    <td className="py-2.5 px-3 text-slate-300">{(sup.reliabilityScore * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3">
                      {sup.feasibilityStatus === 'FEASIBLE' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          FEASIBLE
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                            {sup.feasibilityStatus.replace('REJECTED_', 'REJECTED: ')}
                          </span>
                          {sup.rejectionReason && (
                            <p className="text-[10px] text-rose-400 font-sans max-w-xs">{sup.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL INVENTORY & BUFFER REALLOCATION */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Internal Buffer Reallocation Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluation of sister assembly plants and continental distribution centers to safely divert emergency buffer stock without breaching safety floors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investigation?.evaluatedBuffers.map((buf, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">{buf.locationName} ({buf.locationId})</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      buf.canReallocate ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {buf.canReallocate ? 'SURPLUS AVAILABLE' : 'CRITICAL CONSUMER / NO SURPLUS'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">On Hand</span>
                    <span className="text-white font-bold">{buf.inventoryOnHand.toLocaleString()} u</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Safety Floor</span>
                    <span className="text-slate-400">{buf.safetyStockFloor.toLocaleString()} u</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Net Surplus</span>
                    <span className="text-emerald-400 font-bold">{buf.surplusUnits.toLocaleString()} u</span>
                  </div>
                </div>

                {buf.canReallocate && (
                  <div className="p-2.5 bg-slate-900 rounded-lg text-xs flex items-center justify-between border border-slate-800">
                    <span className="text-slate-300">Proposed Transfer to F1 Megafactory:</span>
                    <span className="text-cyan-400 font-mono font-bold">{buf.proposedTransferUnits.toLocaleString()} units ({buf.transitTimeDays}d air)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI EXECUTIVE BRIEFING */}
      {activeTab === 'briefing' && (
        <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">AI Executive Operational Briefing</h3>
                <span className="text-[11px] text-slate-400">
                  Model: {investigation?.aiExplanation?.modelUsed || 'gemini-3.8-flash'} · Grounded strictly in digital twin telemetry
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              C-SUITE FORMAT
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">1. Operational Situation</span>
              <p className="text-slate-200">{investigation?.aiExplanation?.summary}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">2. Strategy Trade-Off Analysis</span>
              <p className="text-slate-200 whitespace-pre-line">{investigation?.aiExplanation?.tradeoffs}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">3. Autonomous Recommendation Rationale</span>
              <p className="text-slate-200">{investigation?.aiExplanation?.recommendedRationale}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
