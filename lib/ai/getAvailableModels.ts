import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import isEmbedModel from "./isEmbedModel";
import { DEFAULT_MODEL, LIGHTWEIGHT_MODEL } from "@/lib/consts";

const GATEWAY_CONFIG_URL = "https://ai-gateway.vercel.sh/v1/ai/config";

/**
 * Default model list for non-gateway providers (OpenRouter, direct OpenAI).
 * Returned when the Vercel AI Gateway is not configured.
 */
const DEFAULT_MODELS: GatewayLanguageModelEntry[] = [
  {
    id: DEFAULT_MODEL,
    name: "GPT-5 Mini",
    description: "Default model for chat and generation",
    specification: { specificationVersion: "v2", provider: "openai", modelId: DEFAULT_MODEL },
  },
  {
    id: LIGHTWEIGHT_MODEL,
    name: "GPT-4o Mini",
    description: "Lightweight model for simple tasks",
    specification: { specificationVersion: "v2", provider: "openai", modelId: LIGHTWEIGHT_MODEL },
  },
];

/**
 * Fetches the gateway model catalog directly instead of through
 * @ai-sdk/gateway's getAvailableModels(), which currently rejects valid
 * success responses with a Zod "expected error.object" validation error.
 *
 * Falls back to a default model list when the gateway is not configured.
 */
export const getAvailableModels = async (): Promise<
  GatewayLanguageModelEntry[]
> => {
  // Use Vercel AI Gateway when configured
  if (process.env.VERCEL_AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    try {
      const headers: Record<string, string> = {
        "ai-gateway-protocol-version": "0.0.1",
      };
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(GATEWAY_CONFIG_URL, { headers });
      if (!res.ok) return DEFAULT_MODELS;
      const data = (await res.json()) as { models: GatewayLanguageModelEntry[] };
      return data.models.filter((m) => !isEmbedModel(m));
    } catch (error) {
      console.error("[getAvailableModels] Gateway fetch failed:", error);
      return DEFAULT_MODELS;
    }
  }

  // Fallback for OpenRouter or direct OpenAI
  return DEFAULT_MODELS;
};
