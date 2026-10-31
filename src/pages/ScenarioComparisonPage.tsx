/**
 * SupplyGuard AI - Scenario Comparison & Multi-Objective Optimization
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { RecoveryPlan, OptimizationWeights } from '../shared/types.ts';
import { DEFAULT_WEIGHTS } from '../server/optimization/scoring.engine.ts';
import {
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export function ScenarioComparisonPage() {
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [weights, setWeights] = useState<OptimizationWeights>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);

  const fetchScenarios = async (w: OptimizationWeights = weights) => {
    try {
      setLoading(true);
      const res = await api.compareRecovery(w);
      setPlans(res.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios(weights);
  }, []);

  const handleWeightChange = (key: keyof OptimizationWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    fetchScenarios(updated);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    fetchScenarios(DEFAULT_WEIGHTS);
  };

  // Recharts Data Prep
  const barData = plans.map((p) => ({
    name: p.code.toUpperCase(),
    title: p.title,
    composite: p.scores.weightedCompositeScore,
    sla: p.scores.slaScore,
    cost: p.scores.costEfficiencyScore,
    speed: p.scores.recoverySpeedScore,
    risk: p.scores.riskMitigationScore,
    green: p.scores.sustainabilityScore,
  }));

  const radarData = [
    {
      metric: 'SLA Preservation',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.slaScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.slaScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.slaScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.slaScore || 0,
    },
    {
      metric: 'Cost Efficiency',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.costEfficiencyScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.costEfficiencyScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.costEfficiencyScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.costEfficiencyScore || 0,
    },
    {
      metric: 'Recovery Speed',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.recoverySpeedScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.recoverySpeedScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.recoverySpeedScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.recoverySpeedScore || 0,
    },
    {
      metric: 'Customer Impact',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.customerImpactScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.customerImpactScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.customerImpactScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.customerImpactScore || 0,
    },
    {
      metric: 'Risk Mitigation',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.riskMitigationScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.riskMitigationScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.riskMitigationScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.riskMitigationScore || 0,
    },
    {
      metric: 'Sustainability',
      planA: plans.find((p) => p.code === 'plan_a')?.scores.sustainabilityScore || 0,
      planB: plans.find((p) => p.code === 'plan_b')?.scores.sustainabilityScore || 0,
      planC: plans.find((p) => p.code === 'plan_c')?.scores.sustainabilityScore || 0,
      planD: plans.find((p) => p.code === 'plan_d')?.scores.sustainabilityScore || 0,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Scenario Comparison & Optimization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic Pareto frontier evaluation across 6 strategic criteria with dynamic weight adjustment.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Weights</span>
        </button>
      </div>

      {/* Interactive Weight Adjustment Sliders */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Dynamic Objective Weights</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Recalculation Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { key: 'sla', label: 'SLA Protection', val: weights.sla },
            { key: 'costEfficiency', label: 'Cost Efficiency', val: weights.costEfficiency },
            { key: 'recoverySpeed', label: 'Recovery Speed', val: weights.recoverySpeed },
            { key: 'customerImpact', label: 'Customer Shield', val: weights.customerImpact },
            { key: 'operationalRisk', label: 'Risk Mitigation', val: weights.operationalRisk },
            { key: 'sustainability', label: 'Sustainability', val: weights.sustainability },
          ].map((item) => (
            <div key={item.key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium text-[11px]">{item.label}</span>
                <span className="font-mono text-cyan-400 font-bold">{(item.val * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={item.val}
                onChange={(e) => handleWeightChange(item.key as any, parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Dimensional Comparison Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composite Score Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Weighted Composite Score Ranking</h3>
            <span className="text-xs font-mono text-slate-400">Target: 100 max</span>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="composite" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Composite Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Axis Radar Trade-off Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Trade-off Radar Profile</h3>
            <span className="text-xs font-mono text-slate-400">Plan A vs B vs C vs D</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis stroke="#475569" domain={[0, 100]} />
                <Radar name="Plan D (Hybrid)" dataKey="planD" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Radar name="Plan A (Procure)" dataKey="planA" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} />
                <Radar name="Plan B (Reallocate)" dataKey="planB" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Optimization Ranking & Trade-off Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Deterministic Scoring Matrix & Rationales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="pb-3 px-3">Rank</th>
                <th className="pb-3 px-3">Strategy</th>
                <th className="pb-3 px-3">Feasibility</th>
                <th className="pb-3 px-3">SLA Score</th>
                <th className="pb-3 px-3">Cost Score</th>
                <th className="pb-3 px-3">Speed Score</th>
                <th className="pb-3 px-3">Risk Score</th>
                <th className="pb-3 px-3">Green Score</th>
                <th className="pb-3 px-3 text-right">Composite Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {plans.map((p) => {
                const isRank1 = p.scores.rank === 1;
                return (
                  <tr key={p.id} className={`hover:bg-slate-800/40 transition-colors ${isRank1 ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${isRank1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        #{p.scores.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      <div>{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.recommendationReason}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${p.isFeasible ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {p.isFeasible ? 'PASSED' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{p.scores.slaScore}</td>
                    <td className="py-3 px-3 text-slate-300">{p.scores.costEfficiencyScore}</td>
                    <td className="py-3 px-3 text-slate-300">{p.scores.recoverySpeedScore}</td>
                    <td className="py-3 px-3 text-slate-300">{p.scores.riskMitigationScore}</td>
                    <td className="py-3 px-3 text-teal-400">{p.scores.sustainabilityScore}</td>
                    <td className="py-3 px-3 text-right text-sm font-bold text-cyan-400">
                      {p.scores.weightedCompositeScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
