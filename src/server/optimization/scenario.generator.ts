/**
 * SupplyGuard AI - Recovery Scenario Generator
 * 
 * Generates the 4 distinct recovery strategies:
 * Strategy A: Alternative Supplier Procurement (S2 expedite)
 * Strategy B: Inventory Reallocation (F3 safety buffer transfer)
 * Strategy C: Production Rescheduling & Customer Prioritization
 * Strategy D: Hybrid Multi-Action Recovery
 */

import { RecoveryPlan, DisruptionEvent, OptimizationWeights } from '../../shared/types.ts';
import { validatePlanConstraints } from './constraint.validator.ts';
import { scoreAndRankPlans, DEFAULT_WEIGHTS } from './scoring.engine.ts';

export function generateRecoveryScenarios(
  activeDisruptions: DisruptionEvent[],
  weights: OptimizationWeights = DEFAULT_WEIGHTS
): RecoveryPlan[] {
  const isS1Offline = activeDisruptions.some((d) => d.targetEntityId === 'S1' && d.isActive);
  const isS2Offline = activeDisruptions.some((d) => d.targetEntityId === 'S2' && d.isActive);

  // 1. STRATEGY A: ALTERNATIVE SUPPLIER PROCUREMENT
  const feasA = validatePlanConstraints('plan_a', activeDisruptions);
  const planA: RecoveryPlan = {
    id: 'PLAN-A-SUPPLIER',
    code: 'plan_a',
    title: 'Strategy A: Alternative Supplier Procurement Expedite',
    strategyCategory: 'alternative_supplier',
    summary: 'Shift OLED Display Screen procurement directly to secondary qualified supplier S2 (Apex MicroOptics & Displays, Osaka). Secure 600 units/day allocation via expedited air charter.',
    actions: [
      {
        id: 'ACT-A-01',
        actionType: 'expedite_supplier',
        description: 'Issue urgent purchase order to S2 (Apex MicroOptics & Displays) for 6,000 units MAT001 OLED Display Screens at expedited rate ($101.50/unit vs $78 baseline).',
        sourceEntity: 'S2',
        targetEntity: 'F1',
        quantityUnits: 6000,
        estimatedCostUSD: 240000,
        timeToImplementDays: 2.5,
        co2ImpactKg: 14200,
        status: 'proposed',
      },
      {
        id: 'ACT-A-02',
        actionType: 'switch_freight_mode',
        description: 'Book dedicated cargo flight Osaka Kansai -> Shenzhen Bao’an airport (TR-05) bypassing maritime bottleneck.',
        sourceEntity: 'TR-05',
        targetEntity: 'F1',
        quantityUnits: 6000,
        estimatedCostUSD: 144000,
        timeToImplementDays: 2.0,
        co2ImpactKg: 28400,
        status: 'proposed',
      },
    ],
    isFeasible: feasA.isFeasible,
    feasibilityChecklist: feasA.checklist,
    metrics: {
      totalRecoveryCostUSD: 384000,
      slaPreservationRate: feasA.isFeasible ? 92.5 : 0,
      daysToFullRecovery: feasA.isFeasible ? 3.5 : 14,
      ordersPreservedCount: feasA.isFeasible ? 11 : 2,
      ordersDelayedCount: feasA.isFeasible ? 1 : 10,
      totalRemainingSlaPenaltiesUSD: feasA.isFeasible ? 35000 : 640000,
      operationalRiskScore: feasA.isFeasible ? 35 : 95,
      sustainabilityScore: 42, // High CO2 from expedited air charter
    },
    scores: {
      slaScore: 0,
      costEfficiencyScore: 0,
      recoverySpeedScore: 0,
      customerImpactScore: 0,
      riskMitigationScore: 0,
      sustainabilityScore: 0,
      weightedCompositeScore: 0,
      rank: 0,
    },
    scoreExplanation: '',
    recommendationReason: feasA.isFeasible
      ? 'Fastest factory replenishment cycle (3.5 days). High air charter cost ($384k), but saves $600k+ in contractual SLA damages.'
      : 'INFEASIBLE: Secondary supplier S2 is currently offline due to simultaneous seismic shutdown.',
  };

  // 2. STRATEGY B: INVENTORY REALLOCATION
  const feasB = validatePlanConstraints('plan_b', activeDisruptions);
  const planB: RecoveryPlan = {
    id: 'PLAN-B-REALLOCATION',
    code: 'plan_b',
    title: 'Strategy B: Cross-Facility Inventory Reallocation',
    strategyCategory: 'inventory_reallocation',
    summary: 'Transfer 1,400 units of MAT001 OLED Display Screens from Austin CyberPhone (F3) surplus safety stock and 400 finished display sub-assemblies from Singapore Asian-Hub (DC3) to Shenzhen (F1) via regional express freight.',
    actions: [
      {
        id: 'ACT-B-01',
        actionType: 'reroute_inventory',
        description: 'Release 1,400 units MAT001 OLED screen buffer from Austin F3 (current stock 3,600 u; retains 2,200 u which exceeds 1,200 u safety floor).',
        sourceEntity: 'F3',
        targetEntity: 'F1',
        quantityUnits: 1400,
        estimatedCostUSD: 95000,
        timeToImplementDays: 2.0,
        co2ImpactKg: 8500,
        status: 'proposed',
      },
      {
        id: 'ACT-B-02',
        actionType: 'reroute_inventory',
        description: 'Transship 400 semi-finished display module units from Singapore DC3 hub to Shenzhen F1 to bridge assembly line idle gap.',
        sourceEntity: 'DC3',
        targetEntity: 'F1',
        quantityUnits: 400,
        estimatedCostUSD: 120000,
        timeToImplementDays: 1.5,
        co2ImpactKg: 6200,
        status: 'proposed',
      },
    ],
    isFeasible: feasB.isFeasible,
    feasibilityChecklist: feasB.checklist,
    metrics: {
      totalRecoveryCostUSD: 215000,
      slaPreservationRate: 84.0,
      daysToFullRecovery: 4.8,
      ordersPreservedCount: 10,
      ordersDelayedCount: 2,
      totalRemainingSlaPenaltiesUSD: 68000,
      operationalRiskScore: 28,
      sustainabilityScore: 78,
    },
    scores: {
      slaScore: 0,
      costEfficiencyScore: 0,
      recoverySpeedScore: 0,
      customerImpactScore: 0,
      riskMitigationScore: 0,
      sustainabilityScore: 0,
      weightedCompositeScore: 0,
      rank: 0,
    },
    scoreExplanation: '',
    recommendationReason: 'Extremely cost-efficient ($215k) by capitalizing on internal smartphone manufacturing inventory buffers. Moderate delivery speed with superior carbon efficiency.',
  };

  // 3. STRATEGY C: PRODUCTION RESCHEDULING & CUSTOMER PRIORITIZATION
  const feasC = validatePlanConstraints('plan_c', activeDisruptions);
  const planC: RecoveryPlan = {
    id: 'PLAN-C-PRIORITIZATION',
    code: 'plan_c',
    title: 'Strategy C: Production Rescheduling & SLA Priority Queue',
    strategyCategory: 'production_rescheduling',
    summary: 'Reroute remaining factory OLED screen inventory exclusively to Tier-1 critical carrier launch contracts (Horizon Wireless & Pacific Telco). Postpone consumer retail batches (OmniStore Digital) by 10 days within contractual grace periods.',
    actions: [
      {
        id: 'ACT-C-01',
        actionType: 'reschedule_production',
        description: 'Reconfigure Shenzhen F1 lines 1 & 2 to run exclusively Horizon Wireless ApexPhone Pro 16 and Pacific Telco 5G launch tiers.',
        sourceEntity: 'F1',
        targetEntity: 'ORD-101',
        quantityUnits: 1650,
        estimatedCostUSD: 45000,
        timeToImplementDays: 1.0,
        co2ImpactKg: 1200,
        status: 'proposed',
      },
      {
        id: 'ACT-C-02',
        actionType: 'reschedule_production',
        description: 'Notify OmniStore Digital Retail (ORD-108 & ORD-111) of planned delivery re-sequencing; invoke 4-day grace period, mitigating $220k SLA penalties.',
        sourceEntity: 'Customer Relations',
        targetEntity: 'ORD-108',
        quantityUnits: 2300,
        estimatedCostUSD: 80000,
        timeToImplementDays: 1.0,
        co2ImpactKg: 800,
        status: 'proposed',
      },
    ],
    isFeasible: feasC.isFeasible,
    feasibilityChecklist: feasC.checklist,
    metrics: {
      totalRecoveryCostUSD: 125000,
      slaPreservationRate: 76.5,
      daysToFullRecovery: 7.0,
      ordersPreservedCount: 8,
      ordersDelayedCount: 4,
      totalRemainingSlaPenaltiesUSD: 110000,
      operationalRiskScore: 48,
      sustainabilityScore: 92,
    },
    scores: {
      slaScore: 0,
      costEfficiencyScore: 0,
      recoverySpeedScore: 0,
      customerImpactScore: 0,
      riskMitigationScore: 0,
      sustainabilityScore: 0,
      weightedCompositeScore: 0,
      rank: 0,
    },
    scoreExplanation: '',
    recommendationReason: 'Lowest cash outlay ($125k) and lowest carbon emissions, but delays 4 consumer accounts and yields longer recovery lead times.',
  };

  // 4. STRATEGY D: HYBRID RECOVERY (MULTI-ACTION OPTIMIZED)
  const feasD = validatePlanConstraints('plan_d', activeDisruptions);
  const planD: RecoveryPlan = {
    id: 'PLAN-D-HYBRID',
    code: 'plan_d',
    title: 'Strategy D: Autonomous Multi-Modal Hybrid Recovery',
    strategyCategory: 'hybrid_recovery',
    summary: 'The optimal balanced smartphone recovery portfolio: 800 units express OLED buffer diversion from Austin (F3) + 3,200 units partial procurement from secondary suppliers/spot markets + dynamic carrier SLA queue rescheduling.',
    actions: [
      {
        id: 'ACT-D-01',
        actionType: 'reroute_inventory',
        description: 'Immediate express transfer of 800 units MAT001 OLED screens from Austin F3 to Shenzhen F1, arriving within 48 hours to avert imminent line stall.',
        sourceEntity: 'F3',
        targetEntity: 'F1',
        quantityUnits: 800,
        estimatedCostUSD: 68000,
        timeToImplementDays: 2.0,
        co2ImpactKg: 5200,
        status: 'proposed',
      },
      {
        id: 'ACT-D-02',
        actionType: 'expedite_supplier',
        description: isS2Offline
          ? 'Procure 3,200 units certified OLED display screens from Asian emergency distributor stock (Tokyo bonded warehouse).'
          : 'Issue balanced 3,200 unit procurement order to secondary supplier S2 at moderate expedite speed.',
        sourceEntity: isS2Offline ? 'Tokyo-Spot-Reserve' : 'S2',
        targetEntity: 'F1',
        quantityUnits: 3200,
        estimatedCostUSD: 160000,
        timeToImplementDays: 3.5,
        co2ImpactKg: 12800,
        status: 'proposed',
      },
      {
        id: 'ACT-D-03',
        actionType: 'reschedule_production',
        description: 'Prioritize production schedules for C1 Horizon Wireless and C5 MediNet Healthcare fleet devices while shifting non-critical retail replenishment by 48 hours.',
        sourceEntity: 'F1 Operations',
        targetEntity: 'Production Scheduling',
        quantityUnits: 1200,
        estimatedCostUSD: 40000,
        timeToImplementDays: 1.0,
        co2ImpactKg: 1100,
        status: 'proposed',
      },
    ],
    isFeasible: feasD.isFeasible,
    feasibilityChecklist: feasD.checklist,
    metrics: {
      totalRecoveryCostUSD: 268000,
      slaPreservationRate: 96.0,
      daysToFullRecovery: 3.8,
      ordersPreservedCount: 12,
      ordersDelayedCount: 0,
      totalRemainingSlaPenaltiesUSD: 0,
      operationalRiskScore: 18,
      sustainabilityScore: 76,
    },
    scores: {
      slaScore: 0,
      costEfficiencyScore: 0,
      recoverySpeedScore: 0,
      customerImpactScore: 0,
      riskMitigationScore: 0,
      sustainabilityScore: 0,
      weightedCompositeScore: 0,
      rank: 0,
    },
    scoreExplanation: '',
    recommendationReason: 'RECOMMENDED FEASIBLE PLAN: Highest composite resilience score. Eliminates 100% of contractual carrier SLA penalties with a balanced $268k cost footprint and ultra-low operational risk.',
  };

  const rawPlans = [planA, planB, planC, planD];
  return scoreAndRankPlans(rawPlans, weights);
}
