import { receiptSchema, collections } from "./schemas";
import { validateSnapshot } from "./validateSnapshot";

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
