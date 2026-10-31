/**
 * SupplyGuard AI - Custom React Flow Node Component
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GraphNodeData } from '../../server/digital-twin/graph.types.ts';
import {
  Factory,
  Truck,
  Box,
  Store,
  Users,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export function SupplyGuardNode({ data, selected }: { data: GraphNodeData; selected?: boolean }) {
  const getIcon = () => {
    switch (data.tier) {
      case 'supplier':
        return <Truck className="w-4 h-4 text-cyan-400" />;
      case 'material':
        return <Box className="w-4 h-4 text-emerald-400" />;
      case 'factory':
        return <Factory className="w-4 h-4 text-sky-400" />;
      case 'distribution':
        return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'store':
        return <Store className="w-4 h-4 text-violet-400" />;
      case 'customer':
        return <Users className="w-4 h-4 text-teal-400" />;
      default:
        return <Box className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBorder = () => {
    if (data.status === 'disrupted') {
      return 'border-rose-500 shadow-rose-950/50 shadow-lg ring-1 ring-rose-500/50';
    }
    if (data.status === 'warning') {
      return 'border-amber-500 shadow-amber-950/40 shadow-md ring-1 ring-amber-500/30';
    }
    if (data.status === 'bottleneck') {
      return 'border-orange-500 shadow-orange-950/40 shadow-md';
    }
    return 'border-slate-800 hover:border-slate-700';
  };

  const getStatusBadge = () => {
    if (data.status === 'disrupted') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
          <AlertOctagon className="w-3 h-3 text-rose-400" />
          <span>DISRUPTED</span>
        </span>
      );
    }
    if (data.status === 'warning') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>AT RISK</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>NOMINAL</span>
      </span>
    );
  };

  return (
    <div
      className={`w-64 bg-slate-900/95 backdrop-blur-md border rounded-xl p-3.5 transition-all text-left ${getStatusBorder()} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
      }`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-slate-600 !border-slate-900 border-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-cyan-500 !border-slate-900 border-2"
      />

      {/* Header: Tier & Status */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          {getIcon()}
          <span className="capitalize">{data.tier}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono text-[11px]">{data.id}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Name */}
      <div className="mt-2">
        <h4 className="text-xs font-semibold text-white tracking-tight line-clamp-1" title={data.name}>
          {data.name}
        </h4>
        <p className="text-[11px] text-slate-400 truncate mt-0.5" title={data.countryOrLocation}>
          {data.countryOrLocation}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block leading-tight">{data.primaryMetricLabel}</span>
          <span className="font-mono tabular-nums text-slate-200 font-medium text-[11px]">
            {data.primaryMetricValue}
          </span>
        </div>
        {data.secondaryMetricLabel && (
          <div>
            <span className="text-[10px] text-slate-500 block leading-tight">{data.secondaryMetricLabel}</span>
            <span
              className={`font-mono tabular-nums font-medium text-[11px] ${
                data.secondaryMetricValue?.includes('CRITICAL') ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {data.secondaryMetricValue}
            </span>
          </div>
        )}
      </div>

      {/* Blast Radius Warning Bar */}
      {data.isInBlastRadius && (
        <div className="mt-2.5 px-2 py-1 bg-rose-950/40 border border-rose-800/40 rounded flex items-center gap-1.5 text-[10px] text-rose-300 font-mono">
          <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate">Active In Blast Radius</span>
        </div>
      )}
    </div>
  );
}
