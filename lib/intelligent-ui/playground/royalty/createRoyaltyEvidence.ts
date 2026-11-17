import { createRoyaltyCitation } from "./createRoyaltyCitation";
import { createRoyaltyMethodEvidence } from "./createRoyaltyMethodEvidence";

export function createRoyaltyEvidence(refs: string[]) {
  return [...refs.map(createRoyaltyCitation), createRoyaltyMethodEvidence()];
}
