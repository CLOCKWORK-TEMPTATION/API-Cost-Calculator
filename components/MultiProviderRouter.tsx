import React, { useState, useEffect } from 'react';
import { Route, Settings, DollarSign, Clock, Zap, Globe, Server, AlertTriangle, CheckCircle, BarChart3, TrendingDown, Shuffle, Play, Pause, Activity, Brain } from 'lucide-react';
import { ProviderConfig, ProviderModel, RoutingDecision, RoutingPolicy, RoutingRule } from '../types';

const MultiProviderRouter: React.FC = () => {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [policies, setPolicies] = useState<RoutingPolicy[]>([]);
  const [routingDecision, setRoutingDecision] = useState<RoutingDecision | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [testRequest, setTestRequest] = useState({
    prompt: 'Write a short story about AI and cost optimization',
    maxTokens: 500,
    priority: 'normal',
    budgetLimit: 0.10
  });

  const mockProviders: ProviderConfig[] = [
    {
      id: 'openai-gpt',
      name: 'OpenAI GPT',
      type: 'openai',
      models: [
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          contextWindow: 128000,
          capabilities: ['text', 'function-calling', 'vision'],
          pricing: { inputPricePerMillion: 10.0, outputPricePerMillion: 30.0 },
          performance: { avgLatency: 800, reliability: 0.995 }
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          contextWindow: 16385,
          capabilities: ['text', 'function-calling'],
          pricing: { inputPricePerMillion: 0.5, outputPricePerMillion: 1.5 },
          performance: { avgLatency: 400, reliability: 0.992 }
        }
      ],
      pricing: {
        currency: 'USD',
        tier: 'pay-as-you-go',
        volumeDiscounts: [
          { minTokens: 1000000, discountPercentage: 10 },
          { minTokens: 10000000, discountPercentage: 25 }
        ],
        billingGranularity: 'token'
      },
      rateLimits: {
        requestsPerMinute: 3500,
        tokensPerMinute: 200000,
        concurrentConnections: 100
      },
      healthCheck: {
        endpoint: 'https://api.openai.com/v1/models',
        interval: 30000,
        timeout: 5000,
        retries: 3
      },
      priority: 2,
      enabled: true
    },
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude',
      type: 'anthropic',
      models: [
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          contextWindow: 200000,
          capabilities: ['text', 'vision', 'analysis'],
          pricing: { inputPricePerMillion: 15.0, outputPricePerMillion: 75.0 },
          performance: { avgLatency: 1200, reliability: 0.998 }
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          contextWindow: 200000,
          capabilities: ['text', 'vision'],
          pricing: { inputPricePerMillion: 3.0, outputPricePerMillion: 15.0 },
          performance: { avgLatency: 600, reliability: 0.997 }
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          contextWindow: 200000,
          capabilities: ['text'],
          pricing: { inputPricePerMillion: 0.25, outputPricePerMillion: 1.25 },
          performance: { avgLatency: 300, reliability: 0.996 }
        }
      ],
      pricing: {
        currency: 'USD',
        tier: 'pay-as-you-go',
        volumeDiscounts: [
          { minTokens: 500000, discountPercentage: 5 },
          { minTokens: 5000000, discountPercentage: 15 }
        ],
        billingGranularity: 'token'
      },
      rateLimits: {
        requestsPerMinute: 2000,
        tokensPerMinute: 150000,
        concurrentConnections: 50
      },
      healthCheck: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        interval: 30000,
        timeout: 5000,
        retries: 3
      },
      priority: 1,
      enabled: true
    },
    {
      id: 'google-gemini',
      name: 'Google Gemini',
      type: 'google',
      models: [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          contextWindow: 2000000,
          capabilities: ['text', 'vision', 'multimodal', 'function-calling'],
          pricing: { inputPricePerMillion: 3.50, outputPricePerMillion: 10.50, cachedPricePerMillion: 0.875 },
          performance: { avgLatency: 700, reliability: 0.994 }
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          contextWindow: 1000000,
          capabilities: ['text', 'vision', 'multimodal'],
          pricing: { inputPricePerMillion: 0.075, outputPricePerMillion: 0.30, cachedPricePerMillion: 0.01875 },
          performance: { avgLatency: 350, reliability: 0.992 }
        }
      ],
      pricing: {
        currency: 'USD',
        tier: 'pay-as-you-go',
        volumeDiscounts: [
          { minTokens: 2000000, discountPercentage: 20 },
          { minTokens: 20000000, discountPercentage: 40 }
        ],
        billingGranularity: 'token'
      },
      rateLimits: {
        requestsPerMinute: 5000,
        tokensPerMinute: 320000,
        concurrentConnections: 200
      },
      healthCheck: {
        endpoint: 'https://generativelanguage.googleapis.com/v1/models',
        interval: 30000,
        timeout: 5000,
        retries: 3
      },
      priority: 3,
      enabled: true
    },
    {
      id: 'azure-openai',
      name: 'Azure OpenAI',
      type: 'azure',
      models: [
        {
          id: 'gpt-4-turbo-azure',
          name: 'GPT-4 Turbo (Azure)',
          contextWindow: 128000,
          capabilities: ['text', 'function-calling', 'vision'],
          pricing: { inputPricePerMillion: 10.0, outputPricePerMillion: 30.0 },
          performance: { avgLatency: 750, reliability: 0.999 }
        },
        {
          id: 'gpt-35-turbo-azure',
          name: 'GPT-3.5 Turbo (Azure)',
          contextWindow: 16385,
          capabilities: ['text', 'function-calling'],
          pricing: { inputPricePerMillion: 0.5, outputPricePerMillion: 1.5 },
          performance: { avgLatency: 380, reliability: 0.998 }
        }
      ],
      pricing: {
        currency: 'USD',
        tier: 'enterprise',
        volumeDiscounts: [
          { minTokens: 1000000, discountPercentage: 15 },
          { minTokens: 10000000, discountPercentage: 35 }
        ],
        billingGranularity: 'token'
      },
      rateLimits: {
        requestsPerMinute: 3000,
        tokensPerMinute: 180000,
        concurrentConnections: 150
      },
      healthCheck: {
        endpoint: 'https://your-resource.openai.azure.com/openai/deployments',
        interval: 30000,
        timeout: 5000,
        retries: 3
      },
      priority: 4,
      enabled: true
    }
  ];

  const mockPolicies: RoutingPolicy[] = [
    {
      id: 'cost-optimization',
      name: 'Cost Optimization',
      rules: [
        {
          condition: 'budget_limit',
          action: 'route',
          target: 'google-gemini',
          weight: 0.4,
          conditions: {
            costLimit: 0.05,
            latencyLimit: 1000,
            reliabilityThreshold: 0.99
          }
        },
        {
          condition: 'high_priority',
          action: 'route',
          target: 'anthropic-claude',
          weight: 0.3,
          conditions: {
            costLimit: 0.50,
            latencyLimit: 800,
            reliabilityThreshold: 0.995
          }
        }
      ],
      priority: 1,
      enabled: true
    },
    {
      id: 'reliability-first',
      name: 'Reliability First',
      rules: [
        {
          condition: 'critical_request',
          action: 'route',
          target: 'azure-openai',
          weight: 0.6,
          conditions: {
            reliabilityThreshold: 0.999,
            latencyLimit: 1000
          }
        },
        {
          condition: 'standard_request',
          action: 'route',
          target: 'anthropic-claude',
          weight: 0.4,
          conditions: {
            reliabilityThreshold: 0.995,
            costLimit: 0.20
          }
        }
      ],
      priority: 2,
      enabled: false
    }
  ];

  useEffect(() => {
    setProviders(mockProviders);
    setPolicies(mockPolicies);
  }, []);

  const simulateRouting = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      // Simulate routing decision logic
      const availableProviders = providers.filter(p => p.enabled);
      const activePolicy = policies.find(p => p.enabled);
      
      let selectedProvider = availableProviders[0];
      let selectedModel = selectedProvider.models[0];
      let reasoning = '';
      
      // Simple routing logic based on budget and priority
      if (testRequest.budgetLimit < 0.05) {
        selectedProvider = providers.find(p => p.id === 'google-gemini') || availableProviders[0];
        selectedModel = selectedProvider.models.find(m => m.id.includes('flash')) || selectedProvider.models[0];
        reasoning = 'Budget constraint: Selected lowest cost provider (Gemini Flash)';
      } else if (testRequest.priority === 'high') {
        selectedProvider = providers.find(p => p.id === 'anthropic-claude') || availableProviders[0];
        selectedModel = selectedProvider.models.find(m => m.id.includes('opus')) || selectedProvider.models[0];
        reasoning = 'High priority: Selected premium provider (Claude Opus)';
      } else {
        // Cost-performance balance
        selectedProvider = availableProviders.reduce((best, current) => {
          const currentCost = current.models[0].pricing.inputPricePerMillion;
          const bestCost = best.models[0].pricing.inputPricePerMillion;
          const currentReliability = current.models[0].performance.reliability;
          const bestReliability = best.models[0].performance.reliability;
          
          const currentScore = (currentReliability * 0.6) + (1 - currentCost / 15) * 0.4;
          const bestScore = (bestReliability * 0.6) + (1 - bestCost / 15) * 0.4;
          
          return currentScore > bestScore ? current : best;
        });
        selectedModel = selectedProvider.models[0];
        reasoning = 'Balanced approach: Optimized for cost-performance ratio';
      }

      const estimatedTokens = Math.ceil(testRequest.prompt.length * 1.3 + testRequest.maxTokens / 2);
      const estimatedCost = (estimatedTokens / 1000000) * selectedModel.pricing.inputPricePerMillion + 
                           (testRequest.maxTokens / 1000000) * selectedModel.pricing.outputPricePerMillion;

      const decision: RoutingDecision = {
        providerId: selectedProvider.id,
        modelId: selectedModel.id,
        reasoning,
        estimatedCost,
        estimatedLatency: selectedModel.performance.avgLatency,
        confidence: 0.87,
        fallbackOptions: availableProviders
          .filter(p => p.id !== selectedProvider.id)
          .slice(0, 2)
          .map(p => p.id)
      };

      setRoutingDecision(decision);
      setIsSimulating(false);
    }, 2000);
  };

  const toggleProvider = (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'openai': return <Globe className="w-4 h-4" />;
      case 'anthropic': return <Brain className="w-4 h-4" />;
      case 'google': return <Zap className="w-4 h-4" />;
      case 'azure': return <Server className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getHealthColor = (reliability: number) => {
    if (reliability >= 0.998) return 'text-green-400';
    if (reliability >= 0.995) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredProviders = selectedProvider === 'all' 
    ? providers 
    : providers.filter(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Route className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold">Multi-Provider Router</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Providers</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Active Providers</span>
            <Server className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {providers.filter(p => p.enabled).length}/{providers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Available for routing</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Avg Cost/1M Tokens</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${(providers.reduce((sum, p) => sum + p.models[0].pricing.inputPricePerMillion, 0) / providers.length).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Input tokens</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Avg Reliability</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(providers.reduce((sum, p) => sum + p.models[0].performance.reliability, 0) / providers.length * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Uptime SLA</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Active Policies</span>
            <Settings className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {policies.filter(p => p.enabled).length}/{policies.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Routing rules</div>
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          Provider Configuration
        </h3>
        <div className="space-y-4">
          {filteredProviders.map(provider => (
            <div key={provider.id} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleProvider(provider.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      provider.enabled 
                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                        : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    }`}
                  >
                    {provider.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-2">
                    {getProviderIcon(provider.type)}
                    <span className="font-medium text-white">{provider.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">{provider.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${getHealthColor(provider.models[0].performance.reliability)}`}>
                    {(provider.models[0].performance.reliability * 100).toFixed(1)}% reliable
                  </span>
                  <span className="text-sm text-slate-400">
                    {provider.models.length} models
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-2">Available Models</div>
                  <div className="space-y-1">
                    {provider.models.map(model => (
                      <div key={model.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{model.name}</span>
                        <span className="text-slate-500">
                          ${model.pricing.inputPricePerMillion}/1M in
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Rate Limits</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Requests/min:</span>
                      <span className="text-slate-300">{provider.rateLimits.requestsPerMinute.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tokens/min:</span>
                      <span className="text-slate-300">{provider.rateLimits.tokensPerMinute.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Connections:</span>
                      <span className="text-slate-300">{provider.rateLimits.concurrentConnections}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Pricing & Discounts</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Billing:</span>
                      <span className="text-slate-300">{provider.pricing.billingGranularity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tier:</span>
                      <span className="text-slate-300">{provider.pricing.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max discount:</span>
                      <span className="text-green-400">
                        {Math.max(...provider.pricing.volumeDiscounts.map(d => d.discountPercentage))}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Policies */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Routing Policies
        </h3>
        <div className="space-y-4">
          {policies.map(policy => (
            <div key={policy.id} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{policy.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    policy.enabled 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {policy.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-slate-400">Priority: {policy.priority}</span>
                </div>
                <button
                  onClick={() => {
                    setPolicies(prev => prev.map(p => 
                      p.id === policy.id ? { ...p, enabled: !p.enabled } : p
                    ));
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                >
                  {policy.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="space-y-2">
                {policy.rules.map((rule, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">{rule.condition}</span>
                      <span className="text-blue-400">{rule.action} → {rule.target}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {rule.conditions.costLimit && (
                        <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                          Cost limit: ${rule.conditions.costLimit}
                        </span>
                      )}
                      {rule.conditions.latencyLimit && (
                        <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                          Latency: {rule.conditions.latencyLimit}ms
                        </span>
                      )}
                      {rule.conditions.reliabilityThreshold && (
                        <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                          Reliability: {(rule.conditions.reliabilityThreshold * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Simulator */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-orange-400" />
          Routing Simulator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-white mb-3">Test Request</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Prompt
                </label>
                <textarea
                  value={testRequest.prompt}
                  onChange={(e) => setTestRequest(prev => ({ ...prev, prompt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={testRequest.maxTokens}
                    onChange={(e) => setTestRequest(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Budget Limit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={testRequest.budgetLimit}
                    onChange={(e) => setTestRequest(prev => ({ ...prev, budgetLimit: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={testRequest.priority}
                  onChange={(e) => setTestRequest(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Routing Decision</h4>
            {routingDecision ? (
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Selected Provider:</span>
                    <span className="font-medium text-white">
                      {providers.find(p => p.id === routingDecision.providerId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="font-medium text-white">{routingDecision.modelId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Cost:</span>
                    <span className="font-medium text-green-400">${routingDecision.estimatedCost.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Latency:</span>
                    <span className="font-medium text-white">{routingDecision.estimatedLatency}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-medium text-blue-400">{(routingDecision.confidence * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Reasoning:</div>
                    <div className="text-sm text-slate-300">{routingDecision.reasoning}</div>
                  </div>

                  {routingDecision.fallbackOptions.length > 0 && (
                    <div className="pt-3 border-t border-slate-700">
                      <div className="text-sm text-slate-400 mb-2">Fallback Options:</div>
                      <div className="flex flex-wrap gap-2">
                        {routingDecision.fallbackOptions.map(option => (
                          <span key={option} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                            {providers.find(p => p.id === option)?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-lg p-4 text-center text-slate-400">
                <Shuffle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Configure test request and run simulation</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={simulateRouting}
          disabled={isSimulating}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Simulating routing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Routing Simulation
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MultiProviderRouter;
