// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.test",
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("createClientCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "https://chat.test/current" },
      writable: true,
    });
  });

  it("navigates same-tab to the checkout URL instead of window.open", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://checkout.stripe.com/session-1" }),
    });

    const result = await createClientCheckoutSession("token-1");

    expect(result).toBeUndefined();
    expect(window.location.href).toBe("https://checkout.stripe.com/session-1");
  });

  it("returns an error for non-ok responses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await createClientCheckoutSession("token-1");

    expect(result?.error).toBeInstanceOf(Error);
    expect(window.location.href).toBe("https://chat.test/current");
  });

  it("returns an error when the checkout URL is missing", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    const result = await createClientCheckoutSession("token-1");

    expect(result?.error).toBeInstanceOf(Error);
  });

  it("returns an error when fetch rejects", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await createClientCheckoutSession("token-1");

    expect(result?.error).toBeInstanceOf(Error);
  });
});
