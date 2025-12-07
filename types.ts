
export enum ModelId {
  // Gemini 3 Series
  GEMINI_3_PRO_PREVIEW = 'gemini-3-pro-preview',
  
  // Gemini 2.5 Series
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash',
  GEMINI_2_5_FLASH_LITE = 'gemini-2.5-flash-lite',
  GEMINI_2_5_FLASH_IMAGE = 'gemini-2.5-flash-image',
  
  // Gemini 2.0 Series
  GEMINI_2_0_PRO_EXP = 'gemini-2.0-pro-exp',
  GEMINI_2_0_FLASH = 'gemini-2.0-flash',
  GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',

  // Gemma 3 Series
  GEMMA_3_27B = 'gemma-3-27b-it',
  
  // Media Generation
  IMAGEN_4_GENERATE = 'imagen-4.0-generate-001',
  VEO_3_1_GENERATE = 'veo-3.1-generate-preview',
  
  // Embeddings
  TEXT_EMBEDDING_004 = 'text-embedding-004'
}

export interface PricingTier {
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cachedInputPricePerMillion?: number;
  contextCachingStoragePerMillionPerHour?: number;
  inputAudioPricePerSecond?: number; // Usually calculated via tokens, but some have specific pricing
  inputVideoPricePerSecond?: number; // Usually calculated via tokens
  pricePerImage?: number;
  pricePerSecondVideo?: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  pricing: PricingTier;
  contextWindow: number;
  isCustom?: boolean;
  releaseDate?: string;
  type?: 'text' | 'image' | 'video' | 'multimodal' | 'embedding' | 'audio';
}

export interface UsageResult {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  currency: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  usage?: UsageResult;
}

export interface CostShadowScenario {
  name: string;
  errorRate: number;
  retryMultiplier: number;
  networkCostPercentage: number;
  cacheMissRate: number;
}

export interface ShadowCostResult {
  directCost: number;
  estimatedRetryCost: number;
  egressCost: number;
  cacheMissCost: number;
  totalShadowCost: number;
  savings: number;
  description: string;
}

export interface CostRecommendation {
  id?: string;
  title: string;
  description: string;
  category: 'caching' | 'batching' | 'model-optimization' | 'error-handling' | 'architecture';
  estimatedSavings: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  codeSuggestion?: string;
  priority: number;
  status?: 'pending' | 'approved' | 'implemented' | 'rejected';
}

export interface BudgetAllocation {
  id?: string;
  teamName: string;
  monthlyBudget: number;
  spent: number;
  period: string;
  alerts: string[];
}

export interface Organization {
  id?: string;
  name: string;
  slug: string;
  currency: string;
}

export interface APICallRecord {
  id?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  success: boolean;
  retryCount: number;
  networkCost: number;
  latencyMs: number;
  timestamp: string;
  featureTags?: string[];
}

// Git-aware Cost Diff interfaces
export interface PullRequestCostAnalysis {
  id: string;
  title: string;
  baseBranch: string;
  headBranch: string;
  filesChanged: FileCostChange[];
  totalCostImpact: CostImpact;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: CostRecommendation[];
  timestamp: string;
}

export interface FileCostChange {
  filePath: string;
  changeType: 'added' | 'modified' | 'deleted';
  addedLines: number;
  deletedLines: number;
  apiCallChanges: APICallChange[];
  costImpact: number;
  riskFactors: string[];
}

export interface APICallChange {
  line: number;
  type: 'added' | 'modified' | 'removed';
  oldCall?: string;
  newCall?: string;
  modelChange?: string;
  tokenEstimate: {
    input: number;
    output: number;
  };
  costDelta: number;
}

export interface CostImpact {
  estimatedDailyCost: number;
  estimatedMonthlyCost: number;
  costChangePercentage: number;
  confidenceLevel: number;
}

// Smart Instrumentation SDK interfaces
export interface InstrumentationMetrics {
  endpointId: string;
  callCount: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  retryRate: number;
  avgTokens: {
    input: number;
    output: number;
  };
  totalCost: number;
  dataTransfer: number;
  timestamp: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'batching' | 'caching' | 'model-switch' | 'prompt-optimization' | 'request-reduction';
  endpointId: string;
  currentPattern: string;
  suggestedPattern: string;
  estimatedSavings: number;
  implementationCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export interface AutoOptimizationResult {
  applied: boolean;
  changes: OptimizationChange[];
  estimatedSavings: number;
  performance: {
    before: InstrumentationMetrics;
    after: InstrumentationMetrics;
  };
}

export interface OptimizationChange {
  filePath: string;
  line: number;
  type: string;
  description: string;
  codeBefore: string;
  codeAfter: string;
}

// Multi-Provider Router interfaces
export interface ProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  models: ProviderModel[];
  pricing: ProviderPricing;
  rateLimits: RateLimit;
  healthCheck: HealthCheck;
  priority: number;
  enabled: boolean;
}

export interface ProviderModel {
  id: string;
  name: string;
  contextWindow: number;
  capabilities: string[];
  pricing: {
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    cachedPricePerMillion?: number;
  };
  performance: {
    avgLatency: number;
    reliability: number;
  };
}

export interface ProviderPricing {
  currency: string;
  tier: string;
  volumeDiscounts: VolumeDiscount[];
  billingGranularity: 'token' | 'request' | 'minute';
}

export interface VolumeDiscount {
  minTokens: number;
  discountPercentage: number;
}

export interface RateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
  concurrentConnections: number;
}

export interface HealthCheck {
  endpoint: string;
  interval: number;
  timeout: number;
  retries: number;
}

export interface RoutingDecision {
  providerId: string;
  modelId: string;
  reasoning: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
  fallbackOptions: string[];
}

export interface RoutingPolicy {
  id: string;
  name: string;
  rules: RoutingRule[];
  priority: number;
  enabled: boolean;
}

export interface RoutingRule {
  condition: string;
  action: 'route' | 'reject' | 'queue' | 'fallback';
  target: string;
  weight?: number;
  conditions: {
    costLimit?: number;
    latencyLimit?: number;
    reliabilityThreshold?: number;
    timeWindow?: string;
  };
}
