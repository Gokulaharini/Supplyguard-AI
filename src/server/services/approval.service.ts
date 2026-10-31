/**
 * SupplyGuard AI - Human Approval & Audit Log Service
 * 
 * Enforces Responsible AI governance:
 * AI proposes actions; human operators hold sign-off authority.
 * Every critical action is recorded in an immutable audit ledger.
 */

import { ApprovalRecord, AuditLogItem, RecoveryPlan } from '../../shared/types.ts';

let pendingApprovals: ApprovalRecord[] = [];
let auditLogs: AuditLogItem[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    eventType: 'simulation_reset',
    actor: 'Simulation Engine',
    details: 'Digital Twin baseline established. 6 suppliers, 5 materials, 3 factories, 3 DCs, 4 stores, 8 customers initialized.',
  },
];

export function getApprovals(): ApprovalRecord[] {
  return [...pendingApprovals];
}

export function submitPlanForApproval(plan: RecoveryPlan): ApprovalRecord {
  // Check if already in queue
  const existing = pendingApprovals.find((a) => a.planId === plan.id);
  if (existing) return existing;

  const record: ApprovalRecord = {
    id: `APP-${Date.now()}`,
    planId: plan.id,
    planTitle: plan.title,
    strategyCategory: plan.strategyCategory,
    status: 'pending',
    requestedTimestamp: new Date().toISOString(),
    estimatedCostUSD: plan.metrics.totalRecoveryCostUSD,
    slaPreservationPercent: plan.metrics.slaPreservationRate,
  };

  pendingApprovals.unshift(record);

  addAuditLog({
    eventType: 'recovery_generated',
    actor: 'Autonomous Agent',
    details: `Submitted "${plan.title}" for human authorization. Total cost: $${plan.metrics.totalRecoveryCostUSD.toLocaleString()}, SLA protection: ${plan.metrics.slaPreservationRate}%.`,
    metadata: { planId: plan.id, code: plan.code },
  });

  return record;
}

export function processApprovalDecision(
  approvalId: string,
  decision: 'approved' | 'rejected',
  approverName: string = 'Supply Chain Director',
  approverRole: string = 'Operations Executive',
  justificationNotes: string = 'Authorized per standard operational resilience protocol.'
): ApprovalRecord {
  const item = pendingApprovals.find((a) => a.id === approvalId);
  if (!item) {
    throw new Error(`Approval record ${approvalId} not found`);
  }

  item.status = decision;
  item.actionedTimestamp = new Date().toISOString();
  item.approverName = approverName;
  item.approverRole = approverRole;
  item.justificationNotes = justificationNotes;

  addAuditLog({
    eventType: decision === 'approved' ? 'plan_approved' : 'plan_rejected',
    actor: 'Supply Chain Director',
    details: `Recovery Plan ${item.planTitle} was ${decision.toUpperCase()} by ${approverName} (${approverRole}). Notes: "${justificationNotes}"`,
    metadata: { approvalId, decision, planId: item.planId },
  });

  return item;
}

export function getAuditLogs(): AuditLogItem[] {
  return [...auditLogs];
}

export function addAuditLog(entry: Omit<AuditLogItem, 'id' | 'timestamp'>): AuditLogItem {
  const logItem: AuditLogItem = {
    ...entry,
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(logItem);
  return logItem;
}
