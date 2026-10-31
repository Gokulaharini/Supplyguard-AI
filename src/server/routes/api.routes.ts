/**
 * SupplyGuard AI - REST API Routes
 * 
 * Provides unified, typed REST endpoints for all frontend modules:
 * - Dashboard KPIs
 * - Digital Twin graph & dependency tracing
 * - Disruption simulation & reset
 * - Downstream impact assessment
 * - Recovery planning & multi-criteria optimization
 * - Gemini AI assistant & agent orchestration
 * - Human approval workflow & audit logs
 * - Evaluation & benchmark testing centre
 */

import { Router, Request, Response } from 'express';
import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_FACTORIES,
  INITIAL_DISTRIBUTION_CENTRES,
  INITIAL_STORES,
  INITIAL_ORDERS,
  INITIAL_ROUTES,
} from '../database/synthetic-data.ts';
import { buildDigitalTwinGraph } from '../digital-twin/graph.builder.ts';
import { traceDownstreamBlastRadius } from '../digital-twin/dependency.tracer.ts';
import {
  getActiveDisruptions,
  getAppliedRecoveryPlan,
  triggerS1OutageDisruption,
  triggerS2SurpriseDisruption,
  triggerCustomDisruption,
  resetDisruptionState,
  getCurrentSimulationDay,
} from '../simulation/disruption.simulator.ts';
import { calculateDownstreamImpact } from '../services/impact.service.ts';
import { generateRecoveryScenarios } from '../optimization/scenario.generator.ts';
import { scoreAndRankPlans, DEFAULT_WEIGHTS } from '../optimization/scoring.engine.ts';
import { processAgentQuery } from '../agents/orchestrator.agent.ts';
import {
  runAutonomousInvestigation,
  applyRecoveryPlan,
  rollbackAppliedPlan,
} from '../agents/recovery.agent.ts';
import {
  getApprovals,
  submitPlanForApproval,
  processApprovalDecision,
  getAuditLogs,
  addAuditLog,
} from '../services/approval.service.ts';
import { runAllEvaluations, runSingleEvaluation } from '../evaluation/test.runner.ts';
import { BENCHMARK_SCENARIOS } from '../evaluation/test.scenarios.ts';
import { isGeminiAvailable } from '../ai/gemini.client.ts';
import { OptimizationWeights } from '../../shared/types.ts';

export const apiRouter = Router();

