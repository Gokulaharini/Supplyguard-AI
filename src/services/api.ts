/**
 * SupplyGuard AI - Frontend API Service Client
 */

import {
  DisruptionEvent,
  ImpactAssessment,
  RecoveryPlan,
  OptimizationWeights,
  ApprovalRecord,
  AuditLogItem,
  EvaluationScenario,
  AutoRecoveryInvestigation,
} from '../shared/types.ts';
import { DigitalTwinGraph, TraceResult } from '../server/digital-twin/graph.types.ts';
import { AgentResponse, AgentRole } from '../server/agents/orchestrator.agent.ts';

const API_BASE = '/api';

export const api = {
  // Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  // Entities & Inventory
  async getSuppliers() {
    const res = await fetch(`${API_BASE}/suppliers`);
    return res.json();
  },

  async getInventory() {
    const res = await fetch(`${API_BASE}/inventory`);
    return res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return res.json();
  },

  // Digital Twin
  async getDigitalTwinGraph(): Promise<DigitalTwinGraph> {
    const res = await fetch(`${API_BASE}/digital-twin`);
    if (!res.ok) throw new Error('Failed to fetch digital twin graph');
    return res.json();
  },

  async traceEntity(entityId: string): Promise<TraceResult> {
    const res = await fetch(`${API_BASE}/digital-twin/trace/${entityId}`);
    if (!res.ok) throw new Error('Failed to trace entity dependencies');
    return res.json();
  },

  // Disruptions
  async getDisruptions(): Promise<{ activeDisruptions: DisruptionEvent[] }> {
    const res = await fetch(`${API_BASE}/disruptions`);
    return res.json();
  },

  async simulateS1Outage(): Promise<{ status: string; event: DisruptionEvent; impact: ImpactAssessment }> {
    const res = await fetch(`${API_BASE}/disruptions/simulate-s1`, { method: 'POST' });
    return res.json();
  },

  async simulateS2Surprise(): Promise<{ status: string; event: DisruptionEvent; impact: ImpactAssessment }> {
    const res = await fetch(`${API_BASE}/disruptions/simulate-s2-surprise`, { method: 'POST' });
    return res.json();
  },

  async simulateCustomDisruption(payload: Partial<DisruptionEvent>): Promise<{ status: string; event: DisruptionEvent; impact: ImpactAssessment }> {
    const res = await fetch(`${API_BASE}/disruptions/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async resetSimulation(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/disruptions/reset`, { method: 'POST' });
    return res.json();
  },

  // Impact & Evidence
  async getImpact(): Promise<ImpactAssessment> {
    const res = await fetch(`${API_BASE}/impact`);
    return res.json();
  },

  async getEvidence() {
    const res = await fetch(`${API_BASE}/evidence`);
    return res.json();
  },

  // Recovery & Optimization
  async generateRecovery(weights?: OptimizationWeights): Promise<{ status: string; plans: RecoveryPlan[]; weightsUsed: OptimizationWeights }> {
    const res = await fetch(`${API_BASE}/recovery/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights }),
    });
    return res.json();
  },

  async compareRecovery(weights: OptimizationWeights): Promise<{ status: string; plans: RecoveryPlan[]; weightsUsed: OptimizationWeights }> {
    const res = await fetch(`${API_BASE}/recovery/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights }),
    });
    return res.json();
  },

  // Auto Recovery Agent
  async runAutoRecovery(weights?: OptimizationWeights): Promise<{ status: string; investigation: AutoRecoveryInvestigation }> {
    const res = await fetch(`${API_BASE}/agent/recovery/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights }),
    });
    if (!res.ok) throw new Error('Failed to run autonomous recovery investigation');
    return res.json();
  },

  async recalculateAfterDisruption(weights?: OptimizationWeights): Promise<{ status: string; investigation: AutoRecoveryInvestigation }> {
    const res = await fetch(`${API_BASE}/agent/recovery/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights }),
    });
    if (!res.ok) throw new Error('Failed to recalculate recovery plans');
    return res.json();
  },

  async getAutoRecoveryState(): Promise<{ status: string; investigation: AutoRecoveryInvestigation }> {
    const res = await fetch(`${API_BASE}/agent/recovery/investigate`);
    if (!res.ok) throw new Error('Failed to fetch auto recovery state');
    return res.json();
  },

  async applyRecoveryPlan(planId: string): Promise<{ status: string; appliedPlan: RecoveryPlan }> {
    const res = await fetch(`${API_BASE}/recovery/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to apply recovery plan');
    }
    return res.json();
  },

  async rollbackRecoveryPlan(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/recovery/rollback`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to rollback recovery plan');
    return res.json();
  },

  async getAppliedRecoveryPlan(): Promise<{ appliedPlan: RecoveryPlan | null }> {
    const res = await fetch(`${API_BASE}/recovery/applied`);
    return res.json();
  },

  // AI Assistant
  async sendAiQuery(role: AgentRole, message: string): Promise<AgentResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, message }),
    });
    return res.json();
  },

  // Approvals & Audit Logs
  async getApprovals(): Promise<{ approvals: ApprovalRecord[] }> {
    const res = await fetch(`${API_BASE}/approvals`);
    return res.json();
  },

  async submitApproval(planId: string): Promise<{ status: string; record: ApprovalRecord }> {
    const res = await fetch(`${API_BASE}/approvals/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    return res.json();
  },

  async decideApproval(payload: {
    approvalId: string;
    decision: 'approved' | 'rejected';
    approverName?: string;
    approverRole?: string;
    justificationNotes?: string;
  }): Promise<{ status: string; approval: ApprovalRecord }> {
    const res = await fetch(`${API_BASE}/approvals/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLogItem[] }> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  },

  // Evaluation & Benchmark Testing
  async getEvaluations(): Promise<{ scenarios: EvaluationScenario[] }> {
    const res = await fetch(`${API_BASE}/evaluations`);
    return res.json();
  },

  async runEvaluations(scenarioId?: string) {
    const res = await fetch(`${API_BASE}/evaluations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    return res.json();
  },
};
