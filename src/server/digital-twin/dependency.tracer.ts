/**
 * SupplyGuard AI - Dependency & Blast Radius Tracer
 * 
 * Provides graph traversal algorithms for deterministic blast radius propagation
 * and root-cause tracing across the supply chain network.
 */

import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_FACTORIES,
  INITIAL_DISTRIBUTION_CENTRES,
  INITIAL_ORDERS,
} from '../database/synthetic-data.ts';

export interface TraceResult {
  rootEntityId: string;
  rootEntityType: string;
  forwardTrace: {
    materialsAffected: string[];
    factoriesAffected: string[];
    distributionCentresAffected: string[];
    customerOrdersAffected: string[];
    customersAffected: string[];
  };
  bottleneckAnalysis: string;
  daysToStockoutByFactory: Record<string, number>;
}

export function traceDownstreamBlastRadius(disruptedEntityId: string): TraceResult {
  const materialsAffected: Set<string> = new Set();
  const factoriesAffected: Set<string> = new Set();
  const distributionCentresAffected: Set<string> = new Set();
  const customerOrdersAffected: Set<string> = new Set();
  const customersAffected: Set<string> = new Set();
  const daysToStockoutByFactory: Record<string, number> = {};

  // Check if disrupted entity is a supplier
  const supplier = INITIAL_SUPPLIERS.find((s) => s.id === disruptedEntityId);
  if (supplier) {
    supplier.materialsProvided.forEach((m) => materialsAffected.add(m));
  } else if (disruptedEntityId.startsWith('MAT') || disruptedEntityId.startsWith('M')) {
    materialsAffected.add(disruptedEntityId);
  } else if (disruptedEntityId.startsWith('F')) {
    factoriesAffected.add(disruptedEntityId);
  }

  // 1. Trace Materials to Factories
  materialsAffected.forEach((matId) => {
    const mat = INITIAL_MATERIALS.find((m) => m.id === matId);
    if (mat) {
      Object.keys(mat.standardBOMUsage).forEach((factoryId) => {
        factoriesAffected.add(factoryId);
      });
    }
  });

  // 2. Calculate stockout days per factory
  factoriesAffected.forEach((fId) => {
    const factory = INITIAL_FACTORIES.find((f) => f.id === fId);
    if (!factory) return;

    let minDaysToStockout = 999;
    materialsAffected.forEach((matId) => {
      const onHand = factory.inventoryOnHand[matId] ?? 0;
      const dailyUse = factory.dailyConsumptionRate[matId] ?? 1;
      const days = onHand / dailyUse;
      if (days < minDaysToStockout) {
        minDaysToStockout = Math.round(days * 10) / 10;
      }
    });

    daysToStockoutByFactory[fId] = minDaysToStockout === 999 ? 0 : minDaysToStockout;
  });

  // 3. Trace Factories to Distribution Centres
  factoriesAffected.forEach((fId) => {
    INITIAL_DISTRIBUTION_CENTRES.forEach((dc) => {
      if (dc.connectedFactories.includes(fId)) {
        distributionCentresAffected.add(dc.id);
      }
    });
  });

  // 4. Trace Factories / DCs to Customer Orders
  INITIAL_ORDERS.forEach((order) => {
    const factoryImpacted = factoriesAffected.has(order.fulfillingFactoryId);
    const dcImpacted = distributionCentresAffected.has(order.distributionCentreId);

    if (factoryImpacted || dcImpacted) {
      // Check if promised delivery day is past the factory stockout date
      const stockoutDay = daysToStockoutByFactory[order.fulfillingFactoryId] ?? 999;
      if (order.promisedDeliveryDay >= stockoutDay) {
        customerOrdersAffected.add(order.id);
        customersAffected.add(order.customerName);
      }
    }
  });

  const bottleneckAnalysis = `Blast radius initiated at ${disruptedEntityId}. Downstream dependency propagated across ${materialsAffected.size} materials, ${factoriesAffected.size} assembly facilities, ${distributionCentresAffected.size} transshipment hubs, impacting ${customerOrdersAffected.size} critical customer purchase orders.`;

  return {
    rootEntityId: disruptedEntityId,
    rootEntityType: supplier ? 'supplier' : 'node',
    forwardTrace: {
      materialsAffected: Array.from(materialsAffected),
      factoriesAffected: Array.from(factoriesAffected),
      distributionCentresAffected: Array.from(distributionCentresAffected),
      customerOrdersAffected: Array.from(customerOrdersAffected),
      customersAffected: Array.from(customersAffected),
    },
    bottleneckAnalysis,
    daysToStockoutByFactory,
  };
}
