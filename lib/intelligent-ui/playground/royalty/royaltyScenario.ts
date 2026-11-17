import { createComposedScenario } from "../createComposedScenario";
import { createRoyaltySurface } from "./createRoyaltySurface";

export const royaltyScenario = createComposedScenario(
  "royalty",
  "Royalty reconciliation",
  "How does this supplied royalty statement reconcile to the bank receipt, and what is payable now?",
  createRoyaltySurface(),
);
