import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { signGatsbyFlow } from "../gatsby/signGatsbyFlow";
import { verifyGatsbyFlow } from "../gatsby/verifyGatsbyFlow";
beforeEach(() => vi.stubEnv("SITES_GATSBY_FLOW_SECRET", "test-signing-key"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
const origin = "https://app.recoupable.dev";
const release = "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs";
it("binds the fan audience to its server-issued origin and release", () => {
  const flow = signGatsbyFlow(origin, release);
  expect(verifyGatsbyFlow(flow, origin)).toMatchObject({
    audience: "GatsbyWebsite1",
    release,
  });
  expect(() => verifyGatsbyFlow(flow, "https://evil.test")).toThrow();
  expect(() => verifyGatsbyFlow(flow + "tampered", origin)).toThrow();
  expect(() =>
    verifyGatsbyFlow(
      signGatsbyFlow(origin, "https://open.spotify.com/track/other"),
      origin,
    ),
  ).toThrow();
});
it("rejects expired flow contexts", () => {
  vi.useFakeTimers();
  const flow = signGatsbyFlow(origin, release);
  vi.advanceTimersByTime(600001);
  expect(() => verifyGatsbyFlow(flow, origin)).toThrow("Expired flow");
});
