import { CostShadowScenario, ShadowCostResult } from '../types';

const SCENARIOS: Record<string, CostShadowScenario> = {
  normal: {
    name: 'Normal Operations',
    errorRate: 0.01,
    retryMultiplier: 1.1,
    networkCostPercentage: 0.05,
    cacheMissRate: 0.2
  },
  peak: {
    name: 'Peak Load',
    errorRate: 0.05,
    retryMultiplier: 1.3,
    networkCostPercentage: 0.15,
    cacheMissRate: 0.4
  },
  failure: {
    name: 'Service Degradation',
    errorRate: 0.15,
    retryMultiplier: 2.0,
    networkCostPercentage: 0.25,
    cacheMissRate: 0.6
  },
  degraded: {
    name: 'Partial Degradation',
    errorRate: 0.08,
    retryMultiplier: 1.5,
    networkCostPercentage: 0.12,
    cacheMissRate: 0.35
  }
};

export function calculateShadowCost(
  directCost: number,
  scenario: string = 'normal',
  requestCount: number = 1
): ShadowCostResult {
  const scen = SCENARIOS[scenario] || SCENARIOS.normal;

  const retryCostFactor = 1 + (scen.errorRate * (scen.retryMultiplier - 1));
  const estimatedRetryCost = directCost * (retryCostFactor - 1) * requestCount;

  const egressCost = directCost * (scen.networkCostPercentage / 100) * requestCount;

  const cacheMissCost = directCost * (scen.cacheMissRate / 100) * requestCount;

  const totalShadowCost = (directCost * retryCostFactor + egressCost + cacheMissCost) * requestCount;

  const baseCost = directCost * requestCount;
  const savings = totalShadowCost - baseCost;

  return {
    directCost: baseCost,
    estimatedRetryCost,
    egressCost,
    cacheMissCost,
    totalShadowCost,
    savings,
    description: `${scen.name} scenario: ${((savings / baseCost) * 100).toFixed(1)}% hidden costs`
  };
}

export function getScenarios(): Record<string, CostShadowScenario> {
  return SCENARIOS;
}

export function simulateMultipleScenarios(
  directCost: number,
  requestCount: number = 1
): Record<string, ShadowCostResult> {
  const results: Record<string, ShadowCostResult> = {};
  Object.keys(SCENARIOS).forEach(key => {
    results[key] = calculateShadowCost(directCost, key, requestCount);
  });
  return results;
}

export function estimateMonthlyImpact(
  dailyCost: number,
  scenario: string = 'normal'
): { estimated: number; withShadow: number; additionalCost: number } {
  const monthlyDirect = dailyCost * 30;
  const result = calculateShadowCost(dailyCost, scenario, 30);

  return {
    estimated: monthlyDirect,
    withShadow: result.totalShadowCost,
    additionalCost: result.savings
  };
}
