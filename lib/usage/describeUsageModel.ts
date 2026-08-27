/** "fal / minimax/music-3", the model alone, or a dash for a fixed-price charge. */
const describeUsageModel = ({ provider, model_id }: { provider: string | null; model_id: string | null }): string => {
  if (!model_id) return "-";
  return provider ? `${provider} / ${model_id}` : model_id;
};

export default describeUsageModel;
