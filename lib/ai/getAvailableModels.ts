import { gateway, GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import isEmbedModel from "./isEmbedModel";
import { getFalModels } from "./getFalModels";

/**
 * Returns the list of available LLMs from both Vercel AI Gateway and Fal AI.
 * Combines models from both providers and filters out embed models.
 */
export const getAvailableModels = async (): Promise<GatewayLanguageModelEntry[]> => {
  try {
    // Fetch models from Vercel AI Gateway
    let gatewayModels: GatewayLanguageModelEntry[] = [];
    try {
      const apiResponse = await gateway.getAvailableModels();
      gatewayModels = apiResponse.models.filter(m => !isEmbedModel(m));
      // Successfully fetched gateway models
    } catch {
      // Error fetching gateway models - continuing with fallback
    }

    // Fetch models from Fal AI
    let falModels: GatewayLanguageModelEntry[] = [];
    try {
      falModels = getFalModels();
      // Successfully fetched Fal models
    } catch {
      // Error fetching Fal models - continuing with fallback
    }

    // Combine all models
    const allModels = [...gatewayModels, ...falModels];
    // Successfully combined all available models

    return allModels;
  } catch {
    // Error fetching from all providers - returning empty fallback
    return [];
  }
};
