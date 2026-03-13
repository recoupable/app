import { NextRequest } from "next/server";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { getCorsHeaders } from "@/lib/chat/getCorsHeaders";
import { serializeError } from "@/lib/errors/serializeError";

export type HeaderValidationResult = {
  accountId?: string;
  accessToken?: string;
};

/**
 * Validates auth headers and, if present, resolves the accountId
 * by calling GET /api/accounts/id on the agent API.
 *
 * If no auth headers are present, returns an empty result and does nothing.
 * On error, returns a Response to be sent directly from the route handler.
 *
 * @param request
 */
export async function validateHeaders(
  request: NextRequest,
): Promise<HeaderValidationResult | Response> {
  const hasAuthHeader = request.headers.has("authorization") || request.headers.has("x-api-key");

  if (!hasAuthHeader) {
    return {};
  }

  try {
    const headers = new Headers();
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");

    if (authHeader) {
      headers.set("authorization", authHeader);
    }
    if (apiKeyHeader) {
      headers.set("x-api-key", apiKeyHeader);
    }

    headers.set("Content-Type", "application/json");

    const response = await fetch(`${NEW_API_BASE_URL}/api/accounts/id`, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (!response.ok || result.status !== "success" || !result.accountId) {
      return new Response(JSON.stringify(result), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        },
      });
    }

    // Return accountId and access token for MCP auth
    const accessToken = apiKeyHeader || authHeader?.replace(/^Bearer\s+/i, "");
    return { accountId: result.accountId as string, accessToken };
  } catch (e) {
    console.error("💬 validateHeaders accountId lookup error:", e);
    return new Response(JSON.stringify(serializeError(e)), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(),
      },
    });
  }
}
