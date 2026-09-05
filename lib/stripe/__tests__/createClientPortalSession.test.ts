// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";

const fetchMock = vi.fn();
const ACCOUNT_ID = "5d2be75b-b49b-4c2a-ac0a-63d812430dda";

describe("createClientPortalSession", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn());
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://stripe.test/p" }),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts to the account-scoped portal path with the returnUrl body", async () => {
    await createClientPortalSession("token", ACCOUNT_ID);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(new RegExp(`/api/accounts/${ACCOUNT_ID}/portal$`));
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token",
    });
    expect(JSON.parse(init.body as string)).toEqual({
      returnUrl: window.location.href,
    });
  });

  it("opens the returned portal URL", async () => {
    await createClientPortalSession("token", ACCOUNT_ID);
    expect(window.open).toHaveBeenCalledWith(
      "https://stripe.test/p",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("returns the error on a rejected request, a missing url, or a network failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    expect(
      (await createClientPortalSession("token", ACCOUNT_ID))?.error,
    ).toBeInstanceOf(Error);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    expect(
      (await createClientPortalSession("token", ACCOUNT_ID))?.error,
    ).toBeInstanceOf(Error);
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(
      (await createClientPortalSession("token", ACCOUNT_ID))?.error,
    ).toBeInstanceOf(TypeError);
    expect(window.open).not.toHaveBeenCalled();
  });
});
