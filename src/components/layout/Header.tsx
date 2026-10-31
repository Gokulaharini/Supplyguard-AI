/**
 * SupplyGuard AI - Header Component
 * Strict compliance with the Top Bar Contract (3 zones, single-line text links)
 */

import React from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onResetSimulation: () => void;
  activeDisruptionsCount: number;
}

export function Header({
  currentTab,
  onSelectTab,
  onResetSimulation,
  activeDisruptionsCount,
}: HeaderProps) {
  return (
    <header className="h-16 px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-8 sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          SupplyGuard AI
        </button>
      </div>

      {/* Zone 2: 4–5 concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('digital-twin')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'digital-twin' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Digital Twin
        </button>
        <button
          onClick={() => onSelectTab('disruptions')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'disruptions' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Disruptions
        </button>
        <button
          onClick={() => onSelectTab('impact')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'impact' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Impact & Blast Radius
        </button>
        <button
          onClick={() => onSelectTab('recovery')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'recovery' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Recovery Plans
        </button>
        <button
          onClick={() => onSelectTab('ai-assistant')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'ai-assistant' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          AI Decision Agent
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {activeDisruptionsCount > 0 && (
          <span className="text-xs text-rose-400 font-mono hidden sm:inline">
            {activeDisruptionsCount} Active Crisis Event{activeDisruptionsCount > 1 ? 's' : ''}
          </span>
        )}
        <button
          onClick={onResetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
          title="Reset digital twin to nominal baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>
    </header>
  );
}
