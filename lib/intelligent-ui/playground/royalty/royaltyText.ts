import result from "./result.json";

const statement = result.allocations[0];
const receipt = result.allocations[1];
export const opening =
  "## Royalty reconciliation\n\nSynthetic review of supplied records. No live account or provider was accessed.";
export const amounts = `| Record | Amount | Basis |\n| --- | --- | --- |\n| Statement ${statement.from_id} | ${statement.from_currency} ${statement.from_amount} | January–March 2024 |\n| Remittance ${statement.to_id} | ${statement.to_currency} ${statement.to_amount} | Allocated statement; “Paid” is only a supplied label |\n| Fee adjustment | ${receipt.to_currency} ${receipt.adjustments} | Supplied fee evidence |\n| Verified receipt ${receipt.to_id} | USD ${result.verified_receipts_by_currency.USD} | Verified within this synthetic reconciliation; posted June 3, 2024 |`;
export const boundary = `**Current payable: Unknown.** The producer returns current_payable: null.\n\nReceiving-account access: supplied statement only (${result.receiving_account_access}). ${result.limitations}\n\nBoth allocation stages are present. Unmatched required records: ${result.unmatched_required_records}. Zero unmatched records does not establish a zero payable balance.`;
