/**
 * SupplyGuard AI - Settings & Synthetic Data Management
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  Database,
  RotateCcw,
  Download,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Layers,
} from 'lucide-react';
import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_FACTORIES,
  INITIAL_ORDERS,
} from '../server/database/synthetic-data.ts';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'materials' | 'factories' | 'orders'>('suppliers');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    try {
      await api.resetSimulation();
      setResetMessage('Digital twin successfully reset to 100% nominal baseline.');
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleExportData = () => {
    const data = {
      app: 'SupplyGuard AI',
      timestamp: new Date().toISOString(),
      suppliers: INITIAL_SUPPLIERS,
      materials: INITIAL_MATERIALS,
      factories: INITIAL_FACTORIES,
      orders: INITIAL_ORDERS,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplyguard-synthetic-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Data Management & System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Demonstration dataset inspection, simulation state management, and export utilities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Synthetic JSON</span>
          </button>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md shadow-rose-950/40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Hard Reset State'}</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Dataset Inspector Strip */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Smartphone Manufacturing Synthetic Dataset</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect grounded raw supply chain records used for smartphone digital twin graph traversal.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
            {(['suppliers', 'materials', 'factories', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 px-3">ID</th>
                  <th className="pb-3 px-3">Supplier Name</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Materials</th>
                  <th className="pb-3 px-3">Daily Capacity</th>
                  <th className="pb-3 px-3">Lead Time</th>
                  <th className="pb-3 px-3">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {INITIAL_SUPPLIERS.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{s.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.location}, {s.country}</td>
                    <td className="py-2.5 px-3 text-slate-300">{s.materialsProvided.join(', ')}</td>
                    <td className="py-2.5 px-3 text-slate-200">{s.dailyCapacityUnits.toLocaleString()} u</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.nominalLeadTimeDays}d (expedite: {s.expediteLeadTimeDays}d)</td>
                    <td className="py-2.5 px-3 text-emerald-400">{(s.reliabilityScore * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Materials */}
        {activeTab === 'materials' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 px-3">Material ID</th>
                  <th className="pb-3 px-3">Component Name</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Unit Cost</th>
                  <th className="pb-3 px-3">Criticality</th>
                  <th className="pb-3 px-3">Standard BOM Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {INITIAL_MATERIALS.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{m.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-400 capitalize">{m.category}</td>
                    <td className="py-2.5 px-3 text-white font-bold">${m.unitCostUSD.toFixed(2)}</td>
                    <td className="py-2.5 px-3 uppercase text-amber-400">{m.criticality}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {Object.entries(m.standardBOMUsage).map(([f, u]) => `${f}:${u}u`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Factories */}
        {activeTab === 'factories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 px-3">Factory ID</th>
                  <th className="pb-3 px-3">Facility Name</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Daily Capacity</th>
                  <th className="pb-3 px-3">MAT001 OLED Buffer</th>
                  <th className="pb-3 px-3">MAT001 Daily Burn</th>
                  <th className="pb-3 px-3">Daily OpEx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {INITIAL_FACTORIES.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{f.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{f.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{f.location}</td>
                    <td className="py-2.5 px-3 text-white">{f.dailyFinishedProductCapacity} u/day</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{f.inventoryOnHand.MAT001 ?? f.inventoryOnHand.M1 ?? 0} u</td>
                    <td className="py-2.5 px-3 text-amber-400">{f.dailyConsumptionRate.MAT001 ?? f.dailyConsumptionRate.M1 ?? 0} u/day</td>
                    <td className="py-2.5 px-3 text-slate-300">${f.operationalCostPerDayUSD.toLocaleString()}/day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Orders */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Enterprise Client</th>
                  <th className="pb-3 px-3">Product</th>
                  <th className="pb-3 px-3">Volume</th>
                  <th className="pb-3 px-3">Contract Value</th>
                  <th className="pb-3 px-3">Promised Day</th>
                  <th className="pb-3 px-3">Daily SLA Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {INITIAL_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{o.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.productId}</td>
                    <td className="py-2.5 px-3 text-white">{o.quantityUnits.toLocaleString()} u</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">${o.totalOrderValueUSD.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-300">Day {o.promisedDeliveryDay}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">${o.slaPenaltyPerDayUSD.toLocaleString()}/day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
