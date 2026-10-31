/**
 * SupplyGuard AI - Enterprise Left Navigation Sidebar
 */

import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  AlertTriangle,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  Bot,
  FileSearch,
  CheckSquare,
  ClipboardList,
  Database,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeDisruptionsCount: number;
  pendingApprovalsCount: number;
  geminiConnected: boolean;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  activeDisruptionsCount,
  pendingApprovalsCount,
  geminiConnected,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Command Centre', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin Graph', icon: GitFork },
    {
      id: 'disruptions',
      label: 'Disruption Simulator',
      icon: AlertTriangle,
      badge: activeDisruptionsCount > 0 ? `${activeDisruptionsCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    { id: 'impact', label: 'Impact & Blast Radius', icon: Flame },
    { id: 'recovery', label: 'Auto Recovery Agent', icon: ShieldCheck },
    { id: 'scenarios', label: 'Scenario Optimization', icon: SlidersHorizontal },
    {
      id: 'ai-assistant',
      label: 'AI Decision Assistant',
      icon: Bot,
      indicator: geminiConnected ? 'gemini' : 'local',
    },
    { id: 'evidence', label: 'Evidence & Audit Trail', icon: FileSearch },
    { id: 'evaluation', label: 'Testing & Evaluations', icon: CheckSquare },
    {
      id: 'approvals',
      label: 'Approvals & Audit Log',
      icon: ClipboardList,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    { id: 'settings', label: 'Data & Settings', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3.5 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Supply Chain Twin
        </div>
        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Autonomous Agents
        </div>
        {navItems.slice(6, 8).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.indicator && (
                <span className="text-[10px] font-mono text-cyan-400/80">
                  {item.indicator === 'gemini' ? 'Gemini 3.8' : 'Expert Demo'}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Governance & Engine
        </div>
        {navItems.slice(8).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="mt-auto p-3.5 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimization Engine</span>
          </div>
          <span className="font-mono text-emerald-400 text-[10px]">Deterministic</span>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500">
          Electronics Supply Chain Model · 6 Tiers
        </div>
      </div>
    </aside>
  );
}
