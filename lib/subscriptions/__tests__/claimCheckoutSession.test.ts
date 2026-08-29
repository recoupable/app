import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimCheckoutSession } from "@/lib/subscriptions/claimCheckoutSession";

const fetchMock = vi.fn();

describe("claimCheckoutSession", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts the session id with the bearer and returns the claimed plan", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", subscription_id: "sub_1", plan: "pro" }),
    });
    const result = await claimCheckoutSession("token", "cs_1");
    expect(result).toEqual({ status: "success", subscription_id: "sub_1", plan: "pro" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/subscriptions\/claim$/);
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer token");
    expect(JSON.parse(init.body)).toEqual({ session_id: "cs_1" });
  });

  it("throws the api's error code so the caller can word the toast", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ status: "error", error: "already_claimed" }),
    });
    await expect(claimCheckoutSession("token", "cs_1")).rejects.toThrow("already_claimed");
  });

  it("falls back to the status when the body has no code", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    await expect(claimCheckoutSession("token", "cs_1")).rejects.toThrow("HTTP 404");
  });
});
