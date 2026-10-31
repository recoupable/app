import type { ObjectRef } from "../../../descriptors/schemas";
import { indexDescriptors } from "../../../descriptors/indexDescriptors";
import { resolveSelection } from "../../../descriptors/resolveSelection";
import {
  annualFixtureWorkspace,
  createAnnualScenarioFixture,
} from "./createAnnualScenarioFixture";
import type { ScenarioRequest } from "./scenarioTypes";

/** Resolve exact fixture authority/version before handing observations to Catalog. */
export function buildAnnualScenarioRequest(
  fixture: ReturnType<typeof createAnnualScenarioFixture>,
  selection: readonly ObjectRef[],
  rate: string | null,
): ScenarioRequest {
  const resolved = resolveSelection(
    annualFixtureWorkspace,
    indexDescriptors(fixture.descriptors),
    selection,
  );
  if (resolved.state !== "available" || !resolved.items.length)
    throw new Error("Select available annual fixture recordings to calculate.");
  const value = rate === null ? null : Number(rate);
  if (
    rate !== null &&
    (!rate.trim() ||
      !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rate) ||
      !Number.isFinite(value) ||
      value! < 0)
  )
    throw new Error(
      "Enter a finite, nonnegative USD rate per Spotify stream, or reset to baseline.",
    );
  const ids = new Set(resolved.items.map((item) => item.ref.id));
  const tracks = fixture.request.observations.tracks.filter((track) =>
    ids.has(track.id),
  );
  if (tracks.length !== resolved.items.length)
    throw new Error("Annual fixture selection is unavailable.");
  return {
    ...fixture.request,
    spotify_rate: value,
    observations: {
      ...fixture.request.observations,
      tracks,
      population_complete: false,
      coverage_notes: [
        ...fixture.request.observations.coverage_notes,
        `${tracks.length} selected of ${fixture.request.observations.tracks.length} supplied annual fixture records; not a whole catalog.`,
        "Captured January 2, 2026; current freshness and collection lag unverified. Small counts do not establish statistical significance. Territory unspecified.",
      ],
    },
  };
}
