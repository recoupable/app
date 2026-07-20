import { describe, expect, it } from "vitest";
import { getSocialFollowerCount } from "@/lib/onboarding/getSocialFollowerCount";

describe("getSocialFollowerCount", () => {
  it("reads the API's snake_case follower_count", () => {
    expect(getSocialFollowerCount({ follower_count: 1200 })).toBe(1200);
  });

  it("falls back to the camelCase followerCount used by chat types", () => {
    expect(getSocialFollowerCount({ followerCount: 88 })).toBe(88);
  });

  it("prefers snake_case when both are present", () => {
    expect(
      getSocialFollowerCount({ follower_count: 5, followerCount: 9 }),
    ).toBe(5);
  });

  it("returns null when neither field is a number", () => {
    expect(getSocialFollowerCount({})).toBeNull();
    expect(getSocialFollowerCount({ follower_count: null })).toBeNull();
  });
});
