import { royaltyLabel, royaltyPrompt } from "./royaltyConstants";
import { createComposedScenario } from "../createComposedScenario";
import { createRoyaltySurface } from "./createRoyaltySurface";

export const royaltyScenario = createComposedScenario(
  "royalty",
  royaltyLabel,
  royaltyPrompt,
  createRoyaltySurface(),
);
