/**
 * SupplyGuard AI - Core Domain Types
 * Shared across Backend and Frontend
 */

export type NodeTier = 'supplier' | 'material' | 'factory' | 'distribution' | 'store' | 'customer';

export type OperationalStatus = 'nominal' | 'warning' | 'disrupted' | 'bottleneck' | 'offline';

export type TransportMode = 'air' | 'maritime' | 'rail' | 'road';

export type OrderPriority = 'critical' | 'high' | 'medium';

export interface Supplier {
  id: string;
  name: string;
  tier: 'tier-1' | 'tier-2';
  country: string;
  location: string;
  materialsProvided: string[]; // Material IDs
  dailyCapacityUnits: number;
  nominalLeadTimeDays: number;
  expediteLeadTimeDays: number;
  expediteCostMultiplier: number; // e.g. 1.25 (+25%)
  reliabilityScore: number; // 0.0 - 1.0
  co2PerUnitKg: number;
  status: OperationalStatus;
  notes: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'display' | 'battery' | 'semiconductor' | 'optics' | 'pcb' | 'hardware' | 'connector' | 'audio' | 'chassis' | 'conductor' | 'polymer';
  unitCostUSD: number;
  standardBOMUsage: Record<string, number>; // Factory or Product ID -> units needed per finished product
  substituteMaterialId?: string;
  criticality: 'critical' | 'moderate' | 'standard';
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  country: string;
  dailyFinishedProductCapacity: number;
  inventoryOnHand: Record<string, number>; // Material ID -> units
  safetyStockFloor: Record<string, number>; // Material ID -> units
  dailyConsumptionRate: Record<string, number>; // Material ID -> units/day
  operationalCostPerDayUSD: number;
  status: OperationalStatus;
  currentBottleneckMaterial?: string;
  outputProducts: string[];
}

export interface DistributionCentre {
  id: string;
  name: string;
  location: string;
  country: string;
  capacityUnits: number;
  currentInventoryUnits: number;
  safetyStockFloor: number;
  status: OperationalStatus;
  connectedFactories: string[];
  connectedStores: string[];
}

export interface RetailStore {
  id: string;
  name: string;
  location: string;
  distributionCentreId: string;
  dailyDemandUnits: number;
  currentInventoryUnits: number;
  safetyStockFloor: number;
  status: OperationalStatus;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerSegment: 'telecom' | 'carrier' | 'retail' | 'enterprise' | 'consumer' | 'aerospace' | 'medical' | 'cloud' | 'automotive' | 'industrial' | 'defense';
  productId: string;
  quantityUnits: number;
  totalOrderValueUSD: number;
  promisedDeliveryDay: number; // Relative simulation day (e.g. Day 10)
  currentEstimatedDeliveryDay: number;
  priority: OrderPriority;
  slaPenaltyPerDayUSD: number;
  slaMaxGraceDays: number;
  fulfillingFactoryId: string;
  distributionCentreId: string;
  status: 'on_schedule' | 'at_risk' | 'delayed' | 'fulfilled';
  calculatedPenaltyUSD: number;
}

export interface TransportRoute {
  id: string;
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  mode: TransportMode;
  transitDays: number;
  expeditedTransitDays: number;
  costPerUnitUSD: number;
  expediteCostPerUnitUSD: number;
  carbonKgPerUnit: number;
  riskFactor: number; // 0.0 - 1.0
  status: OperationalStatus;
}

export interface DisruptionEvent {
  id: string;
  targetEntityId: string;
  targetEntityName: string;
  targetEntityType: NodeTier;
  type: 'complete_outage' | 'capacity_reduction' | 'lead_time_surge' | 'freight_corridor_block' | 'demand_surge';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startDay: number;
  durationDays: number;
  capacityImpactPercent: number; // e.g. 100 for complete outage, 50 for 50%
  description: string;
  triggerTimestamp: string;
  isActive: boolean;
}

export interface ImpactAssessment {
  simulationId: string;
  disruptionSummary: string;
  timestamp: string;
  affectedSuppliers: string[];
  affectedMaterials: string[];
  affectedFactories: {
    factoryId: string;
    factoryName: string;
    stockoutDaysRemaining: Record<string, number>; // materialId -> days
    firstStockoutDay: number;
    productionLossUnits: number;
    financialLossUSD: number;
  }[];
  affectedOrders: {
    orderId: string;
    customerName: string;
    promisedDay: number;
    estimatedDay: number;
    delayDays: number;
    penaltyUSD: number;
    priority: OrderPriority;
  }[];
  totalProductionDeficitUnits: number;
  totalSlaPenaltiesUSD: number;
  totalFinancialImpactUSD: number;
  criticalityLevel: 'low' | 'moderate' | 'severe' | 'catastrophic';
  evidenceTrace: EvidenceRecord[];
}

export interface EvidenceRecord {
  id: string;
  timestamp: string;
  claim: string;
  sourceType: 'known_data' | 'simulation_assumption' | 'calculated_estimate' | 'missing_info_warning';
  sourceEntity: string;
  inputParameters: Record<string, string | number>;
  formulaOrRule: string;
  conclusion: string;
  confidenceScore: number; // 0.0 - 1.0
}

