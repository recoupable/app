import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClientCheckoutSession from "../createClientCheckoutSession";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("createClientCheckoutSession", () => {
  const mockOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
    vi.stubGlobal("window", { open: mockOpen } as unknown as Window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("POSTs only successUrl to recoup-api with Bearer auth and opens checkout url", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "cs_test_1",
        url: "https://checkout.stripe.com/test",
      }),
    }) as unknown as typeof fetch;

    await createClientCheckoutSession(
      "privy-token",
      "https://chat.recoupable.com/billing",
    );

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/subscriptions/sessions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer privy-token",
        },
      }),
    );
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      successUrl: "https://chat.recoupable.com/billing",
    });
    expect(mockOpen).toHaveBeenCalledWith(
      "https://checkout.stripe.com/test",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("does not open a window and returns error when response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ error: "Unauthorized" }),
    }) as unknown as typeof fetch;

    const result = await createClientCheckoutSession("bad-token", "https://ex.com");

    expect(mockOpen).not.toHaveBeenCalled();
    expect(result).toEqual({ error: expect.any(Error) });
  });
});
