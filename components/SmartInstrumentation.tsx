import React, { useState, useEffect } from 'react';
import { Activity, Brain, Zap, TrendingDown, Code, Play, Pause, Settings, AlertTriangle, CheckCircle, BarChart3, Clock, Cpu, DollarSign } from 'lucide-react';
import { InstrumentationMetrics, OptimizationSuggestion, AutoOptimizationResult, OptimizationChange } from '../types';

const SmartInstrumentation: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<InstrumentationMetrics[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [autoOptimization, setAutoOptimization] = useState<AutoOptimizationResult | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');

  const mockMetrics: InstrumentationMetrics[] = [
    {
      endpointId: 'chat-api',
      callCount: 1247,
      avgLatency: 850,
      p95Latency: 1200,
      p99Latency: 1800,
      errorRate: 0.023,
      retryRate: 0.018,
      avgTokens: { input: 180, output: 85 },
      totalCost: 4.82,
      dataTransfer: 12.4,
      timestamp: new Date().toISOString()
    },
    {
      endpointId: 'embedding-api',
      callCount: 3421,
      avgLatency: 320,
      p95Latency: 450,
      p99Latency: 680,
      errorRate: 0.008,
      retryRate: 0.005,
      avgTokens: { input: 120, output: 0 },
      totalCost: 2.15,
      dataTransfer: 8.7,
      timestamp: new Date().toISOString()
    },
    {
      endpointId: 'image-generation',
      callCount: 89,
      avgLatency: 3200,
      p95Latency: 4500,
      p99Latency: 6200,
      errorRate: 0.045,
      retryRate: 0.032,
      avgTokens: { input: 45, output: 0 },
      totalCost: 4.01,
      dataTransfer: 45.2,
      timestamp: new Date().toISOString()
    }
  ];

  const mockSuggestions: OptimizationSuggestion[] = [
    {
      id: 'opt-1',
      type: 'batching',
      endpointId: 'embedding-api',
      currentPattern: 'Individual embedding calls for each text',
      suggestedPattern: 'Batch multiple embeddings in single API call',
      estimatedSavings: 28.5,
      implementationCode: `// Current pattern (inefficient)
const embeddings = [];
for (const text of texts) {
  const embedding = await embed(text);
  embeddings.push(embedding);
}

// Optimized pattern (batching)
const embeddings = await embedBatch(texts);
// Reduces API calls from N to 1`,
      difficulty: 'easy',
      impact: 'high',
      autoFixable: true
    },
    {
      id: 'opt-2',
      type: 'caching',
      endpointId: 'chat-api',
      currentPattern: 'No response caching implemented',
      suggestedPattern: 'Implement Redis-based response caching with 30min TTL',
      estimatedSavings: 42.3,
      implementationCode: `// Add caching middleware
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedResponse(prompt: string): Promise<string | null> {
  const cached = await redis.get(\`chat:\${hash(prompt)}\`);
  return cached;
}

async function setCachedResponse(prompt: string, response: string): Promise<void> {
  await redis.setex(\`chat:\${hash(prompt)}\`, 1800, response); // 30min TTL
}`,
      difficulty: 'medium',
      impact: 'high',
      autoFixable: false
    },
    {
      id: 'opt-3',
      type: 'model-switch',
      endpointId: 'chat-api',
      currentPattern: 'Using gemini-2.5-pro for all requests',
      suggestedPattern: 'Use gemini-2.5-flash for simple queries, pro for complex tasks',
      estimatedSavings: 35.8,
      implementationCode: `// Smart model selection
function selectModel(prompt: string, complexity: 'simple' | 'complex') {
  return complexity === 'simple' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
}

// Usage
const model = selectModel(prompt, analyzeComplexity(prompt));
const response = await generateContent({ prompt, model });`,
      difficulty: 'medium',
      impact: 'medium',
      autoFixable: true
    },
    {
      id: 'opt-4',
      type: 'prompt-optimization',
      endpointId: 'chat-api',
      currentPattern: 'Verbose prompts with redundant context',
      suggestedPattern: 'Compress prompts using template-based approach',
      estimatedSavings: 18.2,
      implementationCode: `// Current: verbose prompts
const prompt = \`You are a helpful assistant. Please help me with \${task}. 
I need you to be detailed and thorough in your response.\`;

// Optimized: template-based
const promptTemplate = (task: string) => \`Help with: \${task}\`;
const prompt = promptTemplate(task);`,
      difficulty: 'easy',
      impact: 'medium',
      autoFixable: true
    }
  ];

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMetrics(mockMetrics);
        setSuggestions(mockSuggestions);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const applyAutoOptimization = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !suggestion.autoFixable) return;

    const mockResult: AutoOptimizationResult = {
      applied: true,
      changes: [
        {
          filePath: 'src/services/api.ts',
          line: 45,
          type: 'batching',
          description: 'Implemented batch embedding calls',
          codeBefore: 'for (const text of texts) { const embedding = await embed(text); }',
          codeAfter: 'const embeddings = await embedBatch(texts);'
        }
      ],
      estimatedSavings: suggestion.estimatedSavings,
      performance: {
        before: mockMetrics[0],
        after: {
          ...mockMetrics[0],
          avgLatency: mockMetrics[0].avgLatency * 0.7,
          totalCost: mockMetrics[0].totalCost * 0.6,
          callCount: mockMetrics[0].callCount * 0.3
        }
      }
    };

    setAutoOptimization(mockResult);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'batching': return <Zap className="w-4 h-4" />;
      case 'caching': return <Clock className="w-4 h-4" />;
      case 'model-switch': return <Brain className="w-4 h-4" />;
      case 'prompt-optimization': return <Code className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'medium': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'low': return 'text-gray-400 bg-gray-900/20 border-gray-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const filteredMetrics = selectedEndpoint === 'all' 
    ? metrics 
    : metrics.filter(m => m.endpointId === selectedEndpoint);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Smart Instrumentation SDK</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Monitoring
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className={`rounded-xl p-4 border ${
        isMonitoring 
          ? 'bg-green-900/20 border-green-800' 
          : 'bg-slate-800/50 border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMonitoring ? (
              <>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Monitoring Active</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-slate-500 rounded-full" />
                <span className="text-slate-400 font-medium">Monitoring Inactive</span>
              </>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {isMonitoring ? 'Collecting real-time metrics...' : 'Click Start Monitoring to begin'}
          </div>
        </div>
      </div>

      {isMonitoring && metrics.length > 0 && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Total API Calls</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {metrics.reduce((sum, m) => sum + m.callCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">Across all endpoints</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Avg Latency</span>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.round(metrics.reduce((sum, m) => sum + m.avgLatency, 0) / metrics.length)}ms
              </div>
              <div className="text-xs text-slate-500 mt-1">P95: {Math.round(metrics.reduce((sum, m) => sum + m.p95Latency, 0) / metrics.length)}ms</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Total Cost</span>
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${metrics.reduce((sum, m) => sum + m.totalCost, 0).toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Current period</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Error Rate</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {(metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Retry rate: {(metrics.reduce((sum, m) => sum + m.retryRate, 0) / metrics.length * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Endpoint Filter */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-300">Filter by endpoint:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedEndpoint('all')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedEndpoint === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All Endpoints
                </button>
                {metrics.map(metric => (
                  <button
                    key={metric.endpointId}
                    onClick={() => setSelectedEndpoint(metric.endpointId)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedEndpoint === metric.endpointId
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {metric.endpointId}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              {filteredMetrics.map(metric => (
                <div key={metric.endpointId} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{metric.endpointId}</h4>
                    <span className="text-sm text-slate-400">
                      {metric.callCount.toLocaleString()} calls
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Avg Latency</div>
                      <div className="text-lg font-bold text-white">{metric.avgLatency}ms</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">P95 Latency</div>
                      <div className="text-lg font-bold text-white">{metric.p95Latency}ms</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Error Rate</div>
                      <div className="text-lg font-bold text-red-400">{(metric.errorRate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Total Cost</div>
                      <div className="text-lg font-bold text-green-400">${metric.totalCost.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Avg Tokens: {metric.avgTokens.input} in / {metric.avgTokens.output} out
                      </span>
                      <span className="text-slate-400">
                        Data: {metric.dataTransfer} MB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI-Powered Optimization Suggestions
            </h3>
            
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>No optimization suggestions available</p>
                <p className="text-sm">Your API usage is already optimized!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getImpactColor(suggestion.impact)}`}>
                          {getOptimizationIcon(suggestion.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-1">{suggestion.type}</h4>
                          <p className="text-sm text-slate-400 mb-2">{suggestion.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="px-2 py-1 bg-slate-900/50 rounded text-slate-300">
                              {suggestion.endpointId}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              suggestion.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                              suggestion.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {suggestion.difficulty}
                            </span>
                            <span className={`px-2 py-1 rounded ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact} impact
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          ${suggestion.estimatedSavings.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">potential savings</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded p-3 mb-3">
                      <div className="text-xs font-medium text-slate-400 mb-2">Current Pattern:</div>
                      <div className="text-sm text-slate-300 mb-2">{suggestion.currentPattern}</div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Suggested Pattern:</div>
                      <div className="text-sm text-green-400 mb-2">{suggestion.suggestedPattern}</div>
                    </div>

                    {suggestion.implementationCode && (
                      <div className="bg-slate-900/50 rounded p-3 mb-3">
                        <div className="text-xs font-medium text-slate-400 mb-2">Implementation Example:</div>
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                          {suggestion.implementationCode}
                        </pre>
                      </div>
                    )}

                    {suggestion.autoFixable && (
                      <button
                        onClick={() => applyAutoOptimization(suggestion.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Auto-Apply Fix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Optimization Results */}
          {autoOptimization && (
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                Auto-Optimization Applied Successfully
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">Changes Applied</h4>
                  <div className="space-y-2">
                    {autoOptimization.changes.map((change, idx) => (
                      <div key={idx} className="bg-slate-900/50 rounded p-3">
                        <div className="text-sm font-medium text-white mb-1">{change.description}</div>
                        <div className="text-xs text-slate-400 mb-1">
                          {change.filePath}:{change.line}
                        </div>
                        <div className="text-xs text-red-400 mb-1">Before: {change.codeBefore}</div>
                        <div className="text-xs text-green-400">After: {change.codeAfter}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">Performance Improvement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Savings:</span>
                      <span className="text-green-400 font-bold">${autoOptimization.estimatedSavings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latency Improvement:</span>
                      <span className="text-green-400 font-bold">
                        {Math.round((1 - autoOptimization.performance.after.avgLatency / autoOptimization.performance.before.avgLatency) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cost Reduction:</span>
                      <span className="text-green-400 font-bold">
                        {Math.round((1 - autoOptimization.performance.after.totalCost / autoOptimization.performance.before.totalCost) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">API Call Reduction:</span>
                      <span className="text-green-400 font-bold">
                        {Math.round((1 - autoOptimization.performance.after.callCount / autoOptimization.performance.before.callCount) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartInstrumentation;
