/**
 * SupplyGuard AI - Digital Twin Graph Builder
 * 
 * Assembles the full multi-tier topological graph:
 * Supplier -> Material -> Factory -> Distribution Centre -> Store -> Customer
 */

import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_FACTORIES,
  INITIAL_DISTRIBUTION_CENTRES,
  INITIAL_STORES,
  INITIAL_ORDERS,
} from '../database/synthetic-data.ts';
import { DigitalTwinGraph, GraphNode, GraphEdge, GraphNodeData } from './graph.types.ts';
import { DisruptionEvent, ImpactAssessment, NodeTier } from '../../shared/types.ts';

export function buildDigitalTwinGraph(
  activeDisruptions: DisruptionEvent[] = [],
  impactAssessment?: ImpactAssessment | null
): DigitalTwinGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Determine active disrupted entity IDs
  const disruptedEntityIds = new Set(
    activeDisruptions.filter((d) => d.isActive).map((d) => d.targetEntityId)
  );

  // Determine impacted entity IDs from blast radius calculation
  const impactedSupplierIds = new Set(impactAssessment?.affectedSuppliers || []);
  const impactedMaterialIds = new Set(impactAssessment?.affectedMaterials || []);
  const impactedFactoryIds = new Set(
    impactAssessment?.affectedFactories.map((f) => f.factoryId) || []
  );
  const impactedCustomerOrderIds = new Set(
    impactAssessment?.affectedOrders.map((o) => o.orderId) || []
  );

  // Column X coordinates for the 6 horizontal tiers
  const X_COORDS: Record<NodeTier, number> = {
    supplier: 80,
    material: 420,
    factory: 760,
    distribution: 1100,
    store: 1440,
    customer: 1780,
  };

  // Helper for status determination
  const determineStatus = (
    id: string,
    isDirectlyDisrupted: boolean,
    isDownstreamImpacted: boolean,
    defaultStatus: any = 'nominal'
  ) => {
    if (isDirectlyDisrupted) return 'disrupted';
    if (isDownstreamImpacted) return 'warning';
    return defaultStatus;
  };

  // 1. SUPPLIERS (Tier 0)
  INITIAL_SUPPLIERS.forEach((sup, idx) => {
    const isDirect = disruptedEntityIds.has(sup.id);
    const isImpacted = impactedSupplierIds.has(sup.id);
    const status = determineStatus(sup.id, isDirect, isImpacted, sup.status);

    const nodeData: GraphNodeData = {
      id: sup.id,
      name: sup.name,
      tier: 'supplier',
      subType: sup.tier,
      status,
      primaryMetricLabel: 'Daily Cap',
      primaryMetricValue: `${sup.dailyCapacityUnits.toLocaleString()} u`,
      secondaryMetricLabel: 'Lead Time',
      secondaryMetricValue: `${sup.nominalLeadTimeDays}d`,
      isDisrupted: isDirect,
      isImpacted,
      isInBlastRadius: isDirect || isImpacted,
      capacityUtilization: isDirect ? 0 : 0.85,
      countryOrLocation: `${sup.location}, ${sup.country}`,
      details: {
        'Expedite Lead Time': `${sup.expediteLeadTimeDays} days`,
        'Reliability Score': `${(sup.reliabilityScore * 100).toFixed(0)}%`,
        'CO2 footprint': `${sup.co2PerUnitKg} kg/u`,
        'Materials Provided': sup.materialsProvided.join(', '),
      },
      upstreamNodeIds: [],
      downstreamNodeIds: [...sup.materialsProvided],
    };

    nodes.push({
      id: sup.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.supplier, y: 80 + idx * 135 },
      data: nodeData,
    });

    // Edges: Supplier -> Material
    sup.materialsProvided.forEach((matId) => {
      const edgeId = `edge-${sup.id}-${matId}`;
      const edgeDisrupted = isDirect;
      edges.push({
        id: edgeId,
        source: sup.id,
        target: matId,
        animated: !edgeDisrupted,
        label: isDirect ? 'SEVERED' : undefined,
        style: {
          stroke: edgeDisrupted ? '#ef4444' : '#0ea5e9',
          strokeWidth: edgeDisrupted ? 3 : 2,
          strokeDasharray: edgeDisrupted ? '5 5' : undefined,
        },
        data: {
          flowRateUnits: isDirect ? 0 : sup.dailyCapacityUnits,
          isDisrupted: edgeDisrupted,
          isSevered: edgeDisrupted,
        },
      });
    });
  });

  // 2. MATERIALS (Tier 1)
  INITIAL_MATERIALS.forEach((mat, idx) => {
    const isDirect = disruptedEntityIds.has(mat.id);
    const isImpacted =
      impactedMaterialIds.has(mat.id) ||
      (mat.id === 'MAT001' && (disruptedEntityIds.has('S1') || disruptedEntityIds.has('S2')));
    const status = determineStatus(mat.id, isDirect, isImpacted);

    // Upstream suppliers for this material
    const upstreamSuppliers = INITIAL_SUPPLIERS.filter((s) =>
      s.materialsProvided.includes(mat.id)
    ).map((s) => s.id);

    // Downstream factories for this material
    const downstreamFactories = Object.keys(mat.standardBOMUsage);

    const nodeData: GraphNodeData = {
      id: mat.id,
      name: mat.name,
      tier: 'material',
      subType: mat.category,
      status,
      primaryMetricLabel: 'Unit Cost',
      primaryMetricValue: `$${mat.unitCostUSD.toFixed(0)}`,
      secondaryMetricLabel: 'Criticality',
      secondaryMetricValue: mat.criticality,
      isDisrupted: isDirect,
      isImpacted,
      isInBlastRadius: isDirect || isImpacted,
      isBottleneck: isImpacted,
      countryOrLocation: 'Smartphone Component',
      details: {
        'Category': mat.category,
        'Suppliers': upstreamSuppliers.join(', '),
        'Factories Consuming': downstreamFactories.join(', '),
      },
      upstreamNodeIds: upstreamSuppliers,
      downstreamNodeIds: downstreamFactories,
    };

    nodes.push({
      id: mat.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.material, y: 50 + idx * 95 },
      data: nodeData,
    });

    // Edges: Material -> Factory
    downstreamFactories.forEach((factoryId) => {
      const usage = mat.standardBOMUsage[factoryId];
      const edgeId = `edge-${mat.id}-${factoryId}`;
      const edgeSevered = isImpacted || isDirect;
      edges.push({
        id: edgeId,
        source: mat.id,
        target: factoryId,
        animated: !edgeSevered,
        label: `${usage}x BOM`,
        style: {
          stroke: edgeSevered ? '#f97316' : '#14b8a6',
          strokeWidth: 2,
        },
        data: {
          isDisrupted: edgeSevered,
        },
      });
    });
  });

  // 3. FACTORIES (Tier 2)
  INITIAL_FACTORIES.forEach((fact, idx) => {
    const isDirect = disruptedEntityIds.has(fact.id);
    const isImpacted =
      impactedFactoryIds.has(fact.id) ||
      (disruptedEntityIds.has('S1') && fact.id === 'F1');
    const status = determineStatus(fact.id, isDirect, isImpacted, fact.status);

    const nodeData: GraphNodeData = {
      id: fact.id,
      name: fact.name,
      tier: 'factory',
      status,
      primaryMetricLabel: 'Daily Output',
      primaryMetricValue: `${fact.dailyFinishedProductCapacity} u/d`,
      secondaryMetricLabel: 'OLED Stock Days',
      secondaryMetricValue: isImpacted ? '1.6d (CRITICAL)' : '6.0d',
      isDisrupted: isDirect,
      isImpacted,
      isInBlastRadius: isDirect || isImpacted,
      isBottleneck: isImpacted,
      countryOrLocation: fact.location,
      details: {
        'Finished Smartphones': fact.outputProducts.join(', '),
        'Daily OpEx': `$${fact.operationalCostPerDayUSD.toLocaleString()}/day`,
        'MAT001 OLED Stock': `${fact.inventoryOnHand.MAT001 || 0} units`,
        'MAT001 Consumption': `${fact.dailyConsumptionRate.MAT001 || 0} units/day`,
      },
      upstreamNodeIds: [
        'MAT001', 'MAT002', 'MAT003', 'MAT004', 'MAT005', 'MAT006',
        'MAT007', 'MAT008', 'MAT009', 'MAT010', 'MAT011', 'MAT012',
      ],
      downstreamNodeIds: ['DC1', 'DC2', 'DC3'],
    };

    nodes.push({
      id: fact.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.factory, y: 140 + idx * 230 },
      data: nodeData,
    });

    // Edges: Factory -> Distribution Centres
    const targetDCs =
      fact.id === 'F1'
        ? ['DC1', 'DC2', 'DC3']
        : fact.id === 'F2'
        ? ['DC1', 'DC3']
        : ['DC2'];

    targetDCs.forEach((dcId) => {
      const edgeId = `edge-${fact.id}-${dcId}`;
      const edgeImpacted = isImpacted;
      edges.push({
        id: edgeId,
        source: fact.id,
        target: dcId,
        animated: !edgeImpacted,
        style: {
          stroke: edgeImpacted ? '#fb923c' : '#38bdf8',
          strokeWidth: 2,
        },
        data: {
          isDisrupted: edgeImpacted,
        },
      });
    });
  });

  // 4. DISTRIBUTION CENTRES (Tier 3)
  INITIAL_DISTRIBUTION_CENTRES.forEach((dc, idx) => {
    const isDirect = disruptedEntityIds.has(dc.id);
    const isImpacted =
      disruptedEntityIds.has('S1') && (dc.id === 'DC2' || dc.id === 'DC1');
    const status = determineStatus(dc.id, isDirect, isImpacted, dc.status);

    const nodeData: GraphNodeData = {
      id: dc.id,
      name: dc.name,
      tier: 'distribution',
      status,
      primaryMetricLabel: 'Inventory',
      primaryMetricValue: `${(dc.currentInventoryUnits / 1000).toFixed(1)}k u`,
      secondaryMetricLabel: 'Safety Buffer',
      secondaryMetricValue: `${(dc.safetyStockFloor / 1000).toFixed(1)}k u`,
      isDisrupted: isDirect,
      isImpacted,
      isInBlastRadius: isDirect || isImpacted,
      countryOrLocation: dc.location,
      details: {
        'Capacity': `${dc.capacityUnits.toLocaleString()} units`,
        'Connected Factories': dc.connectedFactories.join(', '),
        'Connected Stores': dc.connectedStores.join(', '),
      },
      upstreamNodeIds: dc.connectedFactories,
      downstreamNodeIds: dc.connectedStores,
    };

    nodes.push({
      id: dc.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.distribution, y: 150 + idx * 230 },
      data: nodeData,
    });

    // Edges: DC -> Stores
    dc.connectedStores.forEach((storeId) => {
      const edgeId = `edge-${dc.id}-${storeId}`;
      edges.push({
        id: edgeId,
        source: dc.id,
        target: storeId,
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 },
      });
    });
  });

  // 5. STORES (Tier 4)
  INITIAL_STORES.forEach((store, idx) => {
    const isDirect = disruptedEntityIds.has(store.id);
    const isImpacted = disruptedEntityIds.has('S1') && (store.id === 'ST2' || store.id === 'ST1');
    const status = determineStatus(store.id, isDirect, isImpacted, store.status);

    const nodeData: GraphNodeData = {
      id: store.id,
      name: store.name,
      tier: 'store',
      status,
      primaryMetricLabel: 'Daily Demand',
      primaryMetricValue: `${store.dailyDemandUnits} u/d`,
      secondaryMetricLabel: 'On-Hand',
      secondaryMetricValue: `${store.currentInventoryUnits} u`,
      isDisrupted: isDirect,
      isImpacted,
      isInBlastRadius: isDirect || isImpacted,
      countryOrLocation: store.location,
      details: {
        'Supplying DC': store.distributionCentreId,
        'Safety Floor': `${store.safetyStockFloor} units`,
      },
      upstreamNodeIds: [store.distributionCentreId],
      downstreamNodeIds: [],
    };

    nodes.push({
      id: store.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.store, y: 100 + idx * 190 },
      data: nodeData,
    });
  });

  // 6. CUSTOMER ORDERS & CLIENTS (Tier 5)
  // Representative top customers from orders
  const customerList = [
    { id: 'C1', name: 'Horizon Wireless Telecom (5G Launch Carrier)', segment: 'carrier', orderId: 'ORD-101', priority: 'critical', val: '$850k', dcId: 'DC2' },
    { id: 'C2', name: 'Pacific Telco Global (National Network)', segment: 'carrier', orderId: 'ORD-103', priority: 'critical', val: '$1.45M', dcId: 'DC2' },
    { id: 'C3', name: 'Nordic Mobile Network Group', segment: 'telecom', orderId: 'ORD-104', priority: 'high', val: '$960k', dcId: 'DC1' },
    { id: 'C4', name: 'MediNet Health Systems (Secure Mobile Fleet)', segment: 'enterprise', orderId: 'ORD-102', priority: 'critical', val: '$620k', dcId: 'DC2' },
    { id: 'C5', name: 'Vanguard Mobile Retailers (Global Chain)', segment: 'retail', orderId: 'ORD-105', priority: 'high', val: '$720k', dcId: 'DC1' },
    { id: 'C6', name: 'MetroCellular Communications', segment: 'carrier', orderId: 'ORD-106', priority: 'high', val: '$480k', dcId: 'DC3' },
    { id: 'C7', name: 'OmniStore Consumer Electronics', segment: 'consumer', orderId: 'ORD-108', priority: 'medium', val: '$750k', dcId: 'DC3' },
  ];

  customerList.forEach((cust, idx) => {
    const isImpacted =
      impactedCustomerOrderIds.has(cust.orderId) ||
      (disruptedEntityIds.has('S1') && (cust.id === 'C2' || cust.id === 'C3'));
    const status = determineStatus(cust.id, false, isImpacted);

    const nodeData: GraphNodeData = {
      id: cust.id,
      name: cust.name,
      tier: 'customer',
      subType: cust.segment,
      status,
      primaryMetricLabel: 'Order Value',
      primaryMetricValue: cust.val,
      secondaryMetricLabel: 'Priority',
      secondaryMetricValue: cust.priority.toUpperCase(),
      isDisrupted: false,
      isImpacted,
      isInBlastRadius: isImpacted,
      countryOrLocation: 'Enterprise Client',
      details: {
        'Contract Order': cust.orderId,
        'Segment': cust.segment,
        'SLA Priority': cust.priority,
        'Fulfillment Hub': cust.dcId,
      },
      upstreamNodeIds: [cust.dcId],
      downstreamNodeIds: [],
    };

    nodes.push({
      id: cust.id,
      type: 'supplyGuardNode',
      position: { x: X_COORDS.customer, y: 70 + idx * 135 },
      data: nodeData,
    });

    // Edges: DC -> Customer
    const edgeId = `edge-${cust.dcId}-${cust.id}`;
    edges.push({
      id: edgeId,
      source: cust.dcId,
      target: cust.id,
      animated: !isImpacted,
      style: {
        stroke: isImpacted ? '#ef4444' : '#22c55e',
        strokeWidth: isImpacted ? 2.5 : 1.5,
      },
      data: {
        isDisrupted: isImpacted,
      },
    });
  });

  return {
    nodes,
    edges,
    metadata: {
      totalEntities: nodes.length,
      disruptedCount: nodes.filter((n) => n.data.status === 'disrupted').length,
      impactedCount: nodes.filter((n) => n.data.status === 'warning').length,
      lastUpdated: new Date().toISOString(),
      activeDisruptions: activeDisruptions.map((d) => `${d.targetEntityId}: ${d.description}`),
    },
  };
}
