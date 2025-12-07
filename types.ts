
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
