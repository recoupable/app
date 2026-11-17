import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import input from "../input.json";
import result from "../result.json";

// Only this qualified fixed fixture is consumed. Repinning needs explicit review.
describe("qualified royalty fixture boundary", () => {
  it.each([
    [
      "input.json",
      "fb2f83bb8326ceab23571bf66424acbfe15071cdf7f7224fac49d7b90c98393f",
    ],
    [
      "result.json",
      "3d19af6f1c1da19a5c88c8a5064430269b0105811d89694534c0c63a93636883",
    ],
  ])("retains qualified bytes for %s", (file, hash) => {
    const bytes = readFileSync(new URL(`../${file}`, import.meta.url));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
  });
  it("preserves the supplied input profile and distinct zero/null semantics", () => {
    expect(result.current_payable).toBeNull();
    expect(result.receiving_account_access).toBe("supplied_statement_only");
    expect(result.verified_receipts_by_currency).toEqual({ USD: "97" });
    expect(result.residuals.every((row) => row.unallocated === "0")).toBe(true);
    const remittance = input.remittances.find((row) => row.id === "PAY-A")!;
    const receipt = input.receipts.find((row) => row.id === "BANK-A")!;
    expect(typeof remittance.receiving_account_ref).toBe("string");
    expect(remittance.receiving_account_ref.trim()).not.toBe("");
    expect(receipt.account_ref).toBe(remittance.receiving_account_ref);
    expect(
      result.allocations.find((row) => row.allocation_id === "ALLOC-B")
        ?.adjustments,
    ).toBe("-3");
  });
});
