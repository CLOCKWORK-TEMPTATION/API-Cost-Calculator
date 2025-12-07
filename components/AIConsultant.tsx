import { useState } from 'react';
import { generateRecommendations, calculatePotentialSavings } from '../services/aiConsultantService';
import { Lightbulb, Code, TrendingDown, CheckCircle } from 'lucide-react';
import { CostRecommendation } from '../types';

export function AIConsultant() {
  const [monthlySpend, setMonthlySpend] = useState(5000);
  const [recommendations, setRecommendations] = useState<CostRecommendation[]>([]);
  const [showCode, setShowCode] = useState<string | null>(null);
  const [implementedCount, setImplementedCount] = useState(0);

  const handleGenerateRecommendations = () => {
    const recs = generateRecommendations(undefined, monthlySpend);
    setRecommendations(recs);
  };

  const potentialSavings = calculatePotentialSavings(recommendations, monthlySpend);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  const categoryIcons = {
    caching: '💾',
    batching: '📦',
    'model-optimization': '⚡',
    'error-handling': '🛡️',
    architecture: '🏗️'
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI Cost Consultant</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Get AI-powered recommendations to optimize your API costs. Analyze your spending patterns and get actionable insights.
        </p>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Monthly Spend ($)
            </label>
            <input
              type="number"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
              step="100"
            />
          </div>
          <button
            onClick={handleGenerateRecommendations}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Recommendations</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">{recommendations.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Potential Monthly Savings</div>
            <div className="text-3xl font-bold text-green-900 mt-1">${potentialSavings.toFixed(0)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Implemented</div>
            <div className="text-3xl font-bold text-purple-900 mt-1">{implementedCount}</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{categoryIcons[rec.category] || '💡'}</span>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    {rec.status === 'implemented' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    ${((monthlySpend * rec.estimatedSavings) / 100).toFixed(0)}/mo
                  </div>
                  <div className="text-xs text-gray-500">{rec.estimatedSavings}% savings</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded font-medium ${difficultyColors[rec.implementationDifficulty]}`}>
                  {rec.implementationDifficulty.charAt(0).toUpperCase() + rec.implementationDifficulty.slice(1)}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                  {rec.category.replace('-', ' ')}
                </span>
              </div>

              {rec.codeSuggestion && (
                <button
                  onClick={() => setShowCode(showCode === idx.toString() ? null : idx.toString())}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Code className="w-4 h-4" />
                  {showCode === idx.toString() ? 'Hide' : 'Show'} Implementation
                </button>
              )}
            </div>

            {showCode === idx.toString() && rec.codeSuggestion && (
              <div className="bg-gray-900 text-gray-100 p-4 font-mono text-xs overflow-x-auto border-t border-gray-200">
                <pre>{rec.codeSuggestion}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Generate recommendations to get started</p>
          <p className="text-sm text-gray-500 mt-1">Click the button above to analyze your spending and get AI-powered optimization suggestions</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex gap-2 items-start">
            <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Action Plan</h3>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Start with the "Easy" difficulty recommendations for quick wins</li>
                <li>Implement top 3 recommendations to save ${(potentialSavings * 0.9).toFixed(0)}/month</li>
                <li>Monitor cache hit rates and error patterns after implementation</li>
                <li>Review quarterly to identify new optimization opportunities</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
