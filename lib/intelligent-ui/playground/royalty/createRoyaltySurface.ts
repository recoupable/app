import type { Surface } from "../../schema";
import result from "./result.json";
import { createRoyaltyEvidence } from "./createRoyaltyEvidence";
import { opening, amounts, boundary } from "./royaltyText";

/** Static, pinned fixture adapter. Not a general reconciliation engine. */
export function createRoyaltySurface(): Surface {
  const refs = [
    ...new Set(result.allocations.flatMap((row) => row.evidence_refs)),
  ];
  return {
    schemaVersion: 1,
    id: "synthetic-royalty-review",
    revision: 2,
    title: "Royalty reconciliation",
    description:
      "Review a pinned synthetic statement-to-receipt reconciliation.",
    context: {
      workspaceId: "synthetic:royalty-workspace",
      subject: {
        kind: "catalog",
        id: "synthetic:royalty",
        label: "Synthetic royalty records",
      },
    },
    components: [],
    evidence: createRoyaltyEvidence(refs),
    fallbackText: `${opening}\n\n${amounts}\n\n${boundary}`,
    answer: {
      revision: 2,
      parts: [
        {
          type: "markdown",
          id: "royalty-amounts",
          text: `${opening}\n\n${amounts}`,
        },
        { type: "sources", id: "royalty-records", evidenceIds: refs },
        { type: "markdown", id: "royalty-boundary", text: boundary },
        {
          type: "sources",
          id: "royalty-method",
          evidenceIds: ["royalty-producer"],
        },
      ],
    },
  };
}
