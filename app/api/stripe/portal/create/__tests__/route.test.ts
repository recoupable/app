import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import createBillingPortalSession from "@/lib/stripe/createBillingPortalSession";
import { validateHeaders } from "@/lib/chat/validateHeaders";

vi.mock("@/lib/stripe/createBillingPortalSession", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/chat/validateHeaders", () => ({
  validateHeaders: vi.fn(),
}));

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/stripe/portal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

function makeRawBodyRequest(bodyText: string): NextRequest {
  return new Request("http://localhost/api/stripe/portal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyText,
  }) as NextRequest;
}

describe("POST /api/stripe/portal/create", () => {
  const mockCreatePortal = vi.mocked(createBillingPortalSession);
  const mockValidateHeaders = vi.mocked(validateHeaders);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockValidateHeaders.mockResolvedValueOnce({});

    const response = await POST(
      makeRequest({ returnUrl: "https://chat.recoupable.com/settings/billing" }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: "Unauthorized" });
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("returns 400 when returnUrl is invalid", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(makeRequest({ returnUrl: "not-a-url" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain("valid URL");
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(makeRawBodyRequest("{not-json"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: "Invalid JSON body" });
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("forwards Response when validateHeaders returns upstream error", async () => {
    mockValidateHeaders.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "error", message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await POST(
      makeRequest({ returnUrl: "https://chat.recoupable.com/settings/billing" }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Invalid token");
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("returns 400 when returnUrl is missing", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBeDefined();
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("returns 403 for unauthorized accountId override", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(
      makeRequest({
        returnUrl: "https://chat.recoupable.com/settings/billing",
        accountId: "22222222-2222-2222-2222-222222222222",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain("Forbidden");
    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it("returns 200 for authenticated self-account and uses resolved auth accountId", async () => {
    const resolvedAccountId = "11111111-1111-1111-1111-111111111111";
    const mockPortal = { id: "bps_test_123", url: "https://billing.stripe.com/session/123" };

    mockValidateHeaders.mockResolvedValueOnce({ accountId: resolvedAccountId });
    mockCreatePortal.mockResolvedValueOnce(mockPortal as never);

    const response = await POST(
      makeRequest({
        returnUrl: "https://chat.recoupable.com/settings/billing",
        accountId: resolvedAccountId,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: mockPortal });
    expect(mockCreatePortal).toHaveBeenCalledWith(
      resolvedAccountId,
      "https://chat.recoupable.com/settings/billing",
    );
  });

  it("returns 200 omitting optional accountId and uses auth accountId only", async () => {
    const resolvedAccountId = "11111111-1111-1111-1111-111111111111";
    const mockPortal = { id: "bps_test_456", url: "https://billing.stripe.com/session/456" };

    mockValidateHeaders.mockResolvedValueOnce({ accountId: resolvedAccountId });
    mockCreatePortal.mockResolvedValueOnce(mockPortal as never);

    const response = await POST(
      makeRequest({ returnUrl: "https://chat.recoupable.com/settings/billing" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: mockPortal });
    expect(mockCreatePortal).toHaveBeenCalledWith(
      resolvedAccountId,
      "https://chat.recoupable.com/settings/billing",
    );
  });

  it("returns 500 when createBillingPortalSession throws", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });
    mockCreatePortal.mockRejectedValueOnce(new Error("Stripe portal failure"));

    const response = await POST(
      makeRequest({ returnUrl: "https://chat.recoupable.com/settings/billing" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Stripe portal failure");
  });
});
