import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

/**
 * Returns the list of available Fal AI models.
 * For now, returns a curated list of popular Fal models.
 */
export const getFalModels = (): GatewayLanguageModelEntry[] => {
  // Curated list of popular and useful Fal models
  const falModels: GatewayLanguageModelEntry[] = [
    {
      id: "fal-ai/nano-banana/edit",
      name: "Nano Banana",
      description: "Google's state-of-the-art image generation and editing model",
      pricing: {
        input: "0.0000", // Free for testing
        output: "0.0000",
      },
      specification: {
        specificationVersion: "v2",
        provider: "fal",
        modelId: "fal-ai/nano-banana/edit",
      },
    },
    {
      id: "fal-ai/flux/dev",
      name: "FLUX.1 Dev",
      description: "FLUX.1 [dev] model for high-quality image generation",
      pricing: {
        input: "0.0001",
        output: "0.001",
      },
      specification: {
        specificationVersion: "v2",
        provider: "fal",
        modelId: "fal-ai/flux/dev",
      },
    },
    {
      id: "fal-ai/flux-pro/kontext",
      name: "FLUX Pro Kontext",
      description: "FLUX.1 Kontext [pro] handles both text and reference images",
      pricing: {
        input: "0.0002",
        output: "0.002",
      },
      specification: {
        specificationVersion: "v2",
        provider: "fal",
        modelId: "fal-ai/flux-pro/kontext",
      },
    },
    {
      id: "fal-ai/ideogram/character",
      name: "Ideogram Character",
      description: "Generate consistent character appearances across multiple images",
      pricing: {
        input: "0.0001",
        output: "0.001",
      },
      specification: {
        specificationVersion: "v2",
        provider: "fal",
        modelId: "fal-ai/ideogram/character",
      },
    },
  ];

  return falModels;
};
