import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

export const isFreeModel = (m: GatewayLanguageModelEntry) => {
  const pricing = m.pricing;
  if (!pricing) return false;

  const input = parseFloat(pricing.input);
  const output = parseFloat(pricing.output);
  if (Number.isNaN(input) || Number.isNaN(output)) return false;

  // Model is considered free if both input and output costs are very low
  const inputPerMillion = input * 1_000_000;
  const outputPerMillion = output * 1_000_000;
  return inputPerMillion <= 0.5 && outputPerMillion <= 2.5;
};

export default isFreeModel;
