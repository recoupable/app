import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { isFreeModel } from "./isFreeModel";
import { FEATURED_MODELS, isFeaturedModel } from "./featuredModels";

export interface OrganizedModels {
  featuredModels: GatewayLanguageModelEntry[];
  otherModels: GatewayLanguageModelEntry[];
}

/**
 * Organizes available models into featured models and other models
 *
 * @param availableModels - All available models from AI Gateway
 * @returns Organized model groups
 */
export const organizeModels = (availableModels: GatewayLanguageModelEntry[]): OrganizedModels => {
  const featuredModels: GatewayLanguageModelEntry[] = [];
  const otherModels: GatewayLanguageModelEntry[] = [];

  // Create a map for quick lookup of available models (now includes both Gateway and Fal models)
  const availableModelMap = new Map(availableModels.map(model => [model.id, model]));

  // Add featured models in the specified order
  FEATURED_MODELS.forEach(featuredConfig => {
    const actualModel = availableModelMap.get(featuredConfig.id);
    if (actualModel) {
      featuredModels.push({
        ...actualModel,
        // Override display name if specified in config
        name: featuredConfig.displayName || actualModel.name,
      });
    }
  });

  // Add all other models (not in featured list)
  availableModels.forEach(model => {
    if (!isFeaturedModel(model.id)) {
      otherModels.push(model);
    }
  });

  // Sort other models: Pro models first, then Free models
  otherModels.sort((a, b) => {
    const aIsFree = isFreeModel(a);
    const bIsFree = isFreeModel(b);

    // Pro models (not free) come first
    if (aIsFree && !bIsFree) return 1;
    if (!aIsFree && bIsFree) return -1;

    // Within the same tier, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  return {
    featuredModels,
    otherModels,
  };
};
