// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const fetchMock = vi.fn();

describe("createClientCheckoutSession", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn());
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ url: "https://stripe.test/c" }) });
  });
  afterEach(() => vi.unstubAllGlobals());

  const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it("omits plan by default, so today's strict api schema still accepts the body", async () => {
    await createClientCheckoutSession("token");
    expect(sentBody()).toEqual({ successUrl: window.location.href });
  });

  it("sends plan when a plan is chosen", async () => {
    await createClientCheckoutSession("token", { plan: "starter" });
    expect(sentBody()).toEqual({ successUrl: window.location.href, plan: "starter" });
  });

  it("opens the returned checkout URL", async () => {
    await createClientCheckoutSession("token", { plan: "pro" });
    expect(window.open).toHaveBeenCalledWith("https://stripe.test/c", "_blank", "noopener,noreferrer");
  });
});
