import type { Evidence } from "../../schema";
import input from "./input.json";
import pin from "./source-pin.json";
import { royaltyCapturedAt } from "./royaltyConstants";

export function createRoyaltyCitation(ref: string): Evidence {
  return {
    id: ref,
    label: ref,
    sourceLabel: "Synthetic fixture · capture date below, not transaction date",
    observedAt: royaltyCapturedAt,
    kind: "submitted",
    status: "partial",
    text:
      "SYNTHETIC EXAMPLE.\n" +
      JSON.stringify(
        {
          evidence_ref: ref,
          records: [
            ...input.statements,
            ...input.remittances,
            ...input.receipts,
            ...input.allocations,
            ...input.allocations.flatMap((row) => row.adjustments ?? []),
          ].filter((row) => row.evidence_refs.includes(ref)),
          producer_revision: pin.revision,
          scope:
            "Invented supplied records only. No live account access or current balance verification.",
        },
        null,
        2,
      ),
  };
}
