import type { CollectionComponent, Surface } from "../../schema";

export function surfaceWithCollection(
  changes: Partial<CollectionComponent> = {},
): Surface {
  return {
    schemaVersion: 1,
    id: "test-surface",
    revision: 0,
    title: "Example",
    description: "Presentation policy example",
    context: {
      workspaceId: "workspace",
      subject: { kind: "review", id: "example", label: "Example" },
    },
    components: [
      {
        type: "collection",
        id: "options",
        title: "Options",
        columns: [{ key: "cost", label: "Cost" }],
        rows: [
          { id: "one", label: "One", values: { cost: "$20" }, evidenceIds: [] },
          { id: "two", label: "Two", values: { cost: "$30" }, evidenceIds: [] },
          {
            id: "three",
            label: "Three",
            values: { cost: "$25" },
            evidenceIds: [],
          },
        ],
        complete: true,
        totalCount: 3,
        ...changes,
      },
    ],
    evidence: [],
    fallbackText: "Three example options have different costs.",
  };
}
