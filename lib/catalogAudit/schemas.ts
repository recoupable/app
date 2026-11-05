import { z } from "zod";

const id = z.string().min(1).max(256);
const reference = z.object({ source_id: id, version: id }).strict();
const common = z
  .object({
    id,
    summary: z.string().max(32000).optional(),
    evidence_gap: z.string().max(32000).optional(),
    depends_on: z.array(id).optional(),
    stale: z.boolean().optional(),
    data: z.record(z.unknown()).optional(),
    context_refs: z.unknown().optional(),
  })
  .passthrough();
const source = common.extend({
  version: id,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  locator: z.union([z.string(), z.record(z.unknown())]),
  status: z.enum(["active", "withdrawn"]),
  context_source_version_id: z.string().uuid().optional(),
});
const derived = common.extend({
  status: id,
  source_refs: z.array(reference),
  rule_version: id,
  stage: id.optional(),
});
const withheld = z
  .object({
    id,
    status: id,
    withheld: z.literal(true),
    stale: z.literal(true).optional(),
    version: id.optional(),
  })
  .strict();
const collection = <T extends z.ZodTypeAny>(item: T) =>
  z.record(item).refine((items) => Object.keys(items).length <= 1000);
export const snapshotSchema = z
  .object({
    schema_version: z.literal(1),
    case_id: z.string().uuid(),
    workspace_id: z.string().uuid(),
    revision: z.number().int().nonnegative(),
    scope: z.string().max(32000),
    sources: collection(z.union([source, withheld])),
    assessments: collection(z.union([derived, withheld])),
    findings: collection(z.union([derived, withheld])),
    actions: collection(z.union([derived, withheld])),
    attempts: collection(z.union([derived, withheld])),
    outcomes: collection(z.union([derived, withheld])),
  })
  .strict();
export type AuditSnapshot = z.infer<typeof snapshotSchema>;
export type AuditSource = z.infer<typeof source>;
export type AuditAssessment = z.infer<typeof derived>;
export const collections = [
  "sources",
  "assessments",
  "findings",
  "actions",
  "attempts",
  "outcomes",
] as const;

const receiptSchema = z
  .object({
    case_id: z.string().uuid(),
    revision: z.number().int().positive(),
    state: z.enum(["saved", "partial"]),
    evidence_kind: z.literal("customer_assertion"),
    snapshot: snapshotSchema,
    withheld_record_ids: z.array(id),
    snapshot_usable_for_save: z.boolean(),
    external_actions: z.literal("unsupported"),
    created_at: z.string().datetime({ offset: true }),
  })
  .strict();
export type AuditReceipt = z.infer<typeof receiptSchema>;
export const pageSchema = z
  .object({
    cases: z
      .array(
        z
          .object({
            case_id: z.string().uuid(),
            revision: z.number().int().positive(),
            created_at: z.string().datetime({ offset: true }),
            updated_at: z.string().datetime({ offset: true }),
          })
          .strict(),
      )
      .max(50),
    has_more: z.boolean(),
    next_id: z.string().uuid().nullable(),
  })
  .strict()
  .refine(
    (page) =>
      page.has_more === (page.next_id !== null) &&
      (!page.has_more || page.next_id === page.cases.at(-1)?.case_id) &&
      new Set(page.cases.map((entry) => entry.case_id)).size ===
        page.cases.length,
  );
export type AuditPage = z.infer<typeof pageSchema>;

export function validateSnapshot(snapshot: AuditSnapshot, workspaceId: string) {
  if (snapshot.workspace_id.toLowerCase() !== workspaceId.toLowerCase())
    throw new Error("Unexpected workspace");
  const ids = new Set<string>();
  for (const name of collections)
    for (const [key, entry] of Object.entries(snapshot[name])) {
      if (entry.id !== key || ids.has(key))
        throw new Error("Invalid audit record");
      ids.add(key);
      if (entry.withheld === true) continue;
      if (name !== "sources") {
        const record = entry as AuditAssessment;
        if (!record.source_refs.length && !record.evidence_gap)
          throw new Error("Missing evidence gap");
        for (const ref of record.source_refs) {
          const evidence = snapshot.sources[ref.source_id];
          if (
            !evidence ||
            (!record.stale &&
              (evidence.withheld === true ||
                evidence.status !== "active" ||
                evidence.version !== ref.version))
          )
            throw new Error("Invalid evidence reference");
        }
      }
    }
}

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
  const initial = result.snapshot.assessments["assessment:context"] as
    | AuditAssessment
    | undefined;
  if (
    result.snapshot.revision !== 0 ||
    !initial ||
    initial.withheld === true ||
    initial.stage !== "audit" ||
    initial.status !== "partial" ||
    initial.rule_version !== "context-catalog-audit-v1" ||
    initial.data?.brief_id !== briefId ||
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

export function parseReceipt(
  raw: unknown,
  workspaceId: string,
  caseId: string,
  revision?: number,
) {
  const result = receiptSchema.parse(raw);
  validateSnapshot(result.snapshot, workspaceId);
  const withheldIds = collections
    .flatMap((name) =>
      Object.values(result.snapshot[name])
        .filter((record) => record.withheld === true)
        .map((record) => record.id),
    )
    .sort();
  if (
    result.case_id.toLowerCase() !== caseId.toLowerCase() ||
    result.snapshot.case_id.toLowerCase() !== caseId.toLowerCase() ||
    result.snapshot.revision !== result.revision ||
    (revision !== undefined && result.revision !== revision) ||
    (result.state === "partial") !== withheldIds.length > 0 ||
    (result.state === "partial") === result.snapshot_usable_for_save ||
    JSON.stringify(withheldIds) !==
      JSON.stringify([...result.withheld_record_ids].sort())
  )
    throw new Error("Invalid audit receipt");
  return result;
}
