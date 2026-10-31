/**
 * SupplyGuard AI - Multi-Criteria Scoring & Optimization Engine
 * 
 * Implements deterministic mathematical weighted scoring:
 * Composite Score = w_sla * S_sla + w_cost * S_cost + w_speed * S_speed +
 *                   w_cust * S_cust + w_risk * S_risk + w_sustain * S_sustain
 * 
 * Invariant: Non-feasible plans cannot achieve Rank 1.
 */

import { RecoveryPlan, OptimizationWeights } from '../../shared/types.ts';

export const DEFAULT_WEIGHTS: OptimizationWeights = {
  sla: 0.25,             // 25% SLA performance
  costEfficiency: 0.20,  // 20% Cost efficiency
  recoverySpeed: 0.20,   // 20% Recovery time / speed
  customerImpact: 0.15,  // 15% Customer impact
  operationalRisk: 0.10, // 10% Operational risk
  sustainability: 0.10,  // 10% Sustainability
};

export function scoreAndRankPlans(
  plans: RecoveryPlan[],
  weights: OptimizationWeights = DEFAULT_WEIGHTS
): RecoveryPlan[] {
  // Normalize weights to sum to 1.0 just in case user tweaked sliders
  const totalWeight =
    weights.sla +
    weights.costEfficiency +
    weights.recoverySpeed +
    weights.customerImpact +
    weights.operationalRisk +
    weights.sustainability;

  const w = {
    sla: (weights.sla / totalWeight),
    costEfficiency: (weights.costEfficiency / totalWeight),
    recoverySpeed: (weights.recoverySpeed / totalWeight),
    customerImpact: (weights.customerImpact / totalWeight),
    operationalRisk: (weights.operationalRisk / totalWeight),
    sustainability: (weights.sustainability / totalWeight),
  };

  const calculatedPlans = plans.map((plan) => {
    // 1. SLA Score (0-100) based on SLA preservation rate & remaining penalty
    const slaScore = plan.metrics.slaPreservationRate;

    // 2. Cost Efficiency Score: Lower cost = higher score
    // Baseline max cost ~$450,000 -> 0 score, $0 -> 100 score
    const costScore = Math.max(10, Math.min(100, Math.round(100 - (plan.metrics.totalRecoveryCostUSD / 450000) * 80)));

    // 3. Recovery Speed Score: Fewer days = higher score
    // 1 day = 100, 14 days = 20
    const speedScore = Math.max(15, Math.min(100, Math.round(100 - (plan.metrics.daysToFullRecovery / 14) * 80)));

    // 4. Customer Impact Score: Ratio of preserved orders vs total orders
    const totalOrders = plan.metrics.ordersPreservedCount + plan.metrics.ordersDelayedCount;
    const custScore = totalOrders > 0
      ? Math.round((plan.metrics.ordersPreservedCount / totalOrders) * 100)
      : 80;

    // 5. Operational Risk Mitigation Score: (100 - operationalRiskScore)
    const riskScore = Math.max(0, 100 - plan.metrics.operationalRiskScore);

    // 6. Sustainability Score (Directly 0-100 based on CO2 intensity)
    const sustainScore = plan.metrics.sustainabilityScore;

    // Composite Weighted Calculation
    let compositeScore =
      w.sla * slaScore +
      w.costEfficiency * costScore +
      w.recoverySpeed * speedScore +
      w.customerImpact * custScore +
      w.operationalRisk * riskScore +
      w.sustainability * sustainScore;

    // Penalty if infeasible
    if (!plan.isFeasible) {
      compositeScore = Math.min(35, compositeScore * 0.4);
    }

    const roundedComposite = Math.round(compositeScore * 10) / 10;

    return {
      ...plan,
      scores: {
        slaScore: Math.round(slaScore),
        costEfficiencyScore: Math.round(costScore),
        recoverySpeedScore: Math.round(speedScore),
        customerImpactScore: Math.round(custScore),
        riskMitigationScore: Math.round(riskScore),
        sustainabilityScore: Math.round(sustainScore),
        weightedCompositeScore: roundedComposite,
        rank: 0, // Assigned below
      },
      scoreExplanation: `Composite ${roundedComposite}/100 computed deterministically: SLA (${(w.sla*100).toFixed(0)}% × ${Math.round(slaScore)}) + Cost (${(w.costEfficiency*100).toFixed(0)}% × ${Math.round(costScore)}) + Speed (${(w.recoverySpeed*100).toFixed(0)}% × ${Math.round(speedScore)}) + Customer (${(w.customerImpact*100).toFixed(0)}% × ${Math.round(custScore)}) + Risk (${(w.operationalRisk*100).toFixed(0)}% × ${Math.round(riskScore)}) + Green (${(w.sustainability*100).toFixed(0)}% × ${Math.round(sustainScore)}).`,
    };
  });

  // Sort: Feasible first, then highest composite score
  calculatedPlans.sort((a, b) => {
    if (a.isFeasible !== b.isFeasible) {
      return a.isFeasible ? -1 : 1;
    }
    return b.scores.weightedCompositeScore - a.scores.weightedCompositeScore;
  });

  // Assign ranks
  calculatedPlans.forEach((p, idx) => {
    p.scores.rank = idx + 1;
  });

  return calculatedPlans;
}
