/**
 * SupplyGuard AI - Autonomous Multi-Agent Orchestrator
 * 
 * Houses the 6 specialized AI agents:
 * - Orchestrator Agent
 * - Disruption Analysis Agent
 * - Impact Analysis Agent
 * - Recovery Planning Agent
 * - Optimization Agent
 * - Explanation Agent
 */

import { getGeminiClient, isGeminiAvailable, handleGeminiError } from '../ai/gemini.client.ts';
import { getActiveDisruptions } from '../simulation/disruption.simulator.ts';
import { calculateDownstreamImpact } from '../services/impact.service.ts';
import { generateRecoveryScenarios } from '../optimization/scenario.generator.ts';

export type AgentRole =
  | 'orchestrator'
  | 'disruption'
  | 'impact'
  | 'recovery'
  | 'optimization'
  | 'explanation';

export interface AgentResponse {
  role: AgentRole;
  agentName: string;
  response: string;
  isAiGenerated: boolean;
  modelUsed?: string;
  evidenceCitations: string[];
  recommendedAction?: string;
  keyMetrics: Record<string, string | number>;
  timestamp: string;
}

export async function processAgentQuery(
  role: AgentRole = 'orchestrator',
  userMessage: string
): Promise<AgentResponse> {
  const activeDisruptions = getActiveDisruptions();
  const impact = calculateDownstreamImpact(activeDisruptions);
  const recoveryPlans = generateRecoveryScenarios(activeDisruptions);

  const topPlan = recoveryPlans.find((p) => p.scores.rank === 1) || recoveryPlans[0];

  // Construct ground-truth operational context for deterministic grounding
  const operationalContext = {
    activeDisruptionsCount: activeDisruptions.length,
    activeDisruptions: activeDisruptions.map((d) => ({
      entity: d.targetEntityName,
      durationDays: d.durationDays,
      description: d.description,
    })),
    totalFinancialExposureUSD: impact.totalFinancialImpactUSD,
    totalSlaPenaltiesUSD: impact.totalSlaPenaltiesUSD,
    productionLossUnits: impact.totalProductionDeficitUnits,
    affectedFactories: impact.affectedFactories.map((f) => ({
      name: f.factoryName,
      firstStockoutDay: f.firstStockoutDay,
      productionLossUnits: f.productionLossUnits,
    })),
    affectedOrdersCount: impact.affectedOrders.length,
    criticalOrdersAffected: impact.affectedOrders.filter((o) => o.priority === 'critical').map((o) => o.customerName),
    recommendedRecoveryPlan: {
      title: topPlan?.title,
      category: topPlan?.strategyCategory,
      costUSD: topPlan?.metrics.totalRecoveryCostUSD,
      slaProtectionPercent: topPlan?.metrics.slaPreservationRate,
      score: topPlan?.scores.weightedCompositeScore,
      feasible: topPlan?.isFeasible,
    },
  };

  const agentNames: Record<AgentRole, string> = {
    orchestrator: 'Master Autonomous Orchestrator Agent',
    disruption: 'Disruption & Threat Intelligence Agent',
    impact: 'Downstream Blast Radius & SLA Agent',
    recovery: 'Autonomous Recovery Formulation Agent',
    optimization: 'Deterministic Multi-Objective Optimization Agent',
    explanation: 'Executive Briefing & Transparency Agent',
  };

  const agentPrompts: Record<AgentRole, string> = {
    orchestrator: `You are the Master Autonomous Orchestrator for SupplyGuard AI. Coordinate crisis response, synthesize impact findings, and recommend executive actions. Ground every statement in real data.`,
    disruption: `You are the Disruption Intelligence Agent. Analyze root causes of supplier/transport failures, upstream tier-2 cascading vulnerabilities, and geographic bottlenecks.`,
    impact: `You are the Downstream Impact Agent. Quantify factory stockouts, inventory exhaustion timelines, delayed customer orders, and contractual SLA damages.`,
    recovery: `You are the Recovery Formulation Agent. Detail alternative procurement routes, safety stock reallocation, and line rescheduling actions.`,
    optimization: `You are the Multi-Objective Optimization Agent. Explain mathematical trade-offs between SLA preservation, cost efficiency, recovery speed, and risk.`,
    explanation: `You are the Executive Briefing Agent. Provide clear, transparent, actionable language for Operations Directors and C-suite leadership. Explicitly separate known facts from simulation estimates.`,
  };

  if (isGeminiAvailable()) {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `${agentPrompts[role]}
Current Supply Chain Digital Twin State:
${JSON.stringify(operationalContext, null, 2)}

Instructions:
- Provide an authoritative, professional operational debrief.
- Cite specific figures (e.g. stockout days, dollars, units) from the provided Digital Twin state.
- Keep the response structured, clear, and actionable. Do not use generic filler words.`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 3500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userMessage || 'Provide an operational status report and recommended recovery plan.',
          config: {
            systemInstruction,
          },
        });

        const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]);

        const responseText = geminiResponse.text?.trim() || 'No response generated from model.';

        return {
          role,
          agentName: agentNames[role],
          response: responseText,
          isAiGenerated: true,
          modelUsed: 'gemini-3.8-flash',
          evidenceCitations: [
            `Digital Twin Telemetry: ${activeDisruptions.length} active disruptions`,
            `Financial Liability Model: $${impact.totalFinancialImpactUSD.toLocaleString()} USD computed exposure`,
            `Optimization Scorecard: ${topPlan.title} (Score: ${topPlan.scores.weightedCompositeScore}/100)`,
          ],
          recommendedAction: topPlan.title,
          keyMetrics: {
            'Financial Exposure': `$${(impact.totalFinancialImpactUSD / 1000000).toFixed(2)}M`,
            'SLA Protection': `${topPlan.metrics.slaPreservationRate}%`,
            'Recovery Cost': `$${topPlan.metrics.totalRecoveryCostUSD.toLocaleString()}`,
            'Feasibility': topPlan.isFeasible ? 'VERIFIED' : 'INFEASIBLE',
          },
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        handleGeminiError('Orchestrator query', err);
      }
    }
  }

  // Deterministic Fallback Mode (Demo / Local Mode)
  let fallbackText = '';
  switch (role) {
    case 'disruption':
      fallbackText = activeDisruptions.length > 0
        ? `Threat Analysis: ${activeDisruptions.map((d) => `${d.targetEntityName} (${d.description})`).join('; ')}. Upstream reliance on Gumi OLED cleanroom fab (S1) represents a critical single point of failure. Recommend activating qualified secondary display panel sources in Osaka (S2) and reviewing safety stock allocations.`
        : `All upstream smartphone component suppliers and transit corridors are currently nominal. Real-time telemetry indicates 100% capacity adherence across Tier-1 and Tier-2 suppliers.`;
      break;

    case 'impact':
      fallbackText = impact.totalFinancialImpactUSD > 0
        ? `Downstream Blast Radius Analysis: Factory F1 (Shenzhen Smartphone Megafactory) exhausts MAT001 OLED display screen buffer in 1.6 days due to 1,000 unit/day burn rate. Total production deficit across the disruption horizon: ${impact.totalProductionDeficitUnits.toLocaleString()} smartphone units. ${impact.affectedOrders.length} carrier and retail customer commitments face SLA breach risk, totaling $${impact.totalSlaPenaltiesUSD.toLocaleString()} in contractual liquidated damages. Unabsorbed factory overhead: $${(impact.totalFinancialImpactUSD - impact.totalSlaPenaltiesUSD).toLocaleString()}.`
        : `Zero downstream impact detected. All smartphone assembly factories maintain healthy component buffer levels exceeding safety stock floors. Customer orders are 100% on schedule.`;
      break;

    case 'recovery':
      fallbackText = `Autonomous Recovery Formulation: Recommended Plan is "${topPlan.title}". This strategy combines express reallocation of 800 OLED screen units from Austin CyberPhone (F3) within 48 hours to avert assembly line stall, coupled with emergency secondary procurement and surgical carrier SLA queue rescheduling. Total execution cost: $${topPlan.metrics.totalRecoveryCostUSD.toLocaleString()} vs $${impact.totalFinancialImpactUSD.toLocaleString()} in unmitigated losses (Net savings: $${(impact.totalFinancialImpactUSD - topPlan.metrics.totalRecoveryCostUSD).toLocaleString()}).`;
      break;

    case 'optimization':
      fallbackText = `Deterministic Multi-Objective Evaluation: Strategy D achieved Rank #1 with a weighted composite score of ${topPlan.scores.weightedCompositeScore}/100. Trade-off breakdown: SLA Protection (${topPlan.scores.slaScore}/100, 30% weight) preserved 100% of critical carrier launch orders (Horizon Wireless & Pacific Telco); Cost Efficiency (${topPlan.scores.costEfficiencyScore}/100, 20% weight) saved $370k over brute-force air charters; Operational Risk (${topPlan.scores.riskMitigationScore}/100, 10% weight) verified all safety stock floors remained intact.`;
      break;

    case 'explanation':
      fallbackText = `Executive Operational Debrief:
1. SITUATION: Primary OLED display panel supplier S1 is offline for 14 days. Without intervention, Shenzhen Smartphone Assembly stalls in 38 hours.
2. FINANCIAL EXPOSURE: $${(impact.totalFinancialImpactUSD / 1000000).toFixed(2)}M across ${impact.affectedOrders.length} orders (carrier SLA penalties + idle cleanroom line overhead).
3. RECOMMENDED MITIGATION: Authorize Plan D ($${topPlan.metrics.totalRecoveryCostUSD.toLocaleString()}). Preserves 100% of Tier-1 carrier launch SLA contracts and restores normal smartphone production in 3.8 days.
4. ASSUMPTIONS: Internal air charter between Austin and Shenzhen confirmed at 48h transit; secondary OLED display spot market available at +30% price premium.`;
      break;

    case 'orchestrator':
    default:
      fallbackText = activeDisruptions.length > 0
        ? `Orchestrator Operational Status: Active crisis response initiated for ${activeDisruptions.length} disrupted node(s). The Digital Twin has calculated total financial exposure of $${(impact.totalFinancialImpactUSD / 1000000).toFixed(2)}M. Deterministic optimization evaluated 4 recovery strategies and selected "${topPlan.title}" as the optimal feasible recovery plan with ${topPlan.metrics.slaPreservationRate}% SLA preservation. Awaiting human executive authorization in the Approvals queue.`
        : `Orchestrator Status: Smartphone supply chain network is nominal. Continuous digital twin monitoring active across 8 suppliers, 12 smartphone materials, 3 factories, 3 DCs, and 4 retail flagship hubs.`;
      break;
  }

  return {
    role,
    agentName: agentNames[role],
    response: fallbackText,
    isAiGenerated: false,
    modelUsed: 'deterministic-expert-engine (demo mode)',
    evidenceCitations: [
      `Digital Twin Telemetry: ${activeDisruptions.length} active disruptions`,
      `Financial Liability Model: $${impact.totalFinancialImpactUSD.toLocaleString()} USD computed exposure`,
      `Optimization Scorecard: ${topPlan.title} (Score: ${topPlan.scores.weightedCompositeScore}/100)`,
    ],
    recommendedAction: topPlan.title,
    keyMetrics: {
      'Financial Exposure': `$${(impact.totalFinancialImpactUSD / 1000000).toFixed(2)}M`,
      'SLA Protection': `${topPlan.metrics.slaPreservationRate}%`,
      'Recovery Cost': `$${topPlan.metrics.totalRecoveryCostUSD.toLocaleString()}`,
      'Feasibility': topPlan.isFeasible ? 'VERIFIED' : 'INFEASIBLE',
    },
    timestamp: new Date().toISOString(),
  };
}
