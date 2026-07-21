import { DEFAULT_MODEL } from "@/lib/consts";

/**
 * Featured models configuration for the model selection dropdown
 * These models will be displayed prominently at the top of the dropdown
 */

export interface FeaturedModelConfig {
  /** The model ID that should match the one from AI Gateway */
  id: string;
  /** Display name for the model */
  displayName: string;
  /** Whether this is a pro model (requires subscription) */
  isPro: boolean;
  /** Optional pill/badge text (e.g., "Fast", "New", "Thinking") */
  pill?: string;
  /** Optional description text shown under the model name */
  description?: string;
  /** Optional tooltip text shown on hover (more detailed description) */
  tooltip?: string;
}

/**
 * Featured models to display at the top of the dropdown in priority order
 * Note: These are ACTUAL model IDs verified to exist in the system via /api/ai/models
 * Order is determined by array position (first = highest priority)
 */
export const FEATURED_MODELS: FeaturedModelConfig[] = [
  {
    id: "anthropic/claude-opus-4.7",
    displayName: "Claude Opus 4.7",
    isPro: true,
    pill: "New",
    description: "Great for complex reasoning",
    tooltip: "Anthropic's latest model for demanding reasoning and complex problem solving",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    displayName: "Claude Sonnet 4.6",
    isPro: true,
    description: "Great for agents",
    tooltip: "Anthropic's balanced model for agentic workflows",
  },
  {
    id: DEFAULT_MODEL,
    displayName: "GPT-5.4 Mini",
    isPro: false,
    pill: "Fast",
    description: "Great for everyday",
    tooltip: "OpenAI's faster, cost-optimized model",
  },
];

/**
 * Check if a model ID is in the featured list
 */
export const isFeaturedModel = (modelId: string): boolean => {
  return FEATURED_MODELS.some(model => model.id === modelId);
};

/**
 * Get featured model config by ID
 */
export const getFeaturedModelConfig = (modelId: string): FeaturedModelConfig | undefined => {
  return FEATURED_MODELS.find(model => model.id === modelId);
};