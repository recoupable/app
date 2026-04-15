import type { LanguageModel } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";

/**
 * Resolves a model string (e.g. "openai/gpt-5-mini") to a LanguageModel,
 * routing through whichever provider is configured.
 *
 * Priority: Vercel AI Gateway > OpenRouter > direct OpenAI.
 */
export function createModel(modelId: string): LanguageModel {
  // Vercel AI Gateway — existing production behavior
  if (process.env.VERCEL_AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return gateway(modelId);
  }

  // OpenRouter — supports "provider/model" format natively
  if (process.env.OPENROUTER_API_KEY) {
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    return openrouter(modelId);
  }

  // Direct OpenAI — only supports openai/* models
  if (process.env.OPENAI_API_KEY) {
    if (!modelId.startsWith("openai/") && modelId.includes("/")) {
      throw new Error(
        `Model "${modelId}" is not an OpenAI model. Direct OpenAI mode only supports openai/* models. ` +
          `Use OPENROUTER_API_KEY or VERCEL_AI_GATEWAY_API_KEY for multi-provider support.`,
      );
    }
    const bareModel = modelId.startsWith("openai/") ? modelId.slice(7) : modelId;
    return openai(bareModel);
  }

  throw new Error(
    "No LLM provider configured. Set VERCEL_AI_GATEWAY_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY.",
  );
}
