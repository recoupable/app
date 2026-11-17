import type { Evidence } from "../../schema";
import result from "./result.json";
import pin from "./source-pin.json";
import { royaltyCapturedAt } from "./royaltyConstants";

export function createRoyaltyMethodEvidence(): Evidence {
  return {
    id: "royalty-producer",
    label: "Reconciliation result and source pin",
    sourceLabel: "Pinned synthetic producer result · fixture capture date",
    observedAt: royaltyCapturedAt,
    kind: "derived",
    status: "partial",
    text: "SYNTHETIC EXAMPLE.\n" + JSON.stringify({ result, pin }, null, 2),
    href: `https://github.com/${pin.repository}/blob/${pin.revision}/${pin.files[0].source}`,
  };
}
