import { BudgetAllocation, APICallRecord } from '../types';

export interface BudgetStatus {
  allocation: BudgetAllocation;
  percentageUsed: number;
  remainingBudget: number;
  isOverBudget: boolean;
  alertLevel: 'ok' | 'warning' | 'critical';
}

export interface TeamChargebackReport {
  teamName: string;
  period: string;
  totalCost: number;
  breakdown: {
    category: string;
    cost: number;
    percentage: number;
  }[];
  dailyAverage: number;
}

const DEFAULT_ALERT_THRESHOLD = 80;

export function createBudgetAllocation(
  teamName: string,
  monthlyBudget: number,
  period: string = new Date().toISOString().substring(0, 7)
): BudgetAllocation {
  return {
    teamName,
    monthlyBudget,
    spent: 0,
    period,
    alerts: []
  };
}

export function calculateBudgetStatus(
  allocation: BudgetAllocation,
  alertThreshold: number = DEFAULT_ALERT_THRESHOLD
): BudgetStatus {
  const percentageUsed = (allocation.spent / allocation.monthlyBudget) * 100;
  const remainingBudget = allocation.monthlyBudget - allocation.spent;
  const isOverBudget = remainingBudget < 0;

  let alertLevel: 'ok' | 'warning' | 'critical' = 'ok';
  if (isOverBudget) {
    alertLevel = 'critical';
  } else if (percentageUsed >= alertThreshold) {
    alertLevel = 'warning';
  }

  return {
    allocation,
    percentageUsed,
    remainingBudget,
    isOverBudget,
    alertLevel
  };
}

export function updateBudgetSpending(
  allocation: BudgetAllocation,
  additionalCost: number,
  alertThreshold: number = DEFAULT_ALERT_THRESHOLD
): BudgetAllocation & { alert?: string } {
  const newAllocation = { ...allocation, spent: allocation.spent + additionalCost };
  const status = calculateBudgetStatus(newAllocation, alertThreshold);

  const result = { ...newAllocation };

  if (status.alertLevel === 'warning') {
    result.alert = `Budget alert: ${status.percentageUsed.toFixed(1)}% used`;
    newAllocation.alerts.push(result.alert);
  } else if (status.alertLevel === 'critical') {
    result.alert = `CRITICAL: Budget exceeded by $${Math.abs(status.remainingBudget).toFixed(2)}`;
    newAllocation.alerts.push(result.alert);
  }

  return result;
}

export function generateChargebackReport(
  teamName: string,
  apiCalls: APICallRecord[],
  featureBreakdown?: boolean
): TeamChargebackReport {
  const period = new Date().toISOString().substring(0, 7);

  const breakdown: Record<string, number> = {};
  let totalCost = 0;

  apiCalls.forEach(call => {
    totalCost += call.cost + call.networkCost;

    if (featureBreakdown && call.featureTags && call.featureTags.length > 0) {
      const feature = call.featureTags[0];
      breakdown[feature] = (breakdown[feature] || 0) + call.cost + call.networkCost;
    } else {
      const category = call.model.includes('pro') ? 'Premium Models' : 'Standard Models';
      breakdown[category] = (breakdown[category] || 0) + call.cost + call.networkCost;
    }
  });

  const breakdownArray = Object.entries(breakdown).map(([category, cost]) => ({
    category,
    cost,
    percentage: (cost / totalCost) * 100
  }));

  return {
    teamName,
    period,
    totalCost,
    breakdown: breakdownArray.sort((a, b) => b.cost - a.cost),
    dailyAverage: totalCost / 30
  };
}

export function allocateBudgetToTeams(
  totalMonthlyBudget: number,
  teamWeights: Record<string, number>
): Record<string, BudgetAllocation> {
  const totalWeight = Object.values(teamWeights).reduce((sum, w) => sum + w, 0);
  const allocations: Record<string, BudgetAllocation> = {};

  Object.entries(teamWeights).forEach(([teamName, weight]) => {
    const allocatedBudget = (totalMonthlyBudget * weight) / totalWeight;
    allocations[teamName] = createBudgetAllocation(teamName, allocatedBudget);
  });

  return allocations;
}

export function forecastBudgetStatus(
  allocation: BudgetAllocation,
  dailySpendRate: number,
  daysRemaining: number
): {
  projectedTotal: number;
  willExceed: boolean;
  projectedExcessOrSurplus: number;
} {
  const projectedAdditionalSpend = dailySpendRate * daysRemaining;
  const projectedTotal = allocation.spent + projectedAdditionalSpend;
  const willExceed = projectedTotal > allocation.monthlyBudget;
  const projectedExcessOrSurplus = allocation.monthlyBudget - projectedTotal;

  return {
    projectedTotal,
    willExceed,
    projectedExcessOrSurplus
  };
}

export function generateBudgetAlerts(
  allocations: Record<string, BudgetAllocation>,
  alertThreshold: number = DEFAULT_ALERT_THRESHOLD
): Array<{ team: string; message: string; severity: 'info' | 'warning' | 'critical' }> {
  const alerts: Array<{ team: string; message: string; severity: 'info' | 'warning' | 'critical' }> = [];

  Object.entries(allocations).forEach(([_, allocation]) => {
    const status = calculateBudgetStatus(allocation, alertThreshold);

    if (status.alertLevel === 'critical') {
      alerts.push({
        team: allocation.teamName,
        message: `Budget exceeded by $${Math.abs(status.remainingBudget).toFixed(2)}`,
        severity: 'critical'
      });
    } else if (status.alertLevel === 'warning') {
      alerts.push({
        team: allocation.teamName,
        message: `${status.percentageUsed.toFixed(1)}% of budget used`,
        severity: 'warning'
      });
    }
  });

  return alerts;
}
