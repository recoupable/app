// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.test",
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("createClientPortalSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "https://chat.test/current" },
      writable: true,
    });
  });

  it("navigates same-tab to the portal URL instead of window.open", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://billing.stripe.com/portal-1" }),
    });

    const result = await createClientPortalSession("token-1");

    expect(result).toBeUndefined();
    expect(window.location.href).toBe("https://billing.stripe.com/portal-1");
  });

  it("returns an error for non-ok responses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await createClientPortalSession("token-1");

    expect(result?.error).toBeInstanceOf(Error);
    expect(window.location.href).toBe("https://chat.test/current");
  });

  it("returns an error when the portal URL is missing", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    const result = await createClientPortalSession("token-1");

    expect(result?.error).toBeInstanceOf(Error);
  });
});
