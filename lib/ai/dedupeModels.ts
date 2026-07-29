import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

/**
 * Removes duplicate models from the AI Gateway list.
 * The gateway exposes alias ids for some models (e.g. alibaba/qwen3-vl-thinking
 * aliases alibaba/qwen3-235b-a22b-thinking) so ids alone are not enough;
 * entries are deduped by id and by normalized display name, keeping the
 * first occurrence.
 */
export const dedupeModels = (
  models: GatewayLanguageModelEntry[],
): GatewayLanguageModelEntry[] => {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return models.filter((model) => {
    const normalizedName = model.name.trim().toLowerCase().replace(/\s+/g, " ");
    if (seenIds.has(model.id) || seenNames.has(normalizedName)) return false;
    seenIds.add(model.id);
    seenNames.add(normalizedName);
    return true;
  });
};

export default dedupeModels;
