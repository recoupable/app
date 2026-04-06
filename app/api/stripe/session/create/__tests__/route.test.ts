import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import createSession from "@/lib/stripe/createSession";
import { validateHeaders } from "@/lib/chat/validateHeaders";

vi.mock("@/lib/stripe/createSession", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/chat/validateHeaders", () => ({
  validateHeaders: vi.fn(),
}));

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/stripe/session/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/stripe/session/create", () => {
  const mockCreateSession = vi.mocked(createSession);
  const mockValidateHeaders = vi.mocked(validateHeaders);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockValidateHeaders.mockResolvedValueOnce({});

    const response = await POST(makeRequest({ successUrl: "https://chat.recoupable.com/success" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: "Unauthorized" });
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 400 when successUrl is invalid", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(makeRequest({ successUrl: "not-a-url" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain("valid URL");
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 403 for unauthorized accountId override", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });

    const response = await POST(
      makeRequest({
        successUrl: "https://chat.recoupable.com/success",
        accountId: "22222222-2222-2222-2222-222222222222",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain("Forbidden");
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 200 for authenticated self-account and uses resolved auth accountId", async () => {
    const resolvedAccountId = "11111111-1111-1111-1111-111111111111";
    const mockSession = { id: "cs_test_123", url: "https://checkout.stripe.com/session/123" };

    mockValidateHeaders.mockResolvedValueOnce({ accountId: resolvedAccountId });
    mockCreateSession.mockResolvedValueOnce(mockSession as never);

    const response = await POST(
      makeRequest({
        successUrl: "https://chat.recoupable.com/success",
        accountId: resolvedAccountId,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: mockSession });
    expect(mockCreateSession).toHaveBeenCalledWith(
      resolvedAccountId,
      "https://chat.recoupable.com/success",
    );
  });

  it("returns 500 when createSession throws", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "11111111-1111-1111-1111-111111111111" });
    mockCreateSession.mockRejectedValueOnce(new Error("Stripe failure"));

    const response = await POST(makeRequest({ successUrl: "https://chat.recoupable.com/success" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Stripe failure");
  });
});
