import { describe, it, expect, vi, beforeEach } from "vitest";
import createClientPaymentMethodSession from "@/lib/billing/createClientPaymentMethodSession";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
const assign = vi.fn();
vi.stubGlobal("window", {
  location: { href: "https://app.recoupable.dev/billing", assign },
});

describe("createClientPaymentMethodSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POSTs successUrl with the bearer and navigates this tab to the checkout url", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cs_1",
        url: "https://checkout.stripe.com/c/1",
      }),
    });
    const result = await createClientPaymentMethodSession("acct-1", "tok");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/api\/accounts\/acct-1\/payment-method$/);
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(options.body)).toEqual({
      successUrl: "https://app.recoupable.dev/billing",
    });
    expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/1");
    expect(result).toEqual({});
  });

  it("returns the api's error message on a non-OK response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Access denied to specified account_id" }),
    });
    const result = await createClientPaymentMethodSession("acct-1", "tok");
    expect((result.error as Error).message).toBe(
      "Access denied to specified account_id",
    );
    expect(assign).not.toHaveBeenCalled();
  });
});
