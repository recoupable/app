import vectors from "./vendor/scenario-vectors.json";
import type { ObjectDescriptor } from "../../../descriptors/schemas";
import type { ScenarioRequest } from "./scenarioTypes";

export const annualFixtureWorkspace = "synthetic:annual-scenario-workspace";
/** Separate annual fixture; never derives measurements from explorer rows. */
export function createAnnualScenarioFixture() {
  const request: ScenarioRequest = structuredClone(vectors.request);
  request.spotify_rate = null;
  const descriptors: ObjectDescriptor[] = request.observations.tracks.map(
    (track) => ({
      ref: {
        workspaceId: annualFixtureWorkspace,
        authority: "fixture",
        kind: "recording",
        id: track.id,
        sourceVersionIds: [track.source_ref],
      },
      label: track.title,
      field: {
        value:
          track.sp_ttm === null
            ? { state: "unknown" }
            : { state: "known", amount: track.sp_ttm },
        role: "observed",
        metric: "annual_spotify_streams",
        unit: track.basis.unit,
        currency: track.basis.currency,
        periodStart: track.basis.period_start,
        periodEnd: track.basis.period_end,
        territory: "unspecified",
        basis: track.basis.cohort_id,
        observedAt: track.captured_at,
      },
    }),
  );
  return { request, descriptors };
}
