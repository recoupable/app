import { describe, it, expect, vi, beforeEach } from "vitest";
import createClientPaymentMethodSession from "@/lib/billing/createClientPaymentMethodSession";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
const open = vi.fn();
vi.stubGlobal("window", { location: { href: "https://app.recoupable.dev/billing" }, open });

describe("createClientPaymentMethodSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POSTs successUrl to /api/accounts/{id}/payment-method and opens the checkout url", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: "cs_1", url: "https://checkout.stripe.com/c/1" }) });
    const result = await createClientPaymentMethodSession("acct-1", "tok");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/api\/accounts\/acct-1\/payment-method$/);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ successUrl: "https://app.recoupable.dev/billing" });
    expect(open).toHaveBeenCalledWith("https://checkout.stripe.com/c/1", "_blank", "noopener,noreferrer");
    expect(result).toEqual({});
  });

  it("returns an error on a non-OK response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 });
    const result = await createClientPaymentMethodSession("acct-1", "tok");
    expect(result.error).toBeInstanceOf(Error);
    expect(open).not.toHaveBeenCalled();
  });
});
