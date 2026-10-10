import { expect, it } from "vitest";
import { streamHistorySchema } from "../streamTypes";
import { createPage } from "./streamHistoryFixture";
it.each(["2026-02-31", "2026-13-01", "2026-00-01", "2026-02-29"])(
  "rejects impossible calendar date %s",
  (date) => {
    const input = createPage(1, 1);
    input.periods.current.start = date;
    expect(streamHistorySchema.safeParse(input).success).toBe(false);
  },
);
it("accepts leap-day observations and genuine zero streams", () => {
  const input = createPage(1, 0);
  const result = streamHistorySchema.safeParse({
    ...input,
    recordings: [
      {
        isrc: "USABC2600001",
        provider_recording_id: "a",
        retrieved_at: null,
        state: "incomplete",
        days: [{ date: "2024-02-29", streams: 0 }],
      },
    ],
  });
  expect(result.success).toBe(true);
});

it("rejects noncontiguous or unequal comparison periods", () => {
  const input = createPage(1, 0);
  input.periods.previous.start = "2026-09-24";
  expect(streamHistorySchema.safeParse(input).success).toBe(false);
  input.periods.previous.start = "2026-09-25";
  input.periods.current.end_exclusive = "2026-10-10";
  expect(streamHistorySchema.safeParse(input).success).toBe(false);
});
