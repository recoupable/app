// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";
import { API_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

const fetchMock = vi.fn();
const initialUrl = window.location.href;

describe("createClientCheckoutSession", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn());
    window.history.replaceState(null, "", "/billing?checkout=return#plans");
    window.sessionStorage.setItem(
      API_OVERRIDE_STORAGE_KEY,
      "https://recoup.invalid",
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://recoup.invalid/checkout" }),
    });
  });
  afterEach(() => {
    window.history.replaceState(null, "", initialUrl);
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it("omits plan by default, so today's strict api schema still accepts the body", async () => {
    await createClientCheckoutSession("token");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://recoup.invalid/api/subscriptions/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({ successUrl: window.location.href }),
      },
    );
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
    expect(
      await createClientCheckoutSession("token", { plan: "pro" }),
    ).toBeUndefined();
    expect(window.open).toHaveBeenCalledExactlyOnceWith(
      "https://recoup.invalid/checkout",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["empty string", ""],
    ["zero", 0],
    ["positive number", 42],
    ["false", false],
    ["true", true],
    ["empty array", []],
    ["nonempty array", ["https://recoup.invalid/checkout"]],
    ["empty object", {}],
    ["nonempty object", { url: "https://recoup.invalid/checkout" }],
  ])(
    "rejects a %s checkout URL from JSON without opening a window",
    async (_, url) => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ url }), { status: 200 }),
      );

      const result = await createClientCheckoutSession("token");

      expect(result?.error).toEqual(new Error("Checkout URL missing"));
      expect(window.open).not.toHaveBeenCalled();
    },
  );

  it("returns a JSON parsing error without opening a window", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));

    const result = await createClientCheckoutSession("token");

    expect(result?.error).toBeInstanceOf(SyntaxError);
    expect(window.open).not.toHaveBeenCalled();
  });

  it("uses the HTTP status when a rejected response has no JSON error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 502 }));

    const result = await createClientCheckoutSession("token");

    expect(result?.error).toEqual(new Error("HTTP 502"));
    expect(window.open).not.toHaveBeenCalled();
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