export interface RecoveryAction {
  id: string;
  actionType: 'expedite_supplier' | 'reroute_inventory' | 'reschedule_production' | 'switch_freight_mode' | 'substitute_material';
  description: string;
  sourceEntity: string;
  targetEntity: string;
  quantityUnits: number;
  estimatedCostUSD: number;
  timeToImplementDays: number;
  co2ImpactKg: number;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed';
}

export interface RecoveryPlan {
  id: string;
  code: 'plan_a' | 'plan_b' | 'plan_c' | 'plan_d';
  title: string;
  strategyCategory: 'alternative_supplier' | 'inventory_reallocation' | 'production_rescheduling' | 'hybrid_recovery';
  summary: string;
  actions: RecoveryAction[];
  isFeasible: boolean;
  feasibilityChecklist: {
    checkName: string;
    passed: boolean;
    reason: string;
  }[];
  metrics: {
    totalRecoveryCostUSD: number;
    slaPreservationRate: number; // 0 - 100%
    daysToFullRecovery: number;
    ordersPreservedCount: number;
    ordersDelayedCount: number;
    totalRemainingSlaPenaltiesUSD: number;
    operationalRiskScore: number; // 0 - 100 (lower is safer)
    sustainabilityScore: number; // 0 - 100 (higher is greener)
  };
  scores: {
    slaScore: number; // 0-100
    costEfficiencyScore: number; // 0-100
    recoverySpeedScore: number; // 0-100
    customerImpactScore: number; // 0-100
    riskMitigationScore: number; // 0-100
    sustainabilityScore: number; // 0-100
    weightedCompositeScore: number; // 0-100
    rank: number;
  };
  scoreExplanation: string;
  recommendationReason: string;
}

export interface OptimizationWeights {
  sla: number; // default 0.25 (25%)
  costEfficiency: number; // default 0.20 (20%)
  recoverySpeed: number; // default 0.20 (20%)
  customerImpact: number; // default 0.15 (15%)
  operationalRisk: number; // default 0.10 (10%)
  sustainability: number; // default 0.10 (10%)
}

export interface ApprovalRecord {
  id: string;
  planId: string;
  planTitle: string;
  strategyCategory: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedTimestamp: string;
  actionedTimestamp?: string;
  approverName?: string;
  approverRole?: string;
  justificationNotes?: string;
  estimatedCostUSD: number;
  slaPreservationPercent: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  eventType: 'disruption_triggered' | 'simulation_reset' | 'impact_computed' | 'recovery_generated' | 'plan_approved' | 'plan_rejected' | 'plan_applied' | 'plan_rolled_back' | 'weights_updated';
  actor: 'Autonomous Agent' | 'Supply Chain Director' | 'Safety System' | 'Simulation Engine';
  details: string;
  metadata?: Record<string, any>;
}

export interface EvaluatedSupplier {
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialName: string;
  dailyCapacity: number;
  nominalLeadTimeDays: number;
  expediteLeadTimeDays: number;
  unitCostUSD: number;
  expediteCostPerUnitUSD: number;
  reliabilityScore: number;
  location: string;
  country: string;
  isAvailable: boolean;
  isDisrupted: boolean;
  feasibilityStatus: 'FEASIBLE' | 'REJECTED_OFFLINE' | 'REJECTED_CAPACITY' | 'REJECTED_LEAD_TIME';
  rejectionReason?: string;
}

export interface EvaluatedInventoryBuffer {
  locationId: string;
  locationName: string;
  entityType: 'factory' | 'distribution';
  materialId: string;
  materialName: string;
  inventoryOnHand: number;
  safetyStockFloor: number;
  surplusUnits: number;
  canReallocate: boolean;
  proposedTransferUnits: number;
  destinationFacilityId: string;
  transitTimeDays: number;
}

export interface AutoRecoveryInvestigation {
  timestamp: string;
  activeDisruptions: DisruptionEvent[];
  failedSuppliers: { id: string; name: string; reason: string }[];
  affectedMaterials: { id: string; name: string; unitCostUSD: number }[];
  stockoutAlerts: { factoryId: string; factoryName: string; materialId: string; daysRemaining: number }[];
  evaluatedSuppliers: EvaluatedSupplier[];
  evaluatedBuffers: EvaluatedInventoryBuffer[];
  plans: RecoveryPlan[];
  recommendedPlan: RecoveryPlan;
  adaptationState: {
    isMultiDisruption: boolean;
    invalidatedPlans: string[];
    recalculatedImpact: boolean;
    adaptationSummary: string;
  };
  aiExplanation?: {
    summary: string;
    tradeoffs: string;
    recommendedRationale: string;
    modelUsed: string;
    isAiGenerated: boolean;
  };
  appliedPlan?: RecoveryPlan | null;
}

export interface EvaluationScenario {
  id: string;
  name: string;
  category: 'supplier_failure' | 'dual_failure' | 'logistics' | 'production' | 'demand';
  description: string;
  disruptions: Omit<DisruptionEvent, 'id' | 'triggerTimestamp' | 'isActive'>[];
  expectedImpact: {
    minDeficitUnits: number;
    maxDeficitUnits: number;
    affectedOrdersCount: number;
  };
  recommendedStrategy: 'alternative_supplier' | 'inventory_reallocation' | 'production_rescheduling' | 'hybrid_recovery';
  evaluationMetrics?: {
    runDurationMs: number;
    passed: boolean;
    computedSlaPreservation: number;
    computedRecoveryCost: number;
    verificationNotes: string;
  };
}
