import type { CollectionComponent } from "../schema";
import { getCollectionText } from "../representations/getCollectionText";
import { createComposedScenario } from "./createComposedScenario";

const collection: CollectionComponent = {
  type: "collection",
  id: "synthetic-records",
  title: "Supplied recording list",
  columns: [
    { key: "streams", label: "Daily streams" },
    { key: "basis", label: "Source basis" },
  ],
  rows: Array.from({ length: 30 }, (_, i) => ({
    id: `synthetic:record-${i + 1}`,
    label: `Recording ${String(i + 1).padStart(2, "0")}`,
    values: {
      streams: i === 1 ? "Unknown" : `${i * 10} streams`,
      basis: "Invented daily observation · October 26, 2026 · worldwide",
    },
    evidenceIds: [],
  })),
  complete: false,
};
const introduction =
  "Synthetic example: these 30 fictional records demonstrate local selection. Zero and unknown stay distinct. The table is a partial supplied list with an unknown total; it is not a connected catalog or an authorized Context selection.";
export const collectionScenario = createComposedScenario(
  "collection",
  "Select records",
  "Let me mark the recordings I want to inspect in this supplied table.",
  {
    schemaVersion: 1,
    id: "synthetic-collection-answer",
    revision: 2,
    title: collection.title,
    description: introduction,
    context: {
      workspaceId: "synthetic:collection-workspace",
      subject: {
        kind: "catalog",
        id: "synthetic:catalog",
        label: "Fictional catalog",
      },
    },
    components: [collection],
    evidence: [],
    fallbackText: `${introduction}\n\n${getCollectionText(collection)}`,
    answer: {
      revision: 2,
      parts: [
        { type: "markdown", id: "introduction", text: introduction },
        {
          type: "representation",
          id: "records",
          componentId: collection.id,
          benefit: "select-records",
        },
      ],
    },
  },
);
