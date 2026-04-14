import { gateway, GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import isEmbedModel from "./isEmbedModel";
import { getFalModels } from "./getFalModels";

/**
 * Returns the list of available LLMs from both Vercel AI Gateway and Fal AI.
 * Combines models from both providers and filters out embed models.
 */
export const getAvailableModels = async (): Promise<
  GatewayLanguageModelEntry[]
> => {
  try {
    // Fetch models from Vercel AI Gateway
    let gatewayModels: GatewayLanguageModelEntry[] = [];
    try {
      const apiResponse = await gateway.getAvailableModels();
      gatewayModels = apiResponse.models.filter((m) => !isEmbedModel(m));
    } catch (error) {
      console.error("[getAvailableModels] Gateway fetch failed:", error);
    }

    // Fetch models from Fal AI
    let falModels: GatewayLanguageModelEntry[] = [];
    try {
      falModels = getFalModels();
    } catch (error) {
      console.error("[getAvailableModels] Fal models failed:", error);
    }

    return [...gatewayModels, ...falModels];
  } catch (error) {
    console.error("[getAvailableModels] All providers failed:", error);
    return [];
  }
};
