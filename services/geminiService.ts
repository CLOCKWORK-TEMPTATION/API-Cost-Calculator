
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AIModel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateContentWithUsage = async (
  modelId: string,
  prompt: string
): Promise<{ text: string; usage: { promptTokens: number; candidatesTokens: number } }> => {
  if (!apiKey) {
    throw new Error("مفتاح API غير متوفر. يرجى التأكد من إعداد البيئة.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    const text = response.text || "لا يوجد رد نصي.";
    
    // Extract usage metadata if available
    const usageMetadata = response.usageMetadata;
    const promptTokens = usageMetadata?.promptTokenCount || 0;
    const candidatesTokens = usageMetadata?.candidatesTokenCount || 0;

    return {
      text,
      usage: {
        promptTokens,
        candidatesTokens
      }
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const findModelDetails = async (modelName: string): Promise<Partial<AIModel> | null> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    Find the official API pricing and specifications for the AI model: "${modelName}".
    I need the following specific details:
    1. Input price per 1 million tokens (USD).
    2. Output price per 1 million tokens (USD).
    3. Context window size (number of tokens).
    4. Cached input price per 1 million tokens (USD) (if available).
    5. Context caching storage price per 1 million tokens per hour (USD) (if available).
    
    Return the data in JSON format based on the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pricing: {
              type: Type.OBJECT,
              properties: {
                inputPricePerMillion: { type: Type.NUMBER },
                outputPricePerMillion: { type: Type.NUMBER },
                cachedInputPricePerMillion: { type: Type.NUMBER },
                contextCachingStoragePerMillionPerHour: { type: Type.NUMBER },
              },
              required: ["inputPricePerMillion", "outputPricePerMillion"]
            },
            contextWindow: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ["pricing", "contextWindow"]
        }
      }
    });

    if (response.text) {
      try {
        const data = JSON.parse(response.text);
        return {
          name: modelName,
          id: modelName.toLowerCase().replace(/\s+/g, '-'), // Generate a temporary ID
          description: data.description || `Custom model: ${modelName}`,
          contextWindow: data.contextWindow,
          pricing: {
            inputPricePerMillion: data.pricing.inputPricePerMillion,
            outputPricePerMillion: data.pricing.outputPricePerMillion,
            cachedInputPricePerMillion: data.pricing.cachedInputPricePerMillion || 0,
            contextCachingStoragePerMillionPerHour: data.pricing.contextCachingStoragePerMillionPerHour || 0,
            inputAudioPricePerSecond: 0
          }
        };
      } catch (e) {
        console.error("Failed to parse JSON response", e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error searching for model details:", error);
    throw error;
  }
};
