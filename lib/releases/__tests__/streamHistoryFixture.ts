export const period = { since: "2026-10-02", days: 7 };
export const createPage = (index: number, count = 26) => ({
  catalog_id: "catalog",
  provider: "luminate",
  platform: "all_dsps",
  territory: "worldwide",
  metric: "daily_streams",
  periods: {
    previous: { start: "2026-09-25", end_exclusive: "2026-10-02" },
    current: { start: "2026-10-02", end_exclusive: "2026-10-09" },
    days: 7,
    timezone: "UTC",
  },
  pagination: {
    page: index,
    total_count: count,
    has_more: index === 1 && count > 25,
  },
  recordings: Array.from(
    { length: index === 1 ? Math.min(count, 25) : count - 25 },
    (_, i) => ({
      isrc: `recording-${(index - 1) * 25 + i}`,
      state: "incomplete",
      provider_recording_id: null,
      retrieved_at: null,
      days: [],
    }),
  ),
});
