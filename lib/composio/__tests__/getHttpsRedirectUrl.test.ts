import { describe, expect, it } from "vitest";
import { getHttpsRedirectUrl } from "@/lib/composio/getHttpsRedirectUrl";

describe("getHttpsRedirectUrl", () => {
  it.each([
    "http://connect.example.test/authorize",
    "ftp://connect.example.test/authorize",
    "javascript:void(0)",
    "data:text/html,synthetic",
    "//connect.example.test/authorize",
    "/authorize",
    "not a connection URL",
    "",
    null,
    undefined,
    123,
    {},
  ])("rejects an unusable authorization destination: %j", (value) => {
    expect(getHttpsRedirectUrl(value)).toBeUndefined();
  });

  it("preserves an HTTPS URL and its encoded authorization parameters", () => {
    const url =
      "https://connect.example.test/authorize?state=synthetic%2Bstate&return_to=%2Fnotes";
    expect(getHttpsRedirectUrl(url)).toBe(url);
  });

  it("returns a canonical absolute HTTPS destination", () => {
    expect(getHttpsRedirectUrl("HTTPS://CONNECT.EXAMPLE.TEST")).toBe(
      "https://connect.example.test/",
    );
  });
});
