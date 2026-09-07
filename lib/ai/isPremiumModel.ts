import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { isFreeModel } from "./isFreeModel";

/**
 * A model is premium (Pro) when its gateway pricing metadata puts it above
 * the free tier. Models with missing or unparseable pricing are treated as
 * premium, matching the existing lock behavior in the model picker.
 */
export const isPremiumModel = (model: GatewayLanguageModelEntry): boolean =>
  !isFreeModel(model);

export default isPremiumModel;