// ==========================================
// 1. DASHBOARD OVERVIEW & KPIS
// ==========================================
apiRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const impact = calculateDownstreamImpact(activeDisruptions);
    const plans = generateRecoveryScenarios(activeDisruptions);
    const topPlan = plans.find((p) => p.scores.rank === 1) || plans[0];
    const approvals = getApprovals();
    const auditLogs = getAuditLogs();

    // Compute Health Index (100 is perfect, drops as financial risk grows)
    const baseHealth = activeDisruptions.length === 0 ? 98 : Math.max(32, Math.round(95 - (impact.totalFinancialImpactUSD / 40000)));

    res.json({
      status: 'success',
      simulationDay: getCurrentSimulationDay(),
      healthScore: baseHealth,
      activeDisruptionsCount: activeDisruptions.length,
      activeDisruptions,
      totalFinancialRiskUSD: impact.totalFinancialImpactUSD,
      totalSlaPenaltiesUSD: impact.totalSlaPenaltiesUSD,
      totalProductionDeficitUnits: impact.totalProductionDeficitUnits,
      atRiskOrdersCount: impact.affectedOrders.length,
      recommendedPlan: topPlan
        ? {
            id: topPlan.id,
            code: topPlan.code,
            title: topPlan.title,
            costUSD: topPlan.metrics.totalRecoveryCostUSD,
            slaPreservationRate: topPlan.metrics.slaPreservationRate,
            daysToRecover: topPlan.metrics.daysToFullRecovery,
            score: topPlan.scores.weightedCompositeScore,
            isFeasible: topPlan.isFeasible,
          }
        : null,
      pendingApprovalsCount: approvals.filter((a) => a.status === 'pending').length,
      appliedRecoveryPlan: getAppliedRecoveryPlan(),
      geminiConnected: isGeminiAvailable(),
      suppliersCount: INITIAL_SUPPLIERS.length,
      factoriesCount: INITIAL_FACTORIES.length,
      recentAuditLogs: auditLogs.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 2. STATIC & ACTIVE INVENTORY / ENTITIES
// ==========================================
apiRouter.get('/suppliers', (req: Request, res: Response) => {
  const activeDisruptions = getActiveDisruptions();
  const disruptedIds = new Set(activeDisruptions.map((d) => d.targetEntityId));

  const suppliers = INITIAL_SUPPLIERS.map((s) => ({
    ...s,
    status: disruptedIds.has(s.id) ? 'disrupted' : s.status,
  }));
  res.json({ suppliers });
});

apiRouter.get('/materials', (req: Request, res: Response) => {
  res.json({ materials: INITIAL_MATERIALS });
});

apiRouter.get('/factories', (req: Request, res: Response) => {
  res.json({ factories: INITIAL_FACTORIES });
});

apiRouter.get('/inventory', (req: Request, res: Response) => {
  const inventorySnapshot = INITIAL_FACTORIES.map((f) => ({
    factoryId: f.id,
    factoryName: f.name,
    location: f.location,
    inventoryOnHand: f.inventoryOnHand,
    safetyStockFloor: f.safetyStockFloor,
    dailyConsumptionRate: f.dailyConsumptionRate,
  }));
  res.json({ inventory: inventorySnapshot });
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const activeDisruptions = getActiveDisruptions();
  const impact = calculateDownstreamImpact(activeDisruptions);
  const impactedOrderMap = new Map(impact.affectedOrders.map((o) => [o.orderId, o]));

  const orders = INITIAL_ORDERS.map((ord) => {
    const affected = impactedOrderMap.get(ord.id);
    return {
      ...ord,
      status: affected ? 'at_risk' : ord.status,
      currentEstimatedDeliveryDay: affected ? affected.estimatedDay : ord.promisedDeliveryDay,
      calculatedPenaltyUSD: affected ? affected.penaltyUSD : 0,
      delayDays: affected ? affected.delayDays : 0,
    };
  });

  res.json({ orders });
});

// ==========================================
// 3. DIGITAL TWIN GRAPH & DEPENDENCY TRACING
// ==========================================
apiRouter.get('/digital-twin', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const impact = calculateDownstreamImpact(activeDisruptions);
    const graph = buildDigitalTwinGraph(activeDisruptions, impact);
    res.json(graph);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.get('/digital-twin/trace/:entityId', (req: Request, res: Response) => {
  try {
    const { entityId } = req.params;
    const trace = traceDownstreamBlastRadius(entityId);
    res.json(trace);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 4. DISRUPTIONS SIMULATION & RESET
// ==========================================
apiRouter.get('/disruptions', (req: Request, res: Response) => {
  res.json({ activeDisruptions: getActiveDisruptions() });
});

// Primary demo: S1 fails for 14 days
apiRouter.post('/disruptions/simulate-s1', (req: Request, res: Response) => {
  try {
    const event = triggerS1OutageDisruption();
    addAuditLog({
      eventType: 'disruption_triggered',
      actor: 'Simulation Engine',
      details: `Triggered primary disruption: ${event.targetEntityName} offline for 14 days.`,
      metadata: event,
    });
    const impact = calculateDownstreamImpact(getActiveDisruptions());
    res.json({ status: 'success', event, impact });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Surprise dynamic adaptation: S2 also fails
apiRouter.post('/disruptions/simulate-s2-surprise', (req: Request, res: Response) => {
  try {
    const event = triggerS2SurpriseDisruption();
    addAuditLog({
      eventType: 'disruption_triggered',
      actor: 'Simulation Engine',
      details: `Triggered surprise secondary disruption: ${event.targetEntityName} concurrent failure! Recalculating all recovery strategies.`,
      metadata: event,
    });
    const impact = calculateDownstreamImpact(getActiveDisruptions());
    res.json({ status: 'success', event, impact });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Custom disruption
apiRouter.post('/disruptions/simulate', (req: Request, res: Response) => {
  try {
    const { targetEntityId, targetEntityName, targetEntityType, type, severity, startDay, durationDays, capacityImpactPercent, description } = req.body;
    
    if (!targetEntityId) {
      return res.status(400).json({ status: 'error', message: 'targetEntityId is required' });
    }

    const event = triggerCustomDisruption({
      targetEntityId,
      targetEntityName: targetEntityName || targetEntityId,
      targetEntityType: targetEntityType || 'supplier',
      type: type || 'complete_outage',
      severity: severity || 'high',
      startDay: Number(startDay) || 1,
      durationDays: Number(durationDays) || 10,
      capacityImpactPercent: Number(capacityImpactPercent) || 100,
      description: description || 'Custom simulated disruption event',
    });

    addAuditLog({
      eventType: 'disruption_triggered',
      actor: 'Simulation Engine',
      details: `Custom disruption injected on ${event.targetEntityName} (${event.durationDays} days).`,
      metadata: event,
    });

    const impact = calculateDownstreamImpact(getActiveDisruptions());
    res.json({ status: 'success', event, impact });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Reset simulation to nominal
apiRouter.post('/disruptions/reset', (req: Request, res: Response) => {
  try {
    resetDisruptionState();
    addAuditLog({
      eventType: 'simulation_reset',
      actor: 'Supply Chain Director',
      details: 'Digital twin reset to nominal baseline. All active disruptions cleared.',
    });
    res.json({ status: 'success', message: 'Simulation state successfully reset to nominal baseline.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 5. IMPACT ANALYSIS & EVIDENCE
// ==========================================
apiRouter.get('/impact', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const impact = calculateDownstreamImpact(activeDisruptions);
    res.json(impact);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.get('/evidence', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const impact = calculateDownstreamImpact(activeDisruptions);
    res.json({ evidenceTrace: impact.evidenceTrace });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 6. RECOVERY PLANNING & OPTIMIZATION
// ==========================================
apiRouter.post('/recovery/generate', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const customWeights: OptimizationWeights | undefined = req.body?.weights;
    const plans = generateRecoveryScenarios(activeDisruptions, customWeights);
    res.json({
      status: 'success',
      plans,
      weightsUsed: customWeights || DEFAULT_WEIGHTS,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.post('/recovery/compare', (req: Request, res: Response) => {
  try {
    const activeDisruptions = getActiveDisruptions();
    const customWeights: OptimizationWeights = req.body.weights || DEFAULT_WEIGHTS;
    const plans = generateRecoveryScenarios(activeDisruptions, customWeights);
    res.json({
      status: 'success',
      plans,
      weightsUsed: customWeights,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Auto Recovery Agent: Autonomous Investigation & Recalculation
apiRouter.get('/agent/recovery/investigate', async (req: Request, res: Response) => {
  try {
    const investigation = await runAutonomousInvestigation();
    res.json({ status: 'success', investigation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.post('/agent/recovery/run', async (req: Request, res: Response) => {
  try {
    const customWeights: OptimizationWeights | undefined = req.body?.weights;
    const investigation = await runAutonomousInvestigation(customWeights);
    res.json({ status: 'success', investigation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.post('/agent/recovery/recalculate', async (req: Request, res: Response) => {
  try {
    const customWeights: OptimizationWeights | undefined = req.body?.weights;
    const investigation = await runAutonomousInvestigation(customWeights);
    res.json({ status: 'success', investigation });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Apply & Rollback Recovery Plan in Simulation
apiRouter.post('/recovery/apply', (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ status: 'error', message: 'planId is required' });
    }
    const result = applyRecoveryPlan(planId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

apiRouter.post('/recovery/rollback', (req: Request, res: Response) => {
  try {
    const result = rollbackAppliedPlan();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.get('/recovery/applied', (req: Request, res: Response) => {
  res.json({ appliedPlan: getAppliedRecoveryPlan() });
});

// ==========================================
// 7. GEMINI AI DECISION ASSISTANT
// ==========================================
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { role = 'orchestrator', message = '' } = req.body;
    const agentResponse = await processAgentQuery(role, message);
    res.json(agentResponse);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 8. HUMAN APPROVAL & AUDIT LOGS
// ==========================================
apiRouter.get('/approvals', (req: Request, res: Response) => {
  res.json({ approvals: getApprovals() });
});

apiRouter.post('/approvals/submit', (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    const activeDisruptions = getActiveDisruptions();
    const plans = generateRecoveryScenarios(activeDisruptions);
    const plan = plans.find((p) => p.id === planId || p.code === planId);

    if (!plan) {
      return res.status(404).json({ status: 'error', message: `Plan ${planId} not found` });
    }

    const record = submitPlanForApproval(plan);
    res.json({ status: 'success', record });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.post('/approvals/decide', (req: Request, res: Response) => {
  try {
    const { approvalId, decision, approverName, approverRole, justificationNotes } = req.body;
    if (!approvalId || !decision) {
      return res.status(400).json({ status: 'error', message: 'approvalId and decision are required' });
    }

    const updated = processApprovalDecision(
      approvalId,
      decision,
      approverName,
      approverRole,
      justificationNotes
    );
    res.json({ status: 'success', approval: updated });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: getAuditLogs() });
});

// ==========================================
// 9. EVALUATION & BENCHMARK TESTING
// ==========================================
apiRouter.get('/evaluations', (req: Request, res: Response) => {
  res.json({ scenarios: BENCHMARK_SCENARIOS });
});

apiRouter.post('/evaluations/run', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.body;
    if (scenarioId) {
      const result = runSingleEvaluation(scenarioId);
      return res.json({ status: 'success', result });
    } else {
      const report = runAllEvaluations();
      return res.json({ status: 'success', report });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
