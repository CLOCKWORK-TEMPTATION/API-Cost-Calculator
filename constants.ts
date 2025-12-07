
import { AIModel, ModelId } from './types';

// Pricing Constants (Estimated based on Google Cloud Vertex AI / AI Studio pricing trends)
const PRICING_PRO = {
  input: 3.50,
  output: 10.50,
  cached: 0.875,
  storage: 4.50
};

const PRICING_FLASH = {
  input: 0.075,
  output: 0.30,
  cached: 0.01875,
  storage: 1.00
};

const PRICING_FLASH_LITE = {
  input: 0.0375,
  output: 0.15,
  cached: 0.01,
  storage: 1.00
};

const PRICING_GEMMA = {
  input: 0.06, // Low cost hosting estimate
  output: 0.06,
  cached: 0,
  storage: 0
};

const PRICING_EMBEDDING = {
  input: 0.025, // Per million tokens (Text Embedding 004)
  output: 0,
  cached: 0,
  storage: 0
};

export const MODELS: AIModel[] = [
  // --- Gemini 3 Series ---
  {
    id: 'gemini-3-pro-preview',
    name: "Gemini 3 Pro (Preview)",
    description: "أحدث نموذج بقدرات استدلال فائقة ومنطق معقد.",
    contextWindow: 2097152,
    releaseDate: "2025-02",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_PRO.input,
      outputPricePerMillion: PRICING_PRO.output,
      cachedInputPricePerMillion: PRICING_PRO.cached,
      contextCachingStoragePerMillionPerHour: PRICING_PRO.storage
    }
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: "Gemini 3 Pro Image",
    description: "نموذج متخصص في فهم وتوليد الصور بقدرات عالية.",
    contextWindow: 1000000,
    releaseDate: "2025-02",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_PRO.input,
      outputPricePerMillion: PRICING_PRO.output,
      pricePerImage: 0.04
    }
  },

  // --- Gemini 2.5 Series ---
  {
    id: 'gemini-2.5-pro',
    name: "Gemini 2.5 Pro",
    description: "توازن مثالي بين الأداء والتكلفة للمهام المعقدة.",
    contextWindow: 2000000,
    releaseDate: "2025-01",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_PRO.input,
      outputPricePerMillion: PRICING_PRO.output,
      cachedInputPricePerMillion: PRICING_PRO.cached,
      contextCachingStoragePerMillionPerHour: PRICING_PRO.storage
    }
  },
  {
    id: 'gemini-2.5-flash',
    name: "Gemini 2.5 Flash",
    description: "النموذج الأسرع والأكثر كفاءة للمهام اليومية.",
    contextWindow: 1000000,
    releaseDate: "2025-01",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_FLASH.input,
      outputPricePerMillion: PRICING_FLASH.output,
      cachedInputPricePerMillion: PRICING_FLASH.cached,
      contextCachingStoragePerMillionPerHour: PRICING_FLASH.storage
    }
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: "Gemini 2.5 Flash Lite",
    description: "نسخة خفيفة من Flash لتكلفة أقل.",
    contextWindow: 1000000,
    releaseDate: "2025-01",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_FLASH_LITE.input,
      outputPricePerMillion: PRICING_FLASH_LITE.output,
      cachedInputPricePerMillion: PRICING_FLASH_LITE.cached,
      contextCachingStoragePerMillionPerHour: PRICING_FLASH_LITE.storage
    }
  },
  {
    id: 'gemini-2.5-flash-image',
    name: "Gemini 2.5 Flash Image",
    description: "متخصص في معالجة الصور بسرعة عالية.",
    contextWindow: 1000000,
    releaseDate: "2025-01",
    type: 'image',
    pricing: {
      inputPricePerMillion: PRICING_FLASH.input,
      outputPricePerMillion: PRICING_FLASH.output,
      pricePerImage: 0.035
    }
  },
  {
    id: 'gemini-2.5-flash-native-audio-preview-09-2025',
    name: "Gemini 2.5 Flash Audio",
    description: "معالجة الصوت الأصلية (Native Audio).",
    contextWindow: 1000000,
    releaseDate: "2025-09 (Preview)",
    type: 'audio',
    pricing: {
      inputPricePerMillion: PRICING_FLASH.input,
      outputPricePerMillion: PRICING_FLASH.output,
      inputAudioPricePerSecond: 0.002 // Estimated
    }
  },

  // --- Gemini 2.0 Series ---
  {
    id: 'gemini-2.0-pro-exp-02-05',
    name: "Gemini 2.0 Pro Exp",
    description: "النسخة التجريبية من الجيل الثاني Pro.",
    contextWindow: 2000000,
    releaseDate: "2025-02",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_PRO.input,
      outputPricePerMillion: PRICING_PRO.output,
      cachedInputPricePerMillion: PRICING_PRO.cached
    }
  },
  {
    id: 'gemini-2.0-flash-001',
    name: "Gemini 2.0 Flash",
    description: "الجيل الثاني من Flash.",
    contextWindow: 1000000,
    releaseDate: "2024-12",
    type: 'multimodal',
    pricing: {
      inputPricePerMillion: PRICING_FLASH.input,
      outputPricePerMillion: PRICING_FLASH.output,
      cachedInputPricePerMillion: PRICING_FLASH.cached
    }
  },

  // --- Gemma 3 Series ---
  {
    id: 'gemma-3-27b-it',
    name: "Gemma 3 27B IT",
    description: "نموذج مفتوح الوزن عالي الأداء.",
    contextWindow: 8192,
    releaseDate: "2025",
    type: 'text',
    pricing: {
      inputPricePerMillion: PRICING_GEMMA.input,
      outputPricePerMillion: PRICING_GEMMA.output
    }
  },
  {
    id: 'gemma-3-12b-it',
    name: "Gemma 3 12B IT",
    description: "توازن بين الحجم والأداء.",
    contextWindow: 8192,
    releaseDate: "2025",
    type: 'text',
    pricing: {
      inputPricePerMillion: PRICING_GEMMA.input,
      outputPricePerMillion: PRICING_GEMMA.output
    }
  },
  {
    id: 'gemma-3-4b-it',
    name: "Gemma 3 4B IT",
    description: "نموذج صغير وسريع للأجهزة المحدودة.",
    contextWindow: 8192,
    releaseDate: "2025",
    type: 'text',
    pricing: {
      inputPricePerMillion: 0.04,
      outputPricePerMillion: 0.04
    }
  },

  // --- Imagen 4 Series ---
  {
    id: 'imagen-4.0-generate-001',
    name: "Imagen 4.0",
    description: "أحدث جيل لتوليد الصور.",
    contextWindow: 0,
    releaseDate: "2025",
    type: 'image',
    pricing: {
      inputPricePerMillion: 0,
      outputPricePerMillion: 0,
      pricePerImage: 0.045
    }
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: "Imagen 4.0 Fast",
    description: "توليد صور سريع بتكلفة أقل.",
    contextWindow: 0,
    releaseDate: "2025",
    type: 'image',
    pricing: {
      inputPricePerMillion: 0,
      outputPricePerMillion: 0,
      pricePerImage: 0.025
    }
  },

  // --- Veo 3 Series ---
  {
    id: 'veo-3.1-generate-preview',
    name: "Veo 3.1",
    description: "توليد فيديو عالي الدقة والواقعية.",
    contextWindow: 0,
    releaseDate: "2025",
    type: 'video',
    pricing: {
      inputPricePerMillion: 0,
      outputPricePerMillion: 0,
      pricePerSecondVideo: 0.15 // Premium video gen
    }
  },
  {
    id: 'veo-3.1-fast-generate-preview',
    name: "Veo 3.1 Fast",
    description: "توليد فيديو سريع.",
    contextWindow: 0,
    releaseDate: "2025",
    type: 'video',
    pricing: {
      inputPricePerMillion: 0,
      outputPricePerMillion: 0,
      pricePerSecondVideo: 0.08
    }
  },

  // --- Embeddings ---
  {
    id: 'text-embedding-004',
    name: "Text Embedding 004",
    description: "تحويل النصوص إلى متجهات.",
    contextWindow: 2048,
    releaseDate: "2024",
    type: 'embedding',
    pricing: {
      inputPricePerMillion: PRICING_EMBEDDING.input,
      outputPricePerMillion: 0
    }
  },
  {
    id: 'gemini-embedding-exp-03-07',
    name: "Gemini Embedding Exp",
    description: "نسخة تجريبية للمتجهات باستخدام Gemini.",
    contextWindow: 32768,
    releaseDate: "2025-03",
    type: 'embedding',
    pricing: {
      inputPricePerMillion: PRICING_EMBEDDING.input,
      outputPricePerMillion: 0
    }
  }
];

export const NAV_ITEMS = [
  { id: 'calculator', label: 'حاسبة متقدمة', icon: 'Calculator' },
  { id: 'arena', label: 'مقارنة (Arena)', icon: 'SplitSquareHorizontal' },
  { id: 'live', label: 'تجربة حية', icon: 'Zap' },
];
