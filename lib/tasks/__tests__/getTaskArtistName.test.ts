import { describe, expect, it } from "vitest";
import { getTaskArtistName } from "@/lib/tasks/getTaskArtistName";

// The Schedules tab is account-wide, so each row names its artist
// (chat#2006 item 6). Names come from the roster already in the provider.
describe("getTaskArtistName", () => {
  const roster = [
    { account_id: "art-1", name: "Braden Bales" },
    { account_id: "art-2", name: "Brauxelion" },
  ];

  it("resolves the task's artist from the roster", () => {
    expect(getTaskArtistName({ artist_account_id: "art-2" }, roster)).toBe(
      "Brauxelion",
    );
  });

  it("is null when the artist is not on the roster (or the roster is empty)", () => {
    expect(
      getTaskArtistName({ artist_account_id: "art-9" }, roster),
    ).toBeNull();
    expect(getTaskArtistName({ artist_account_id: "art-1" }, [])).toBeNull();
  });
});
