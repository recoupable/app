import { createSnapshotConsumer } from "../../chat/createSnapshotConsumer";
import { createCatalogExplorerFixture } from "../catalog/createCatalogExplorerFixture";
import { describeCatalogRecord } from "../catalog/describeCatalogRecord";
import { toCollectionComponent } from "../../descriptors/toCollectionComponent";
import type { SubjectContextCurrent } from "../../subject-context/projectSubjectContext";
import type { Surface } from "../../schema";

/** Synthetic accepted snapshots only; no service, model, credentials or persistence. */
export function createSelectionFixtureHost() {
  const original = createCatalogExplorerFixture()
    .slice(0, 12)
    .map(describeCatalogRecord);
  let workspaceId = original[0].ref.workspaceId;
  let descriptors = original;
  let revision = 0;
  let purpose = "compare-recordings";
  let subjectIndex = 0;
  const scope = () => ({
    actorId: "fixture-actor",
    accountId: "fixture-account",
    workspaceId,
    sessionId: "fixture-session",
    chatId: "fixture-chat",
    subject: {
      kind: descriptors[subjectIndex].ref.kind,
      id: descriptors[subjectIndex].ref.id,
    },
  });
  const consumer = createSnapshotConsumer(scope);
  const surfaceId = "selection-continuity-fixture";
  const messageId = "selection-fixture-answer";
  function read(): SubjectContextCurrent {
    const key = consumer.syncScope().key;
    const surface = key && consumer.getSnapshot(messageId, surfaceId, key);
    if (!key || !surface)
      throw new Error(
        "Selection fixture needs the development chat gate and an accepted snapshot",
      );
    return {
      bindingKey: key,
      context: {
        workspaceId: surface.context.workspaceId,
        surfaceId: surface.id,
        revision: surface.revision,
        subject: descriptors[subjectIndex].ref,
        purpose,
      },
      descriptors,
    };
  }
  function publish() {
    const component = toCollectionComponent({
      workspaceId,
      items: descriptors,
      nextCursor: null,
      hasMore: false,
      knownTotal: descriptors.length,
      completeness: "complete",
      aggregationScope: "population",
      population: "Twelve synthetic recordings",
      selection: [],
    });
    const surface: Surface = {
      schemaVersion: 1,
      id: surfaceId,
      revision,
      title: "Selection continuity",
      description: "Local fixture only",
      context: {
        workspaceId,
        subject: { ...scope().subject, label: descriptors[subjectIndex].label },
      },
      components: [component],
      evidence: [],
      fallbackText: "Twelve synthetic recordings.",
      answer: {
        revision,
        parts: [
          {
            type: "representation",
            id: "selection-table",
            componentId: component.id,
            benefit: "select-records",
          },
        ],
      },
    };
    const stream = consumer.beginStream();
    stream({ type: "start", messageId });
    stream({
      type: "data-intelligent-ui-snapshot",
      id: surface.id,
      data: surface,
    });
    return read();
  }
  publish();
  return {
    read,
    change(kind: "workspace" | "revision" | "source" | "purpose" | "subject") {
      if (kind === "workspace")
        workspaceId =
          workspaceId === original[0].ref.workspaceId
            ? "synthetic:alternate-workspace"
            : original[0].ref.workspaceId;
      if (kind === "purpose")
        purpose =
          purpose === "compare-recordings"
            ? "inspect-sources"
            : "compare-recordings";
      if (kind === "subject") subjectIndex = subjectIndex === 0 ? 1 : 0;
      revision++;
      descriptors = descriptors.map((item) => ({
        ...item,
        ref: {
          ...item.ref,
          workspaceId,
          sourceVersionIds:
            kind === "source"
              ? [`synthetic:source-revision-${revision}`]
              : item.ref.sourceVersionIds,
        },
      }));
      return publish();
    },
  };
}
