/**
 * SupplyGuard AI - Disruption Simulator & Active State Manager
 */

import { DisruptionEvent, RecoveryPlan } from '../../shared/types.ts';

// In-memory simulation state
let activeDisruptions: DisruptionEvent[] = [];
let simulationDay = 1;
let appliedRecoveryPlan: RecoveryPlan | null = null;

export function getActiveDisruptions(): DisruptionEvent[] {
  return [...activeDisruptions];
}

export function getAppliedRecoveryPlan(): RecoveryPlan | null {
  return appliedRecoveryPlan ? { ...appliedRecoveryPlan } : null;
}

export function setAppliedRecoveryPlan(plan: RecoveryPlan | null): void {
  appliedRecoveryPlan = plan;
}

export function getCurrentSimulationDay(): number {
  return simulationDay;
}

export function setSimulationDay(day: number): void {
  simulationDay = day;
}

/**
 * Main Demo Scenario:
 * Supplier S1 (Lumina Display Technologies) becomes unavailable for 14 days.
 */
export function triggerS1OutageDisruption(): DisruptionEvent {
  const event: DisruptionEvent = {
    id: `DIS-S1-${Date.now()}`,
    targetEntityId: 'S1',
    targetEntityName: 'Lumina Display Technologies Ltd (South Korea)',
    targetEntityType: 'supplier',
    type: 'complete_outage',
    severity: 'critical',
    startDay: 1,
    durationDays: 14,
    capacityImpactPercent: 100,
    description: 'Gumi OLED cleanroom fab offline for 14 days due to chemical vapor scrub breach and lithography tool autoclave burn-in. 0 units MAT001 OLED Display Screens available.',
    triggerTimestamp: new Date().toISOString(),
    isActive: true,
  };

  // Replace any existing S1 event or add
  activeDisruptions = activeDisruptions.filter((d) => d.targetEntityId !== 'S1');
  activeDisruptions.push(event);
  return event;
}

/**
 * Dynamic Adaptation Surprise Scenario:
 * First S1 failed, and now S2 (Apex MicroOptics & Displays) also fails!
 */
export function triggerS2SurpriseDisruption(): DisruptionEvent {
  const event: DisruptionEvent = {
    id: `DIS-S2-${Date.now()}`,
    targetEntityId: 'S2',
    targetEntityName: 'Apex MicroOptics & Displays Inc (Japan)',
    targetEntityType: 'supplier',
    type: 'complete_outage',
    severity: 'critical',
    startDay: 2,
    durationDays: 10,
    capacityImpactPercent: 100,
    description: 'Surprise secondary crisis: Osaka seismic safety interlocks halt secondary OLED display and camera cleanroom line. Secondary procurement capacity drops to 0.',
    triggerTimestamp: new Date().toISOString(),
    isActive: true,
  };

  // Ensure S1 is active, then add S2
  if (!activeDisruptions.some((d) => d.targetEntityId === 'S1' && d.isActive)) {
    triggerS1OutageDisruption();
  }

  activeDisruptions = activeDisruptions.filter((d) => d.targetEntityId !== 'S2');
  activeDisruptions.push(event);
  return event;
}

/**
 * Custom disruption simulator
 */
export function triggerCustomDisruption(disruption: Omit<DisruptionEvent, 'id' | 'triggerTimestamp' | 'isActive'>): DisruptionEvent {
  const event: DisruptionEvent = {
    ...disruption,
    id: `DIS-${disruption.targetEntityId}-${Date.now()}`,
    triggerTimestamp: new Date().toISOString(),
    isActive: true,
  };

  activeDisruptions = activeDisruptions.filter((d) => d.targetEntityId !== disruption.targetEntityId);
  activeDisruptions.push(event);
  return event;
}

/**
 * Reset all disruptions back to nominal baseline
 */
export function resetDisruptionState(): void {
  activeDisruptions = [];
  simulationDay = 1;
  appliedRecoveryPlan = null;
}
