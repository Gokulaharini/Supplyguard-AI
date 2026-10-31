/**
 * SupplyGuard AI - Interactive Supply Chain Digital Twin Canvas
 * Built with @xyflow/react
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../services/api.ts';
import { SupplyGuardNode } from '../components/digital-twin/SupplyGuardNode.tsx';
import { GraphNodeData } from '../server/digital-twin/graph.types.ts';
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Info,
  X,
  Compass,
  Layers,
  RefreshCw,
} from 'lucide-react';

const nodeTypes = {
  supplyGuardNode: SupplyGuardNode,
};

export function DigitalTwinPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeData, setSelectedNodeData] = useState<GraphNodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [tracingMode, setTracingMode] = useState<boolean>(false);
  const [traceResult, setTraceResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const graph = await api.getDigitalTwinGraph();
      setNodes(graph.nodes as unknown as Node[]);
      setEdges(graph.edges as unknown as Edge[]);
    } catch (err) {
      console.error('Failed to load digital twin graph', err);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Handle Node Click for Inspection
  const onNodeClick = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const data = node.data as unknown as GraphNodeData;
      setSelectedNodeData(data);

      if (tracingMode) {
        try {
          const trace = await api.traceEntity(node.id);
          setTraceResult(trace);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [tracingMode]
  );

  const handleTraceClick = async (entityId: string) => {
    try {
      const trace = await api.traceEntity(entityId);
      setTraceResult(trace);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered nodes based on search and tier
  const filteredNodes = useMemo(() => {
    return nodes.map((node) => {
      const d = node.data as unknown as GraphNodeData;
      const matchesSearch =
        searchQuery === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'all' || d.tier === selectedTier;

      let isDimmed = !matchesSearch || !matchesTier;

      // In trace mode, highlight nodes in forward trace
      if (traceResult && !isDimmed) {
        const isTarget =
          node.id === traceResult.rootEntityId ||
          traceResult.forwardTrace.materialsAffected.includes(node.id) ||
          traceResult.forwardTrace.factoriesAffected.includes(node.id) ||
          traceResult.forwardTrace.distributionCentresAffected.includes(node.id) ||
          traceResult.forwardTrace.customerOrdersAffected.includes(node.id) ||
          (d.tier === 'customer' && traceResult.forwardTrace.customersAffected.includes(d.name));

        isDimmed = !isTarget;
      }

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isDimmed ? 0.2 : 1.0,
          transition: 'opacity 0.2s ease',
        },
      };
    });
  }, [nodes, searchQuery, selectedTier, traceResult]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search & Filter Island */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl pointer-events-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search entity, material, factory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          {/* Tier Filter Segments */}
          <div className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-2">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'supplier', label: 'Suppliers' },
              { id: 'material', label: 'Materials' },
              { id: 'factory', label: 'Factories' },
              { id: 'distribution', label: 'DCs' },
              { id: 'store', label: 'Stores' },
              { id: 'customer', label: 'Customers' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedTier === t.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls Island */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl pointer-events-auto">
          <button
            onClick={() => {
              setTracingMode(!tracingMode);
              if (tracingMode) setTraceResult(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              tracingMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'text-slate-300 bg-slate-800/80 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{tracingMode ? 'Tracing Mode Active' : 'Enable Blast Radius Tracer'}</span>
          </button>

          {traceResult && (
            <button
              onClick={() => setTraceResult(null)}
              className="px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Clear Trace
            </button>
          )}

          <button
            onClick={fetchGraph}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            title="Refresh Digital Twin Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#1e293b" gap={24} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n: any) => {
              const d = n.data as GraphNodeData;
              if (d.status === 'disrupted') return '#ef4444';
              if (d.status === 'warning') return '#f59e0b';
              return '#0ea5e9';
            }}
            maskColor="rgba(3, 7, 18, 0.75)"
          />
        </ReactFlow>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNodeData && (
        <aside className="absolute right-4 top-20 bottom-4 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-5 overflow-y-auto z-30 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Node Inspector · {selectedNodeData.tier}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedNodeData.name}</h3>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status & Location */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Operational Health</span>
              <span
                className={`font-semibold capitalize ${
                  selectedNodeData.status === 'disrupted'
                    ? 'text-rose-400 font-mono'
                    : selectedNodeData.status === 'warning'
                    ? 'text-amber-400 font-mono'
                    : 'text-emerald-400'
                }`}
              >
                {selectedNodeData.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Location</span>
              <span className="text-slate-200">{selectedNodeData.countryOrLocation}</span>
            </div>
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">
                {selectedNodeData.primaryMetricLabel}
              </span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                {selectedNodeData.primaryMetricValue}
              </span>
            </div>
            {selectedNodeData.secondaryMetricLabel && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">
                  {selectedNodeData.secondaryMetricLabel}
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400 mt-0.5 block">
                  {selectedNodeData.secondaryMetricValue}
                </span>
              </div>
            )}
          </div>

          {/* Extended Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Operational Attributes
            </h4>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              {Object.entries(selectedNodeData.details).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-400">{key}</span>
                  <span className="font-mono text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependency Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Network Topology Links
            </h4>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Upstream Feeds:</span>
                <span className="text-slate-300 font-mono">
                  {selectedNodeData.upstreamNodeIds.length > 0
                    ? selectedNodeData.upstreamNodeIds.join(', ')
                    : 'Tier-1 Root Origin'}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">Downstream Dependents:</span>
                <span className="text-slate-300 font-mono">
                  {selectedNodeData.downstreamNodeIds.length > 0
                    ? selectedNodeData.downstreamNodeIds.join(', ')
                    : 'Terminal Customer Node'}
                </span>
              </div>
            </div>
          </div>

          {/* Blast Radius Trace Button */}
          <div className="mt-auto pt-2">
            <button
              onClick={() => handleTraceClick(selectedNodeData.id)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Trace Downstream Blast Radius</span>
            </button>
          </div>

          {/* Active Trace Output in Drawer */}
          {traceResult && traceResult.rootEntityId === selectedNodeData.id && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Blast Radius Calculation Output</span>
              </div>
              <p className="text-[11px] text-slate-300">{traceResult.bottleneckAnalysis}</p>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div>Factories impacted: {traceResult.forwardTrace.factoriesAffected.join(', ')}</div>
                <div>Customer orders at risk: {traceResult.forwardTrace.customerOrdersAffected.length} orders</div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
