import { z } from "zod";
import { snapshotSchema, collections } from "./schemas";
import { validateSnapshot } from "./validateSnapshot";

export function parsePrepared(
  raw: unknown,
  workspaceId: string,
  briefId: string,
) {
  const result = z
    .object({
      state: z.literal("prepared"),
      persisted: z.literal(false),
      external_actions: z.literal("unsupported"),
      snapshot: snapshotSchema,
    })
    .strict()
    .parse(raw);
  validateSnapshot(result.snapshot, workspaceId);
  const initial = result.snapshot.assessments["assessment:context"];
  if (
    result.snapshot.revision !== 0 ||
    !initial ||
    initial.withheld === true ||
    initial.stage !== "audit" ||
    initial.status !== "partial" ||
    initial.rule_version !== "context-catalog-audit-v1" ||
    typeof initial.data?.brief_id !== "string" ||
    initial.data.brief_id.toLowerCase() !== briefId.toLowerCase() ||
    typeof initial.summary !== "string" ||
    initial.source_refs.length !==
      Object.keys(result.snapshot.sources).length ||
    new Set(initial.source_refs.map((ref) => ref.source_id)).size !==
      initial.source_refs.length ||
    collections.some((name) =>
      Object.values(result.snapshot[name]).some(
        (record) => record.withheld === true,
      ),
    )
  )
    throw new Error("Invalid prepared audit");
  return result.snapshot;
}
