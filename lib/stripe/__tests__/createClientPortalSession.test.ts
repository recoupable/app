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
    Object.defineProperty(window, "location", {
      value: { href: "https://app.recoupable.dev/billing", assign: vi.fn() },
      writable: true,
      configurable: true,
    });
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

  it("navigates this tab to the returned portal URL (a new tab after an await gets popup-blocked)", async () => {
    await createClientPortalSession("token", ACCOUNT_ID);
    expect(window.location.assign).toHaveBeenCalledWith(
      "https://stripe.test/p",
    );
    expect(window.open).not.toHaveBeenCalled();
  });

  it("returns the error on a rejected request, a missing url, or a network failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "No active subscription found" }),
    });
    expect(
      ((await createClientPortalSession("token", ACCOUNT_ID))?.error as Error)
        .message,
    ).toBe("No active subscription found");
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    expect(
      (await createClientPortalSession("token", ACCOUNT_ID))?.error,
    ).toBeInstanceOf(Error);
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(
      (await createClientPortalSession("token", ACCOUNT_ID))?.error,
    ).toBeInstanceOf(TypeError);
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
