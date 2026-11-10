import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { creativeFixtures } from "../creativeFixtures";
import { readCreativeDraft } from "../readCreativeDraft";
import { getCreativeFollowUp } from "../getCreativeFollowUp";
import { resolveCreativeAsset } from "../resolveCreativeAsset";
it("binds both existing owned files to their exact byte versions", () => {
  for (const asset of creativeFixtures) {
    const path = resolveCreativeAsset(asset)!;
    expect(
      createHash("sha256")
        .update(readFileSync(`public${path}`))
        .digest("hex"),
    ).toBe(asset.ref.version);
  }
});
it("rejects malformed, oversized, extra-field and ambiguous stored notes", () => {
  const ref = creativeFixtures[0].ref;
  for (const raw of [
    "{",
    "x".repeat(20001),
    JSON.stringify({ version: 1, selection: ref, notes: [], approved: true }),
    JSON.stringify({
      version: 1,
      selection: ref,
      notes: [
        { ref, text: "a" },
        { ref, text: "b" },
      ],
    }),
  ])
    expect(readCreativeDraft(raw)).toBeNull();
});
it("refuses ambiguous revisions and unknown versions rather than granting authority", () => {
  const asset = creativeFixtures[0];
  expect(getCreativeFollowUp("one", asset.ref, [asset, asset])).toBeNull();
  expect(
    getCreativeFollowUp(
      "one",
      { ...asset.ref, version: "b".repeat(64) },
      creativeFixtures,
    ),
  ).toBeNull();
});
