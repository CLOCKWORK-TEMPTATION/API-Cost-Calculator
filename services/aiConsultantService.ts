import { CostRecommendation, APICallRecord } from '../types';

const RECOMMENDATION_TEMPLATES: CostRecommendation[] = [
  {
    title: 'Enable Response Caching',
    description: 'Cache frequently used API responses to reduce redundant calls. This is especially effective for queries that are repeated within short time windows.',
    category: 'caching',
    estimatedSavings: 30,
    implementationDifficulty: 'easy',
    codeSuggestion: `const cache = new Map();
const key = hashRequest(params);
if (cache.has(key) && !isExpired(cache.get(key))) {
  return cache.get(key).data;
}
const result = await api.call(params);
cache.set(key, { data: result, timestamp: Date.now() });
return result;`,
    priority: 1
  },
  {
    title: 'Batch API Requests',
    description: 'Combine multiple individual requests into fewer batch requests. This reduces overhead and often provides better API discounts.',
    category: 'batching',
    estimatedSavings: 25,
    implementationDifficulty: 'medium',
    codeSuggestion: `const requests = [];
requests.push(api.getUserData(id1));
requests.push(api.getUserData(id2));
const [user1, user2] = await api.batchFetch(requests);`,
    priority: 2
  },
  {
    title: 'Use Cheaper Model Variant',
    description: 'Switch from Pro model to Flash for non-critical tasks. Flash provides 95% of Pro\'s capabilities at 1/10th the cost.',
    category: 'model-optimization',
    estimatedSavings: 40,
    implementationDifficulty: 'easy',
    codeSuggestion: `// For simple tasks, use Flash instead of Pro
const model = isComplexTask ? 'gemini-pro' : 'gemini-2.5-flash';
const response = await client.generateContent({ model, prompt });`,
    priority: 1
  },
  {
    title: 'Implement Circuit Breaker Pattern',
    description: 'Prevent cascading failures and wasted retries by implementing circuit breaker pattern. This reduces costs from failed retry attempts.',
    category: 'error-handling',
    estimatedSavings: 20,
    implementationDifficulty: 'medium',
    codeSuggestion: `class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute(fn) {
    if (this.failureCount >= this.threshold) {
      throw new Error('Circuit breaker is OPEN');
    }
    try {
      const result = await fn();
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      throw error;
    }
  }
}`,
    priority: 2
  },
  {
    title: 'Reduce Token Usage',
    description: 'Minimize input tokens by removing unnecessary context, using summaries, and filtering data before sending to API.',
    category: 'architecture',
    estimatedSavings: 35,
    implementationDifficulty: 'medium',
    codeSuggestion: `// Instead of sending entire documents
const fullText = await fetchDocument(); // 100k tokens
// Send only relevant parts
const relevant = extractRelevantSections(fullText); // 5k tokens
const response = await api.process(relevant);`,
    priority: 1
  },
  {
    title: 'Implement Request Deduplication',
    description: 'Detect and prevent duplicate requests within a short window. Great for handling race conditions and async operations.',
    category: 'architecture',
    estimatedSavings: 15,
    implementationDifficulty: 'easy',
    codeSuggestion: `const pendingRequests = new Map();
function dedupedFetch(key, fetchFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  const promise = fetchFn().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, promise);
  return promise;
}`,
    priority: 2
  }
];

export function generateRecommendations(
  apiCalls?: APICallRecord[],
  monthlySpend?: number
): CostRecommendation[] {
  const recommendations = [...RECOMMENDATION_TEMPLATES];

  if (apiCalls && apiCalls.length > 0) {
    const avgLatency = apiCalls.reduce((sum, c) => sum + (c.latencyMs || 0), 0) / apiCalls.length;
    const failureRate = apiCalls.filter(c => !c.success).length / apiCalls.length;
    const avgRetries = apiCalls.reduce((sum, c) => sum + (c.retryCount || 0), 0) / apiCalls.length;

    if (failureRate > 0.05) {
      const circuitBreakerIdx = recommendations.findIndex(r => r.category === 'error-handling');
      if (circuitBreakerIdx >= 0) {
        recommendations[circuitBreakerIdx].priority = 0;
        recommendations[circuitBreakerIdx].estimatedSavings = Math.min(45, failureRate * 100);
      }
    }

    if (avgRetries > 1.5) {
      const dedupIdx = recommendations.findIndex(r => r.title === 'Implement Request Deduplication');
      if (dedupIdx >= 0) {
        recommendations[dedupIdx].priority = 0;
        recommendations[dedupIdx].estimatedSavings = Math.min(40, avgRetries * 20);
      }
    }
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function calculatePotentialSavings(recommendations: CostRecommendation[], currentMonthlySpend: number): number {
  const topRecommendations = recommendations.slice(0, 3);
  const totalSavingsPercent = topRecommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);
  return (currentMonthlySpend * totalSavingsPercent) / 100;
}

export function getRecommendationsByCategory(category: CostRecommendation['category']): CostRecommendation[] {
  return RECOMMENDATION_TEMPLATES.filter(r => r.category === category);
}
