import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { calculateShadowCost, simulateMultipleScenarios, estimateMonthlyImpact } from '../services/costShadowService';

export function CostShadow() {
  const [directCost, setDirectCost] = useState(100);
  const [requestCount, setRequestCount] = useState(1000);
  const [selectedScenario, setSelectedScenario] = useState('normal');

  const shadowResult = calculateShadowCost(directCost / 1000000, selectedScenario, requestCount);
  const allScenarios = simulateMultipleScenarios(directCost / 1000000, requestCount);
  const monthlyImpact = estimateMonthlyImpact(directCost / 1000000, selectedScenario);

  const chartData = Object.entries(allScenarios).map(([scenario, result]) => ({
    name: scenario.charAt(0).toUpperCase() + scenario.slice(1),
    direct: parseFloat(result.directCost.toFixed(2)),
    shadow: parseFloat(result.totalShadowCost.toFixed(2)),
    retries: parseFloat(result.estimatedRetryCost.toFixed(2)),
    egress: parseFloat(result.egressCost.toFixed(2)),
    cache: parseFloat(result.cacheMissCost.toFixed(2))
  }));

  const costBreakdown = [
    { name: 'Direct Cost', value: shadowResult.directCost, color: '#3b82f6' },
    { name: 'Retries', value: shadowResult.estimatedRetryCost, color: '#ef4444' },
    { name: 'Network/Egress', value: shadowResult.egressCost, color: '#f59e0b' },
    { name: 'Cache Misses', value: shadowResult.cacheMissCost, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Cost Shadow Simulator</h2>
        </div>
        <p className="text-gray-700 mb-6">
          Discover hidden costs from failures, retries, and network overhead in different scenarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost per 1M tokens ($)
            </label>
            <input
              type="number"
              value={directCost}
              onChange={(e) => setDirectCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Request Count
            </label>
            <input
              type="number"
              value={requestCount}
              onChange={(e) => setRequestCount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal Operations</option>
              <option value="peak">Peak Load</option>
              <option value="failure">Service Degradation</option>
              <option value="degraded">Partial Degradation</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Current Scenario Breakdown</h3>
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">${item.value.toFixed(4)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total Shadow Cost</span>
              <span className="font-bold text-lg text-red-600">${shadowResult.totalShadowCost.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Monthly Projection</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Direct Cost (30 days)</span>
              <span className="font-semibold text-gray-900">${monthlyImpact.estimated.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-700">With Hidden Costs</span>
              <span className="font-semibold text-gray-900">${monthlyImpact.withShadow.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-sm font-medium text-red-900">Hidden Cost</div>
                <div className="text-lg font-bold text-red-700">
                  ${monthlyImpact.additionalCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Cost Comparison Across Scenarios</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any) => `$${value.toFixed(4)}`} />
            <Legend />
            <Bar dataKey="direct" fill="#3b82f6" name="Direct Cost" />
            <Bar dataKey="retries" fill="#ef4444" name="Retry Costs" />
            <Bar dataKey="egress" fill="#f59e0b" name="Egress Costs" />
            <Bar dataKey="cache" fill="#8b5cf6" name="Cache Miss Costs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How to Reduce Shadow Costs?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Implement response caching to reduce miss rates</li>
          <li>✓ Use circuit breakers to prevent cascading failures</li>
          <li>✓ Implement retries with exponential backoff</li>
          <li>✓ Monitor network conditions and egress costs</li>
          <li>✓ Implement request deduplication for redundant calls</li>
        </ul>
      </div>
    </div>
  );
}
