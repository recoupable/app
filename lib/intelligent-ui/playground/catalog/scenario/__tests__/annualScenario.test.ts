import { createHash, webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import pin from "../source-pin.json";
import vectors from "../vendor/scenario-vectors.json";
import { runScenario } from "../vendor/scenario.mjs";
import { createAnnualScenarioFixture } from "../createAnnualScenarioFixture";
import { buildAnnualScenarioRequest } from "../buildAnnualScenarioRequest";
import { descriptorSchema } from "../../../../descriptors/schemas";

afterEach(() => vi.unstubAllGlobals());
describe("pinned annual scenario consumption", () => {
  it("pins every canonical byte, including the routed browser runtime", () => {
    expect(pin.commit).toBe("f9b56047655689b12fe7dbfe77b8e8ba6e989d45");
    expect(pin.sha256["scenario.mjs"]).toBe(
      "0cd92009fe39e237cafb44d033c4e1488b9811d783fdf000ec89b279893117ce",
    );
    for (const [file, sha] of Object.entries(pin.sha256))
      expect(
        createHash("sha256")
          .update(
            readFileSync(
              resolve(
                "lib/intelligent-ui/playground/catalog/scenario/vendor",
                file,
              ),
            ),
          )
          .digest("hex"),
      ).toBe(sha);
  });
  it("matches canonical rate and reset vectors without changing observations", async () => {
    vi.stubGlobal("crypto", webcrypto);
    const before = JSON.stringify(vectors.request);
    for (const variant of [
      { spotify_rate: 0.008, ...vectors.expected.scenario },
      ...vectors.variants,
    ]) {
      const result = await runScenario({
        ...vectors.request,
        spotify_rate: variant.spotify_rate,
      });
      expect(result.scenario.annual_gross.central).toBe(variant.annual_gross);
      expect(result.scenario.annual_nls.central).toBe(variant.annual_nls);
      expect(result.scenario.value.central).toBe(variant.value);
      expect(result.baseline.value.central).toBe(20);
      expect(result.scenario.covered_tracks).toBe(1);
      expect(result.scenario.input_tracks).toBe(2);
      expect(result.observations).toEqual(vectors.request.observations);
      expect(result.execution_runtime).toBe("catalog-browser-scenario/1");
      expect(result.calculation_source_sha256).toBe(
        "4f16497387a73eaca0f900a9a4136443ef84ef174894772655b51c6a8ebda055",
      );
    }
    expect(JSON.stringify(vectors.request)).toBe(before);
  });
  it("resolves fixture authority and exact versions, preserving unknown-only selection", async () => {
    vi.stubGlobal("crypto", webcrypto);
    const fixture = createAnnualScenarioFixture();
    fixture.descriptors.forEach((item) =>
      expect(descriptorSchema.safeParse(item).success).toBe(true),
    );
    const refs = fixture.descriptors.map((item) => item.ref);
    for (const changed of [
      { ...refs[0], workspaceId: "wrong" },
      { ...refs[0], authority: "context" as const },
      { ...refs[0], sourceVersionIds: ["stale"] },
    ])
      expect(() =>
        buildAnnualScenarioRequest(fixture, [changed], null),
      ).toThrow("available");
    expect(() => buildAnnualScenarioRequest(fixture, [], null)).toThrow(
      "Select",
    );
    for (const rate of ["", "-1", "NaN", "Infinity", "1e999"])
      expect(() => buildAnnualScenarioRequest(fixture, refs, rate)).toThrow(
        "finite",
      );
    const unknown = await runScenario(
      buildAnnualScenarioRequest(fixture, [refs[1]], null),
    );
    expect(unknown.scenario.status).toBe("insufficient_measurement");
    expect(unknown.scenario.value.central).toBeNull();
    expect(unknown.observations.tracks[0].sp_ttm).toBeNull();
    const zero = await runScenario(
      buildAnnualScenarioRequest(fixture, refs, "0"),
    );
    expect(zero.scenario.value.central).toBe(0);
    expect(zero.baseline.value.central).toBe(20);
  });
  it.each([
    "period_start",
    "currency",
    "cohort_id",
    "unit",
    "right_kind",
  ] as const)("keeps Catalog's incompatible %s refusal", async (key) => {
    const request = structuredClone(vectors.request);
    request.observations.tracks[0].basis[key] = "incompatible";
    await expect(runScenario(request)).rejects.toThrow("Incompatible");
  });
  it("refuses cumulative data and unavailable local crypto", async () => {
    const request = structuredClone(vectors.request);
    request.observations.tracks[0].ttm_source = "cumulative";
    await expect(runScenario(request)).rejects.toThrow("Cumulative/run-rate");
    vi.stubGlobal("crypto", {});
    await expect(runScenario(vectors.request)).rejects.toThrow("Web Crypto");
  });
});
