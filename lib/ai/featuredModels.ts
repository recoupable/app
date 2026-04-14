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
    id: "openai/gpt-5.2",
    displayName: "GPT-5.2",
    isPro: true,
    pill: "New",
    description: "OpenAI's most intelligent model",
    tooltip: "OpenAI's best general-purpose model for both general and agentic tasks",
  },
  {
    id: "openai/gpt-5.4-mini",
    displayName: "GPT-5.4 Mini",
    isPro: false,
    pill: "Fast",
    description: "Great for everyday",
    tooltip: "OpenAI's faster, cost-optimized model",
  },
  {
    id: "anthropic/claude-opus-4.5",
    displayName: "Claude Opus 4.5",
    isPro: true,
    pill: "New",
    description: "Great for complex reasoning",
    tooltip: "Anthropic's latest model for demanding reasoning and complex problem solving",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    displayName: "Claude Sonnet 4.5",
    isPro: true,
    description: "Great for agents",
    tooltip: "Anthropic's balanced model for agentic workflows",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash",
    isPro: false,
    pill: "Fast",
    description: "Great for speed",
    tooltip: "Google's fastest model",
  },
  {
    id: "google/gemini-3-pro-preview",
    displayName: "Gemini 3 Pro",
    isPro: true,
    description: "Google's latest model",
    tooltip: "Google's newest Gemini 3 Pro preview model",
  },
  {
    id: "xai/grok-4",
    displayName: "Grok 4",
    isPro: true,
    description: "Great for writing",
    tooltip: "Xai's reasoning model",
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