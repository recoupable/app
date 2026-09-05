// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const fetchMock = vi.fn();

describe("createClientCheckoutSession", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn());
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://stripe.test/c" }),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it("omits plan by default, so today's strict api schema still accepts the body", async () => {
    await createClientCheckoutSession("token");
    expect(sentBody()).toEqual({ successUrl: window.location.href });
  });

  it("omits plan for Pro too: Pro is the api's default and an older api rejects the field", async () => {
    await createClientCheckoutSession("token", { plan: "pro" });
    expect(sentBody()).toEqual({ successUrl: window.location.href });
  });

  it("sends plan for Starter", async () => {
    await createClientCheckoutSession("token", { plan: "starter" });
    expect(sentBody()).toEqual({
      successUrl: window.location.href,
      plan: "starter",
    });
  });

  it("opens the returned checkout URL", async () => {
    await createClientCheckoutSession("token", { plan: "pro" });
    expect(window.open).toHaveBeenCalledWith(
      "https://stripe.test/c",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("returns the error on a rejected request, a missing url, or a network failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "plan must be starter or pro" }),
    });
    expect(
      ((await createClientCheckoutSession("token"))?.error as Error).message,
    ).toBe("plan must be starter or pro");
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    expect((await createClientCheckoutSession("token"))?.error).toBeInstanceOf(
      Error,
    );
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect((await createClientCheckoutSession("token"))?.error).toBeInstanceOf(
      TypeError,
    );
    expect(window.open).not.toHaveBeenCalled();
  });
});
