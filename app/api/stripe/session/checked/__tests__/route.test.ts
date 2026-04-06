import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { GET } from "../route";
import { validateHeaders } from "@/lib/chat/validateHeaders";
import stripeClient from "@/lib/stripe/client";

vi.mock("@/lib/chat/validateHeaders", () => ({
  validateHeaders: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  default: {
    checkout: {
      sessions: {
        update: vi.fn(),
      },
    },
  },
}));

const AUTH_ACCOUNT_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_ACCOUNT_ID = "223e4567-e89b-12d3-a456-426614174000";

const mockedValidateHeaders = vi.mocked(validateHeaders);
const mockedSessionUpdate = vi.mocked(stripeClient.checkout.sessions.update);

function request(url: string) {
  return new NextRequest(url);
}

function invalidRequestError(
  overrides: Partial<Stripe.StripeRawError> & { message: string },
) {
  return Stripe.errors.StripeError.generate({
    type: "invalid_request_error",
    message: overrides.message,
    statusCode: overrides.statusCode,
    code: overrides.code,
    ...overrides,
  } as Stripe.StripeRawError & { type: "invalid_request_error" });
}

describe("GET /api/stripe/session/checked", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockedValidateHeaders.mockResolvedValue({ accountId: AUTH_ACCOUNT_ID });
    mockedSessionUpdate.mockResolvedValue({
      id: "cs_test_123",
    } as unknown as Stripe.Checkout.Session);
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
  });

  it("returns 401 when there is no Authorization or x-api-key header", async () => {
    mockedValidateHeaders.mockResolvedValueOnce({});

    const res = await request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_test`,
    );
    const out = await GET(res);

    expect(out.status).toBe(401);
    await expect(out.json()).resolves.toEqual({ message: "Unauthorized" });
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns validateHeaders Response unchanged (e.g. upstream 401)", async () => {
    const upstream = new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
    mockedValidateHeaders.mockResolvedValueOnce(upstream);

    const req = request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_test`,
    );
    req.headers.set("Authorization", "Bearer bad");

    const out = await GET(req);

    expect(out).toBe(upstream);
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns validateHeaders 500 Response when account lookup fails", async () => {
    const upstream = new Response(JSON.stringify({ message: "lookup failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
    mockedValidateHeaders.mockResolvedValueOnce(upstream);

    const req = request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_test`,
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(500);
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 401 when validateHeaders returns success shape without accountId", async () => {
    mockedValidateHeaders.mockResolvedValueOnce({
      accountId: undefined,
      accessToken: "t",
    });

    const req = request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_test`,
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(401);
    await expect(out.json()).resolves.toEqual({ message: "Unauthorized" });
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when sessionId is missing", async () => {
    const req = request("http://localhost/api/stripe/session/checked");
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(400);
    await expect(out.json()).resolves.toEqual({
      message: "sessionId is required",
    });
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when sessionId is only whitespace", async () => {
    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=%20%20",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(400);
    await expect(out.json()).resolves.toEqual({
      message: "sessionId is required",
    });
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when accountId query is not a valid UUID", async () => {
    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_test&accountId=not-a-uuid",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(400);
    const body = await out.json();
    expect(body.message).toContain("accountId");
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 403 when accountId query does not match authenticated account", async () => {
    const req = request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_test&accountId=${OTHER_ACCOUNT_ID}`,
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(403);
    await expect(out.json()).resolves.toEqual({
      message: "Forbidden: accountId does not match authenticated account",
    });
    expect(mockedSessionUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 and updates Stripe when authenticated without accountId query", async () => {
    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_test_abc",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(200);
    const body = await out.json();
    expect(body.data).toEqual({ id: "cs_test_123" });
    expect(mockedSessionUpdate).toHaveBeenCalledTimes(1);
    expect(mockedSessionUpdate).toHaveBeenCalledWith("cs_test_abc", {
      metadata: {
        credit_updated: "credit_updated",
        accountId: AUTH_ACCOUNT_ID,
      },
    });
  });

  it("returns 200 when optional accountId query matches authenticated account", async () => {
    const req = request(
      `http://localhost/api/stripe/session/checked?sessionId=cs_ok&accountId=${AUTH_ACCOUNT_ID}`,
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(200);
    expect(mockedSessionUpdate).toHaveBeenCalledWith("cs_ok", {
      metadata: {
        credit_updated: "credit_updated",
        accountId: AUTH_ACCOUNT_ID,
      },
    });
  });

  it("treats empty accountId query as omitted", async () => {
    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_x&accountId=",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(200);
    expect(mockedSessionUpdate).toHaveBeenCalledWith("cs_x", {
      metadata: {
        credit_updated: "credit_updated",
        accountId: AUTH_ACCOUNT_ID,
      },
    });
  });

  it("returns 404 for StripeInvalidRequestError with resource_missing", async () => {
    mockedSessionUpdate.mockRejectedValueOnce(
      invalidRequestError({
        message: "No such checkout.session",
        code: "resource_missing",
        statusCode: 404,
      }),
    );

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_missing",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(404);
    await expect(out.json()).resolves.toEqual({
      message: "No such checkout.session",
    });
  });

  it("returns 404 for StripeInvalidRequestError with statusCode 404", async () => {
    mockedSessionUpdate.mockRejectedValueOnce(
      invalidRequestError({
        message: "Not found",
        statusCode: 404,
      }),
    );

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_nf",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(404);
  });

  it("returns 400 for other StripeInvalidRequestError", async () => {
    mockedSessionUpdate.mockRejectedValueOnce(
      invalidRequestError({
        message: "Invalid session state",
        statusCode: 400,
      }),
    );

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_bad",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(400);
    await expect(out.json()).resolves.toEqual({
      message: "Invalid session state",
    });
  });

  it("returns 401 for Stripe authentication errors", async () => {
    const authErr = Stripe.errors.StripeError.generate({
      type: "authentication_error",
      message: "Invalid API Key",
      statusCode: 401,
    } as Stripe.StripeRawError & { type: "authentication_error" });

    mockedSessionUpdate.mockRejectedValueOnce(authErr);

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_auth",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(401);
    await expect(out.json()).resolves.toEqual({ message: "Invalid API Key" });
  });

  it("returns 403 for Stripe permission errors with statusCode 403", async () => {
    const permErr = Stripe.errors.StripeError.generate({
      type: "invalid_request_error",
      message: "Permission denied",
      statusCode: 403,
    } as Stripe.StripeRawError & { type: "invalid_request_error" });

    mockedSessionUpdate.mockRejectedValueOnce(permErr);

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_perm",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(403);
    await expect(out.json()).resolves.toEqual({ message: "Permission denied" });
  });

  it("returns 429 for Stripe rate limit errors", async () => {
    const rateErr = Stripe.errors.StripeError.generate({
      type: "rate_limit_error",
      message: "Too many requests",
      statusCode: 429,
    } as Stripe.StripeRawError & { type: "rate_limit_error" });

    mockedSessionUpdate.mockRejectedValueOnce(rateErr);

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_rl",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(429);
    await expect(out.json()).resolves.toEqual({ message: "Too many requests" });
  });

  it("returns 500 for Stripe connection errors without a 4xx statusCode", async () => {
    const connErr = new Stripe.errors.StripeConnectionError({
      message: "Connection failed",
      type: "api_connection_error",
    });

    mockedSessionUpdate.mockRejectedValueOnce(connErr);

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_conn",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(500);
    await expect(out.json()).resolves.toEqual({
      message: "Connection failed",
    });
  });

  it("returns 500 for Stripe API errors without a 4xx statusCode", async () => {
    const apiErr = Stripe.errors.StripeError.generate({
      type: "api_error",
      message: "Stripe is down",
      statusCode: 502,
    } as Stripe.StripeRawError & { type: "api_error" });

    mockedSessionUpdate.mockRejectedValueOnce(apiErr);

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_api",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(500);
    await expect(out.json()).resolves.toEqual({ message: "Stripe is down" });
  });

  it("returns 500 for non-Stripe errors", async () => {
    mockedSessionUpdate.mockRejectedValueOnce(new Error("unexpected"));

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_err",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(500);
    await expect(out.json()).resolves.toEqual({ message: "unexpected" });
  });

  it("returns 500 for unknown thrown values", async () => {
    mockedSessionUpdate.mockRejectedValueOnce("string-throw");

    const req = request(
      "http://localhost/api/stripe/session/checked?sessionId=cs_u",
    );
    req.headers.set("Authorization", "Bearer token");

    const out = await GET(req);

    expect(out.status).toBe(500);
    await expect(out.json()).resolves.toEqual({ message: "failed" });
  });
});
