/**
 * SupplyGuard AI - Disruption Simulator & Threat Injection Engine
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { DisruptionEvent, ImpactAssessment } from '../shared/types.ts';
import {
  AlertOctagon,
  Zap,
  RotateCcw,
  PlusCircle,
  Clock,
  Layers,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface DisruptionPageProps {
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export function DisruptionPage({ onNavigate, onRefresh }: DisruptionPageProps) {
  const [activeDisruptions, setActiveDisruptions] = useState<DisruptionEvent[]>([]);
  const [impact, setImpact] = useState<ImpactAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Disruption Form State
  const [targetEntityId, setTargetEntityId] = useState('S1');
  const [disruptionType, setDisruptionType] = useState<any>('complete_outage');
  const [durationDays, setDurationDays] = useState(14);
  const [severity, setSeverity] = useState<any>('critical');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    try {
      const d = await api.getDisruptions();
      setActiveDisruptions(d.activeDisruptions);
      const imp = await api.getImpact();
      setImpact(imp);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateS1 = async () => {
    setLoading(true);
    try {
      await api.simulateS1Outage();
      await loadData();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateS2Surprise = async () => {
    setLoading(true);
    try {
      await api.simulateS2Surprise();
      await loadData();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetSimulation();
      await loadData();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const entityNames: Record<string, string> = {
        S1: 'Lumina Display Technologies (OLED Displays)',
        S2: 'Apex MicroOptics & Displays (Secondary OLED & Camera)',
        S3: 'TSFC Advanced Semiconductor (Processor SoC)',
        S4: 'Voltaic Energy Storage (Lithium-Ion Battery)',
        F1: 'Shenzhen Apex Smartphone Megafactory',
        F2: 'Penang Advanced Mobile Assembly',
        F3: 'Austin CyberPhone Precision Facility',
        DC2: 'Los Angeles Pacific Mobile Terminal',
      };

      await api.simulateCustomDisruption({
        targetEntityId,
        targetEntityName: entityNames[targetEntityId] || targetEntityId,
        targetEntityType: targetEntityId.startsWith('S') ? 'supplier' : targetEntityId.startsWith('F') ? 'factory' : 'distribution',
        type: disruptionType,
        severity,
        startDay: 1,
        durationDays: Number(durationDays),
        capacityImpactPercent: 100,
        description: description || `Simulated ${disruptionType.replace('_', ' ')} on ${targetEntityId} for ${durationDays} days.`,
      });
      await loadData();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Disruption Simulation Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inject stochastic and deterministic stress scenarios into the smartphone digital twin to stress-test resilience.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Nominal Baseline</span>
        </button>
      </div>

      {/* Preset Crisis Scenarios Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Demonstration & Stress Testing Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Demo: S1 14-day Outage */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">
                  Main Demo Preset
                </span>
                <span className="text-xs font-mono text-slate-400">14 Days Outage</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Primary Supplier S1 Cleanroom Fab Fire (OLED Screens)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lumina Display cleanroom fab in Gumi suffers chemical delivery line fire. Total cessation of MAT001 OLED Display Screen deliveries for 14 days. Tests smartphone assembly buffer exhaustion.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-500 font-mono">Blast Radius: F1, F2, F3 & 6 Carrier Orders</span>
              <button
                onClick={handleSimulateS1}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/50"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Simulate S1 Failure</span>
              </button>
            </div>
          </div>

          {/* Surprise Scenario: S2 Secondary Failure */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                  Dynamic Adaptation Scenario
                </span>
                <span className="text-xs font-mono text-slate-400">Simultaneous Outages</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Surprise Event: Secondary Supplier S2 Seismic Stop
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                During the S1 crisis, secondary supplier S2 (Apex MicroOptics in Osaka) halts lines due to seismic safety interlocks. Plan A (Alternative Supplier Expedite) instantly becomes physically infeasible. Forces autonomous re-ranking.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-500 font-mono">Dynamic Re-Optimization</span>
              <button
                onClick={handleSimulateS2Surprise}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-600/50 hover:bg-amber-900 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Inject Surprise: S2 Fails</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Disruptions Status Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Active Disruption Ledger</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
              {activeDisruptions.length} Active
            </span>
          </div>

          {activeDisruptions.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('impact')}
                className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
              >
                <span>View Impact</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigate('recovery')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg font-mono flex items-center gap-1.5 shadow-sm"
              >
                <span>Run Auto Recovery Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {activeDisruptions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-medium text-slate-300">No active disruptions in simulation</p>
            <p className="text-[11px] text-slate-500">Select a preset above or configure a custom failure event below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDisruptions.map((dis) => (
              <div
                key={dis.id}
                className="p-4 bg-slate-950 border border-rose-800/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-semibold">
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    <span>{dis.targetEntityName}</span>
                    <span className="text-slate-600">·</span>
                    <span className="capitalize">{dis.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-300">{dis.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Duration</span>
                    <span className="font-mono text-white font-bold">{dis.durationDays} Days</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Capacity Hit</span>
                    <span className="font-mono text-rose-400 font-bold">{dis.capacityImpactPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Disruption Builder Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white">Custom Disruption Builder</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure custom failure events across suppliers, factories, and distribution corridors.
          </p>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
                Target Entity
              </label>
              <select
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="S1">S1 - Lumina Display (OLED)</option>
                <option value="S2">S2 - Apex MicroOptics (OLED/Camera)</option>
                <option value="S3">S3 - TSFC (Processor SoC)</option>
                <option value="S4">S4 - Voltaic Storage (Battery)</option>
                <option value="F1">F1 - Shenzhen Megafactory</option>
                <option value="F2">F2 - Penang Mobile Assembly</option>
                <option value="F3">F3 - Austin CyberPhone Facility</option>
                <option value="DC2">DC2 - LA Pacific Mobile Terminal</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
                Disruption Type
              </label>
              <select
                value={disruptionType}
                onChange={(e) => setDisruptionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="complete_outage">Complete Outage (100% capacity loss)</option>
                <option value="capacity_reduction">Capacity Reduction (50% reduction)</option>
                <option value="lead_time_surge">Lead Time Surge (+14 days delay)</option>
                <option value="freight_corridor_block">Freight Corridor Blockade</option>
                <option value="demand_surge">Demand Surge (+80% order volume)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">Critical (Immediate Line Halt)</option>
                <option value="high">High (Depletes Safety Buffer)</option>
                <option value="medium">Medium (Marginal Delivery Delay)</option>
                <option value="low">Low (Absorbable)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
              Incident Context / Justification
            </label>
            <input
              type="text"
              placeholder="e.g. Unplanned smelter overhaul, workforce dispute, port congestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-md shadow-cyan-950/40 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Inject Custom Disruption</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
