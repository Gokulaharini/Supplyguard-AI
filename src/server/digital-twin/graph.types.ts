/**
 * SupplyGuard AI - Digital Twin Graph Types
 */

import { NodeTier, OperationalStatus } from '../../shared/types.ts';

export interface GraphNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  tier: NodeTier;
  subType?: string;
  status: OperationalStatus;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string;
  isDisrupted: boolean;
  isImpacted: boolean;
  isInBlastRadius: boolean;
  isBottleneck?: boolean;
  inventoryRatio?: number; // 0.0 - 1.0
  capacityUtilization?: number;
  countryOrLocation: string;
  details: Record<string, string | number>;
  upstreamNodeIds: string[];
  downstreamNodeIds: string[];
}

export type { TraceResult } from './dependency.tracer.ts';

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: GraphNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: {
    flowRateUnits?: number;
    transitDays?: number;
    mode?: string;
    isDisrupted?: boolean;
    isSevered?: boolean;
  };
}

export interface DigitalTwinGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalEntities: number;
    disruptedCount: number;
    impactedCount: number;
    lastUpdated: string;
    activeDisruptions: string[];
  };
}
