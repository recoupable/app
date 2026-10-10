import { getReleaseStreamIdentities } from "./getReleaseStreamIdentities";
import type { ReleaseCase } from "./types";
import type { StreamHistory, StreamPoint } from "./streamTypes";

/** Preserve unknown identities and missing dates as gaps, with one contribution per unique ISRC. */
export function buildReleaseStreamSeries(
  current: ReleaseCase,
  history: StreamHistory,
  selectedIsrc?: string,
) {
  const identities = getReleaseStreamIdentities(current);
  const isrcs = [
    ...new Set(identities.flatMap((track) => (track.isrc ? [track.isrc] : []))),
  ];
  const expected = selectedIsrc ? [selectedIsrc] : isrcs;
  const unknownIdentity =
    !selectedIsrc &&
    (identities.some((track) => !track.isrc) ||
      current.track_page.hasMore ||
      identities.length === 0);
  const records = new Map(
    history.recordings.map((recording) => [recording.isrc, recording]),
  );
  const byIsrc = new Map(
    expected.map((isrc) => {
      const recording = records.get(isrc);
      const days = new Map<string, number | null>();
      if (
        recording?.provider_recording_id &&
        recording.state !== "invalid_observation"
      ) {
        for (const row of recording.days)
          days.set(row.date, days.has(row.date) ? null : row.streams);
      }
      return [isrc, days] as const;
    }),
  );
  const start = Date.parse(`${history.periods.previous.start}T00:00:00Z`);
  const points: StreamPoint[] = Array.from(
    { length: history.periods.days * 2 },
    (_, i) => {
      const date = new Date(start + i * 86400000).toISOString().slice(0, 10);
      const values = expected.map((isrc) => byIsrc.get(isrc)?.get(date));
      const observedTracks = values.filter((value) => value != null).length;
      const sum = values.reduce<number>(
        (total, value) => total + (value ?? 0),
        0,
      );
      return {
        date,
        observedTracks,
        streams:
          !unknownIdentity &&
          expected.length > 0 &&
          observedTracks === expected.length &&
          Number.isSafeInteger(sum)
            ? sum
            : null,
      };
    },
  );
  const total = (rows: StreamPoint[]) => {
    if (rows.some((row) => row.streams === null)) return null;
    const sum = rows.reduce((sum, row) => sum + row.streams!, 0);
    return Number.isSafeInteger(sum) ? sum : null;
  };
  const previous = total(points.slice(0, history.periods.days));
  const daily = points.slice(history.periods.days);
  const latest =
    expected
      .flatMap((isrc) =>
        records.get(isrc)?.retrieved_at
          ? [records.get(isrc)!.retrieved_at!]
          : [],
      )
      .sort()
      .at(-1) ?? null;
  const currentTotal = total(daily);
  return {
    selectedIsrc,
    tracks: identities,
    daily,
    previous,
    total: currentTotal,
    growth:
      previous != null && currentTotal != null ? currentTotal - previous : null,
    percentage:
      previous != null && previous > 0 && currentTotal != null
        ? ((currentTotal - previous) / previous) * 100
        : null,
    matchedTracks: isrcs.filter((isrc) => records.has(isrc)).length,
    uniqueTracks: isrcs.length,
    unknownIdentity,
    latestCollected: latest,
    missingDays: daily.filter((point) => point.streams === null).length,
  };
}
