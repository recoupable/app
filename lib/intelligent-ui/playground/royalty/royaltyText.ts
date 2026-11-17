import input from "./input.json";
import { royaltyLabel } from "./royaltyConstants";
import result from "./result.json";

const statement = result.allocations.find(
  (row) => row.allocation_id === "ALLOC-A",
)!;
const receipt = result.allocations.find(
  (row) => row.allocation_id === "ALLOC-B",
)!;
const receiptInput = input.allocations.find(
  (row) => row.allocation_id === receipt.allocation_id,
)!;
const fee = receiptInput.adjustments!.find(
  (row) => row.adjustment_id === "FEE-1",
)!;
const statementRecord = input.statements.find(
  (row) => row.id === statement.from_id,
)!;
const bankRecord = input.receipts.find((row) => row.id === receipt.to_id)!;

export const opening = `## ${royaltyLabel}\n\nSynthetic review of supplied records. No live account or provider was accessed.`;
export const amounts = [
  `| Record | Amount | Basis |`,
  `| --- | --- | --- |`,
  `| Statement ${statement.from_id} | ${statement.from_currency} ${statement.from_amount} | ${statementRecord.period_start} to ${statementRecord.period_end} |`,
  `| Remittance ${statement.to_id} | ${statement.to_currency} ${statement.to_amount} | Allocated statement; “Paid” is only a supplied label |`,
  `| Fee adjustment | ${fee.currency} ${fee.amount} | Supplied ${fee.kind} evidence (${fee.adjustment_id}) |`,
  `| Verified receipt ${receipt.to_id} | USD ${result.verified_receipts_by_currency.USD} | Verified within this synthetic reconciliation; posted ${bankRecord.date} |`,
].join("\n");
export const boundary = `**Current payable: Unknown.** The producer returns current_payable: null.\n\nReceiving-account access: supplied statement only (${result.receiving_account_access}). ${result.limitations}\n\nBoth allocation stages are present. Unmatched required records: ${result.unmatched_required_records}. Zero unmatched records does not establish a zero payable balance.`;
