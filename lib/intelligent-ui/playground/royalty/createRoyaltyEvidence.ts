import type { Evidence } from "../../schema";
import input from "./input.json";
import result from "./result.json";
import pin from "./source-pin.json";

export function createRoyaltyEvidence(refs: string[]): Evidence[] {
  const evidence: Evidence[] = refs.map((ref) => ({
    id: ref,
    label: ref,
    sourceLabel: "Synthetic fixture · capture date below, not transaction date",
    observedAt: "2026-11-17T18:56:45+00:00",
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
  }));
  evidence.push({
    id: "royalty-producer",
    label: "Reconciliation result and source pin",
    sourceLabel: "Pinned synthetic producer result · fixture capture date",
    observedAt: "2026-11-17T18:56:45+00:00",
    kind: "derived",
    status: "partial",
    text: "SYNTHETIC EXAMPLE.\n" + JSON.stringify({ result, pin }, null, 2),
    href: `https://github.com/${pin.repository}/blob/${pin.revision}/${pin.files[0].source}`,
  });
  return evidence;
}
