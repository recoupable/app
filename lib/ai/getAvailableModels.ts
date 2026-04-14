import { gateway, GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import isEmbedModel from "./isEmbedModel";

/**
 * Returns the list of available LLMs from Vercel AI Gateway, excluding embed models.
 */
export const getAvailableModels = async (): Promise<
  GatewayLanguageModelEntry[]
> => {
  try {
    const apiResponse = await gateway.getAvailableModels();
    return apiResponse.models.filter((m) => !isEmbedModel(m));
  } catch (error) {
    console.error("[getAvailableModels] Gateway fetch failed:", error);
    return [];
  }
};
