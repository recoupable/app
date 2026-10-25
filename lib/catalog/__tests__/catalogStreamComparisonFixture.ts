// Synthetic values following API getCatalogStreams at 251ab004; no provider execution.
export const catalogStreamComparisonFixture = {
  catalog_id: "11111111-1111-4111-8111-111111111111",
  provider: "luminate",
  platform: "all_dsps",
  territory: "worldwide",
  metric: "daily_streams",
  semantics:
    "Source-reported daily aggregate streams across reporting services; not Spotify-only or royalty statements",
  source_updated_at: null,
  latest_run: null,
  periods: {
    previous: { start: "2026-10-01", end_exclusive: "2026-10-02" },
    current: { start: "2026-10-02", end_exclusive: "2026-10-03" },
    days: 1,
    timezone: "UTC",
  },
  pagination: { page: 1, limit: 25, total_count: 100, has_more: true },
  summary_scope: "page",
  recordings: [
    {
      isrc: "SYNTHETIC001",
      name: "Synthetic recording",
      latest_attempt: null,
      provider_recording_id: "synthetic-provider-recording",
      retrieved_at: "2026-10-04T00:00:00Z",
      days: [
        { date: "2026-10-01", streams: 100 },
        { date: "2026-10-02", streams: 125 },
      ],
      state: "comparable",
      missing_days: [],
      previous_streams: 100,
      current_streams: 125,
      absolute_growth: 25,
      percentage_growth: 25,
      zero_baseline: false,
    },
  ],
};
